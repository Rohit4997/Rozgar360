import prisma from '../config/database';
import logger from './logger';
import { DatabaseError } from './errors';

/**
 * Safe database connection check
 * Tests database connectivity and handles connection errors gracefully
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

/**
 * Graceful database disconnect
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
};

/**
 * Safe execute with retry logic
 */
export const safeDbExecute = async <T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Database operation failed, attempt ${i + 1}/${retries}:`, error);
      
      // Wait before retry (exponential backoff)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  logger.error('Database operation failed after all retries:', lastError);
  throw new DatabaseError('Database operation failed');
};

