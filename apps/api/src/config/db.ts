import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ [MongoDB Atlas]: Database connection established successfully via Prisma.');
  } catch (error) {
    console.error('❌ [MongoDB Atlas]: Database connection failed:', error);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🛑 [MongoDB Atlas]: Database connection disconnected cleanly.');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

export async function checkDBHealth(): Promise<boolean> {
  try {
    // MongoDB raw ping or lightweight count
    await prisma.user.count({ take: 1 });
    return true;
  } catch (error) {
    console.error('Database health ping failed:', error);
    return false;
  }
}
