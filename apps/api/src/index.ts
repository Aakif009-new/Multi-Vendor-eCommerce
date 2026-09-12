import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { Server } from 'http';

let server: Server | null = null;

async function bootstrap() {
  await connectDB();

  const PORT = env.PORT;
  const HOST = process.env.HOST || '0.0.0.0';

  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 [BazaarOne API]: Server is running at http://${HOST}:${PORT}`);
    console.log(`🔗 [BazaarOne API]: Health check at http://${HOST}:${PORT}/api/health`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n🛑 [BazaarOne API]: Received ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(async () => {
        console.log('HTTP server closed. In-flight requests completed.');
        await disconnectDB();
        console.log('Graceful shutdown completed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if hanging
      setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000).unref();
    } else {
      await disconnectDB();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
