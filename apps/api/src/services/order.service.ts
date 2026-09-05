import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { PaymentService } from './payment.service';
import { env } from '../config/env';

export class OrderService {
  /**
   * Initiate Checkout: Validates inventory stock, creates Razorpay Order & Pending DB Order
   */
  static async checkout(userId: string, addressId: string) {
    // 1. Fetch Cart with Product relations
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cannot checkout with an empty cart', 400);
    }

    // 2. Validate Shipping Address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new AppError('Invalid shipping address selected', 400);
    }

    // 3. Real-Time Stock & Availability Validation
    for (const item of cart.items) {
      if (item.product.status !== 'ACTIVE') {
        throw new AppError(`Product "${item.product.name}" is no longer available in catalog`, 400);
      }
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `Insufficient inventory for "${item.product.name}". Available stock: ${item.product.stock}, requested: ${item.quantity}`,
          400
        );
      }
    }

    // 4. Calculate Subtotal with Historical Price Snapshots
    let totalAmount = 0;
    const orderItemsData = cart.items.map((item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      const itemSubtotal = unitPrice * item.quantity;
      totalAmount += itemSubtotal;

      return {
        productId: item.productId,
        vendorId: item.product.vendorId,
        productName: item.product.name,
        productImage: item.product.images[0] || null,
        quantity: item.quantity,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        status: 'PENDING' as const,
      };
    });

    // 5. Create Razorpay Test Order
    const receipt = `rcpt_${Date.now()}`;
    const rzpOrder = await PaymentService.createRazorpayOrder(totalAmount, receipt);

    // 6. Persist Pending Order & OrderItems in Database
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        razorpayOrderId: rzpOrder.id,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
        address: true,
      },
    });

    return {
      order,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount, // in paise
      currency: 'INR',
    };
  }

  /**
   * Verify Payment & Confirm Order (Atomic Stock Decrement & Cart Clearance)
   */
  static async verifyAndConfirmPayment(
    userId: string,
    data: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

    // 1. Fetch Order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found or unauthorized', 404);
    }

    if (order.paymentStatus === 'PAID') {
      return order; // Idempotent: already confirmed
    }

    // 2. Cryptographically Verify Signature
    const isValid = PaymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      // Record failed payment
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          status: 'FAILED',
          transactionId: razorpayPaymentId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      throw new AppError('Payment signature verification failed. Invalid transaction.', 400);
    }

    // 3. Atomically Deduct Inventory for each Order Item
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 4. Update Order and Items to CONFIRMED / PAID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
      },
      include: {
        orderItems: {
          include: {
            product: true,
            vendor: true,
          },
        },
        address: true,
      },
    });

    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { status: 'CONFIRMED' },
    });

    // 5. Create Confirmed Payment Record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        status: 'PAID',
        transactionId: razorpayPaymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // 6. Clear Customer Shopping Cart
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId,
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Get Customer's Order History
   */
  static async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            vendor: {
              select: { id: true, businessName: true, slug: true },
            },
            reviews: true,
          },
        },
        address: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get Single Order Details by ID with strict Customer Ownership Verification
   */
  static async getOrderById(userId: string, orderId: string) {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new AppError('Invalid order ID format', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            vendor: {
              select: { id: true, businessName: true, slug: true, phone: true, businessAddress: true },
            },
            reviews: true,
          },
        },
        address: true,
        payments: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new AppError('Unauthorized: You do not have permission to view this order', 403);
    }

    return order;
  }

  /**
   * Get Customer Account Statistics and Metrics
   */
  static async getCustomerDashboardStats(userId: string) {
    const [orders, addressCount, wishlist, cart] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              vendor: { select: { id: true, businessName: true, slug: true } },
              reviews: true,
            },
          },
          address: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.address.count({ where: { userId } }),
      prisma.wishlist.findUnique({
        where: { userId },
        include: { items: true },
      }),
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      }),
    ]);

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrdersCount = orders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
    ).length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const wishlistCount = wishlist?.items.length ?? 0;
    const cartItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return {
      totalOrders,
      totalSpent,
      activeOrdersCount,
      deliveredOrdersCount,
      savedAddressesCount: addressCount,
      wishlistCount,
      cartItemsCount,
      recentOrders: orders.slice(0, 5),
    };
  }

  /**
   * Get Vendor's Order Items (Enforcing strict Vendor Isolation)
   */
  static async getVendorOrderItems(vendorId: string) {
    return prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
            address: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        product: {
          select: { id: true, name: true, sku: true, images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update Vendor Order Item Status (Enforcing Vendor Ownership)
   */
  static async updateVendorOrderItemStatus(
    vendorId: string,
    orderItemId: string,
    newStatus: 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  ) {
    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!item) {
      throw new AppError('Order item not found', 404);
    }

    if (item.vendorId !== vendorId) {
      throw new AppError('Unauthorized: You do not have permission to modify this order item', 403);
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: newStatus },
    });

    return updatedItem;
  }
}
