import { Request, Response } from 'express';
import contactService from '../services/contact.service';
import logger from '../utils/logger';

export class ContactController {
  /**
   * Track contact
   * POST /api/v1/contacts
   */
  async trackContact(req: Request, res: Response) {
    try {
      const fromUserId = req.user?.userId;

      if (!fromUserId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { labourId, contactType } = req.body;

      const contact = await contactService.trackContact(
        fromUserId,
        labourId,
        contactType
      );

      return res.status(201).json({
        success: true,
        message: 'Contact tracked successfully',
        contact,
      });
    } catch (error: any) {
      logger.error('Track contact error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to track contact',
      });
    }
  }

  /**
   * Get contact history
   * GET /api/v1/contacts/history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { type, page, limit } = req.query;

      const result = await contactService.getContactHistory(
        userId,
        type as 'sent' | 'received',
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 20
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error('Get contact history error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch contact history',
      });
    }
  }
}

export default new ContactController();

