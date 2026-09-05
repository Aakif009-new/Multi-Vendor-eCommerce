import { Request, Response } from 'express';
import { checkDBHealth } from '../config/db';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class HealthController {
  static async check(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const isDBHealthy = await checkDBHealth();
    const latencyMs = Date.now() - startTime;

    const memory = process.memoryUsage();

    const healthData = {
      service: 'BazaarOne Multi-Vendor Marketplace API',
      status: isDBHealthy ? 'HEALTHY' : 'DEGRADED',
      environment: process.env.NODE_ENV || 'development',
      database: isDBHealthy ? 'Connected to MongoDB Atlas' : 'Database Ping Failed',
      latencyMs,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMB: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024)),
      },
      timestamp: new Date().toISOString(),
      version: '2.4.0 (Production Multi-Vendor Marketplace)',
    };

    if (isDBHealthy) {
      sendSuccess(res, healthData, 'API is operational and healthy', 200);
    } else {
      sendError(res, 'Database connection is degraded', 503, healthData);
    }
  }
}
