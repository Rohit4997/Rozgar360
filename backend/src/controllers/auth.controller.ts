import { Request, Response } from 'express';
import authService from '../services/auth.service';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Send OTP
   * POST /api/v1/auth/send-otp
   */
  async sendOTP(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      const result = await authService.sendOTP(phone);

      // Return 429 for rate limiting, 400 for validation errors, 200 for success
      if (!result.success) {
        const statusCode = result.message.includes('Too many') ? 429 : 400;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Send OTP error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP',
      });
    }
  }

  /**
   * Verify OTP
   * POST /api/v1/auth/verify-otp
   */
  async verifyOTP(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;

      const result = await authService.verifyOTP(phone, otp);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Verify OTP error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid OTP',
      });
    }
  }

  /**
   * Refresh Token
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Failed to refresh token',
      });
    }
  }

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      await authService.logout(userId, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to logout',
      });
    }
  }
}

export default new AuthController();

