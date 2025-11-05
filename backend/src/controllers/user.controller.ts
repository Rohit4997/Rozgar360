import { Request, Response } from 'express';
import userService from '../services/user.service';
import logger from '../utils/logger';

export class UserController {
  /**
   * Complete user profile
   * POST /api/v1/users/profile
   */
  async completeProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await userService.completeProfile(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Profile completed successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Complete profile error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to complete profile',
      });
    }
  }

  /**
   * Get user profile
   * GET /api/v1/users/profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await userService.getUserProfile(userId);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/users/profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await userService.updateProfile(userId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  /**
   * Toggle availability
   * PATCH /api/v1/users/availability
   */
  async toggleAvailability(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { isAvailable } = req.body;

      const result = await userService.toggleAvailability(userId, isAvailable);

      return res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        ...result,
      });
    } catch (error: any) {
      logger.error('Toggle availability error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update availability',
      });
    }
  }
}

export default new UserController();

