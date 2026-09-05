import rateLimit from 'express-rate-limit';

// Global API rate limiter (Generous for university demonstration & normal usage)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // Skip in automated test suites
});

// Strict rate limiter for Authentication endpoints (Login / Register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts from this IP, please try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Payment verification rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Payment request limit exceeded, please try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});
