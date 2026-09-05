export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  _count?: { products: number };
}

export interface VendorSummary {
  id: string;
  businessName: string;
  slug: string;
  description?: string;
  businessAddress?: string;
  phone?: string;
  rating?: number;
  status?: string;
  productCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  user?: { name: string };
  productId: string;
  orderItemId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku?: string | null;
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED';
  isFeatured?: boolean;
  rating: number;
  numReviews: number;
  vendorId?: string;
  categoryId?: string;
  brandId?: string | null;
  vendor?: VendorSummary;
  category?: Category;
  brand?: Brand | null;
  reviews?: Review[];
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  isAvailable: boolean;
  isLowStock: boolean;
  itemTotal: number;
}

export interface CartData {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt?: string;
}

export interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type OrderItemStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  productName?: string;
  productImage?: string;
  vendorId: string;
  vendor?: VendorSummary;
  quantity: number;
  price: number;
  discountPrice?: number | null;
  status: OrderItemStatus;
  reviews?: Review[];
  createdAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  address?: Address;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  pendingApplications: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalBrands: number;
}

export interface VendorApplication {
  id: string;
  userId: string;
  user?: { name: string; email: string };
  businessName: string;
  businessAddress: string;
  phone: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}
