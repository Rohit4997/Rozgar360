import prisma from '../config/database';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import smsService from './sms.service';
import logger from '../utils/logger';
import { ValidationError, AuthenticationError, DatabaseError } from '../utils/errors';

export class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<{ success: boolean; message: string; expiresIn: number }> {
    try {
      // Validate phone number format
      if (!phone || !/^\d{10}$/.test(phone)) {
        throw new ValidationError('Invalid phone number format');
      }

      // Check rate limiting - max 3 OTPs per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      let recentOTPs = 0;
      
      try {
        recentOTPs = await prisma.otpVerification.count({
          where: {
            phone,
            createdAt: {
              gte: oneHourAgo,
            },
          },
        });
      } catch (dbError) {
        logger.error('Error checking OTP rate limit:', dbError);
        throw new DatabaseError('Failed to check rate limit');
      }

      if (recentOTPs >= 3) {
        return {
          success: false,
          message: 'Too many OTP requests. Please try after 1 hour.',
          expiresIn: 0,
        };
      }

      // Static OTPs for test phone numbers
      const STATIC_OTPS: Record<string, string> = {
        '3295004997': '3297',
        '4997003295': '4932',
      };

      // Generate OTP (use static OTP for test phone numbers, otherwise generate random)
      const otp = STATIC_OTPS[phone] || generateOTP();
      const expiresAt = getOTPExpiry();

      // Save OTP to database with error handling
      try {
        await prisma.otpVerification.create({
          data: {
            phone,
            otp,
            expiresAt,
          },
        });
      } catch (dbError) {
        logger.error('Database error creating OTP:', dbError);
        throw new Error('Failed to create OTP record');
      }

      // Send OTP via SMS
      const sent = await smsService.sendOTP(phone, otp);

      if (!sent) {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.',
          expiresIn: 0,
        };
      }

      const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

      logger.info(`OTP sent to ${phone}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn,
      };
    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and login/signup
   */
  async verifyOTP(phone: string, otp: string): Promise<{
    success: boolean;
    isNewUser: boolean;
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    try {
      // Validate inputs
      if (!phone || !otp) {
        throw new ValidationError('Phone number and OTP are required');
      }

      if (!/^\d{10}$/.test(phone)) {
        throw new ValidationError('Invalid phone number format');
      }

      if (!/^\d{4,6}$/.test(otp)) {
        throw new ValidationError('Invalid OTP format');
      }

      // Find latest OTP for this phone
      let otpRecord;
      try {
        otpRecord = await prisma.otpVerification.findFirst({
          where: {
            phone,
            isVerified: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      } catch (dbError) {
        logger.error('Error fetching OTP record:', dbError);
        throw new DatabaseError('Failed to verify OTP');
      }

      // Validate OTP
      if (!otpRecord) {
        throw new AuthenticationError('No OTP found for this phone number');
      }

      if (otpRecord.otp !== otp) {
        throw new AuthenticationError('Invalid OTP');
      }

      if (isOTPExpired(otpRecord.expiresAt)) {
        throw new AuthenticationError('OTP has expired');
      }

      // Mark OTP as verified with error handling
      try {
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { isVerified: true },
        });
      } catch (dbError) {
        logger.error('Error updating OTP:', dbError);
        // Continue anyway as OTP is valid
      }

      // Check if user exists
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { phone },
          include: {
            skills: true,
          },
        });
      } catch (dbError) {
        logger.error('Error fetching user:', dbError);
        throw new DatabaseError('Failed to retrieve user data');
      }

      const isNewUser = !user;

      // If new user, create basic user record
      if (isNewUser) {
        try {
          user = await prisma.user.create({
            data: {
              phone,
              name: '', // Will be filled during profile setup
              address: '',
              city: '',
              state: '',
              pincode: '',
              experienceYears: 0,
              labourType: '',
              lastLoginAt: new Date(),
            },
            include: {
              skills: true,
            },
          });
        } catch (dbError: any) {
          logger.error('Error creating user:', dbError);
          if (dbError.code === 'P2002') {
            // Unique constraint violation - user already exists
            throw new DatabaseError('User with this phone number already exists');
          }
          throw new DatabaseError('Failed to create user account');
        }
      } else {
        // Update last login
        if (!user) {
          throw new Error('User not found');
        }
        try {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            include: {
              skills: true,
            },
          });
        } catch (dbError) {
          logger.error('Error updating user login:', dbError);
          // Continue with existing user data if update fails
        }
      }

      // Safety check - should never happen but prevents crashes
      if (!user) {
        logger.error('User is null after create/update operation');
        throw new DatabaseError('Failed to create or retrieve user');
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        phone: user.phone,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        phone: user.phone,
      });

      // Store refresh token
      const refreshExpiry = new Date();
      refreshExpiry.setDate(refreshExpiry.getDate() + 30);

      try {
        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: refreshExpiry,
          },
        });
      } catch (dbError) {
        logger.error('Error storing refresh token:', dbError);
        // Continue anyway - token generation succeeded
      }

      logger.info(`User ${phone} logged in successfully`);

      return {
        success: true,
        isNewUser,
        accessToken,
        refreshToken,
        user: user ? this.formatUserResponse(user) : null,
      };
    } catch (error: any) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Find refresh token in database
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          revokedAt: null,
        },
        include: {
          user: true,
        },
      });

      if (!tokenRecord) {
        throw new AuthenticationError('Invalid refresh token');
      }

      if (!tokenRecord.user) {
        throw new AuthenticationError('User associated with token not found');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new AuthenticationError('Refresh token has expired');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: tokenRecord.user.id,
        phone: tokenRecord.user.phone,
      });

      const newRefreshToken = generateRefreshToken({
        userId: tokenRecord.user.id,
        phone: tokenRecord.user.phone,
      });

      // Revoke old refresh token
      try {
        await prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { revokedAt: new Date() },
        });
      } catch (dbError) {
        logger.error('Error revoking old token:', dbError);
        // Continue anyway
      }

      // Store new refresh token
      const refreshExpiry = new Date();
      refreshExpiry.setDate(refreshExpiry.getDate() + 30);

      try {
        await prisma.refreshToken.create({
          data: {
            userId: tokenRecord.user.id,
            token: newRefreshToken,
            expiresAt: refreshExpiry,
          },
        });
      } catch (dbError) {
        logger.error('Error storing new refresh token:', dbError);
        throw new Error('Failed to store new refresh token');
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      // Validate inputs
      if (!userId || !refreshToken) {
        throw new ValidationError('User ID and refresh token are required');
      }

      // Revoke refresh token
      const result = await prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (result.count === 0) {
        logger.warn(`No active refresh token found for user ${userId}`);
        // Don't throw error - logout should always succeed
      }

      logger.info(`User ${userId} logged out`);
    } catch (error) {
      logger.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Format user response
   */
  private formatUserResponse(user: any) {
    // Safety checks
    if (!user) {
      return null;
    }

    if (!user.name) {
      // New user - hasn't completed profile
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email || null,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl || null,
      bio: user.bio || null,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      latitude: user.latitude || null,
      longitude: user.longitude || null,
      isAvailable: user.isAvailable,
      skills: user.skills ? user.skills.map((s: any) => s.skill) : [],
      experienceYears: user.experienceYears,
      labourType: user.labourType,
      rating: user.rating || 0,
      totalReviews: user.totalReviews || 0,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();

