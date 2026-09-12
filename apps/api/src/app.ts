import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { globalLimiter } from './middlewares/rateLimit.middleware';
import { AppError } from './utils/appError';
import { env } from './config/env';

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed on Frontend Next.js layer
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Environment-Aware CORS Configuration
const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', '*.vercel.app'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, Next.js internal rewrites, webhook dispatchers)
      if (!origin) return callback(null, true);

      if (env.NODE_ENV !== 'production') {
        // Allow all local development origins
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('vercel.app') ||
        allowedOrigins.some((allowed) => {
          if (allowed.startsWith('*.')) {
            const rootDomain = allowed.slice(2);
            return origin.endsWith(rootDomain) || origin === `https://${rootDomain}`;
          }
          return false;
        });

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new AppError(`CORS policy: Access denied for origin ${origin}`, 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'x-razorpay-signature'],
  })
);

// Parsers with safe production payload limits and rawBody preservation for webhooks
app.use(
  express.json({
    limit: '5mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Root API Routes with Global Rate Limiting
app.use('/api', globalLimiter);
app.use('/api', routes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
