import app from './app';
import env from './config/env';
import logger from './utils/logger';
import { checkDatabaseConnection, disconnectDatabase } from './utils/safeDb';

const PORT = env.PORT;

// Check database connection before starting server
const startServer = async () => {
  try {
    // Verify database connection
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('❌ Failed to connect to database. Please check your DATABASE_URL');
      process.exit(1);
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api/${env.API_VERSION}`);
      logger.info(`💾 SMS Provider: ${env.SMS_PROVIDER}`);
      logger.info(`✅ Database connected`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global error handlers to prevent server crashes
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('🚨 Unhandled Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise,
  });
  
  // Don't exit in production, just log
  if (env.NODE_ENV === 'development') {
    logger.warn('Server continuing despite unhandled rejection (dev mode)');
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('🚨 Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  
  // Exit on uncaught exceptions
  logger.error('Server shutting down due to uncaught exception');
  process.exit(1);
});

// Start the server
startServer();


