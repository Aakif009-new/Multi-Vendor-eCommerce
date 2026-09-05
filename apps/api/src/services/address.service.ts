import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export class AddressService {
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async createAddress(userId: string, data: any) {
    // If this is the user's first address, make it default automatically
    const existingCount = await prisma.address.count({ where: { userId } });
    const isDefault = existingCount === 0 || data.isDefault === true;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        title: data.title.trim(),
        street: data.street.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country?.trim() || 'India',
        phone: data.phone.trim(),
        isDefault,
      },
    });
  }

  static async updateAddress(userId: string, addressId: string, data: any) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) {
      throw AppError.notFound('Address not found.');
    }

    if (address.userId !== userId) {
      throw AppError.forbidden('Forbidden: You can only update your own address.');
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.street && { street: data.street.trim() }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.state && { state: data.state.trim() }),
        ...(data.postalCode && { postalCode: data.postalCode.trim() }),
        ...(data.country && { country: data.country.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) {
      throw AppError.notFound('Address not found.');
    }

    if (address.userId !== userId) {
      throw AppError.forbidden('Forbidden: You can only delete your own address.');
    }

    await prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully.' };
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) {
      throw AppError.notFound('Address not found.');
    }

    if (address.userId !== userId) {
      throw AppError.forbidden('Forbidden: You can only modify your own address.');
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
