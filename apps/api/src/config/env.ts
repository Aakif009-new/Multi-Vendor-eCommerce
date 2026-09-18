import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config(); // fallback

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'bazaarone_super_secret_jwt_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'bazaarone_cookie_secret_key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000, *.vercel.app',

  // Cloudinary Image Storage
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'MULTI-VENDOR',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '923119275161814',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '8dkmYoaMxt_bgshJADeq547Fd9E',

  // Pexels Catalog Asset Sourcing
  PEXELS_API_KEY:
    process.env.PEXELS_API_KEY ||
    'Dd0Eq8OuuzMhPDt2syYCG4H8oQEM69SPkPgPG7NmCtdenbyvskmU5PJ7',

  // Razorpay Test Mode Payment Gateway
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TWo5jJDGLNDsBZ',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'I44Zdj1v2N6DYjh4vVBL4NtC',
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET || 'bazaarone_razorpay_webhook_secret_2026',
};

// Production Security Validation Check
if (env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    console.error('🚨 [Security Alert]: DATABASE_URL is missing in production environment!');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'bazaarone_super_secret_jwt_key_2026_dev') {
    console.warn('⚠️ [Security Warning]: Using default JWT_SECRET in production. Ensure a strong random secret is set in Render Dashboard.');
  }
  if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET === 'bazaarone_cookie_secret_key') {
    console.warn('⚠️ [Security Warning]: Using default COOKIE_SECRET in production. Ensure a strong random secret is set in Render Dashboard.');
  }
}
