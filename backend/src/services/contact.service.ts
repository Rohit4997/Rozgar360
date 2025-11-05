import prisma from '../config/database';
import logger from '../utils/logger';
import { ValidationError, DatabaseError } from '../utils/errors';

export class ContactService {
  /**
   * Track contact (call/message)
   */
  async trackContact(
    fromUserId: string,
    toUserId: string,
    type: 'call' | 'message'
  ) {
    try {
      // Validation
      if (fromUserId === toUserId) {
        throw new ValidationError('Cannot contact yourself');
      }

      if (!['call', 'message'].includes(type)) {
        throw new ValidationError('Invalid contact type');
      }

      // Create contact record
      const contact = await prisma.contact.create({
        data: {
          fromUserId,
          toUserId,
          type,
        },
      });

      logger.info(`Contact tracked: ${fromUserId} -> ${toUserId} (${type})`);

      return contact;
    } catch (error: any) {
      logger.error('Error tracking contact:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to track contact');
    }
  }

  /**
   * Get contact history
   */
  async getContactHistory(
    userId: string,
    type?: 'sent' | 'received',
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      const take = Math.min(limit, 100);

      const where: any = {};

      if (type === 'sent') {
        where.fromUserId = userId;
      } else if (type === 'received') {
        where.toUserId = userId;
      } else {
        where.OR = [{ fromUserId: userId }, { toUserId: userId }];
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                phone: true,
                profilePictureUrl: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
                phone: true,
                profilePictureUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        prisma.contact.count({ where }),
      ]);

      return {
        contacts,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error: any) {
      logger.error('Error fetching contact history:', error);
      throw new DatabaseError('Failed to fetch contact history');
    }
  }
}

export default new ContactService();

