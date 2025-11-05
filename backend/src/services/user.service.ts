import prisma from '../config/database';
import logger from '../utils/logger';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

export class UserService {
  /**
   * Complete user profile setup (first time)
   */
  async completeProfile(userId: string, profileData: {
    name: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    bio?: string;
    isAvailable: boolean;
    skills: string[];
    experienceYears: number;
    labourType: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      // Validate user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // Check if profile already completed
      if (existingUser.name && existingUser.name.trim()) {
        throw new ValidationError('Profile already completed. Use update endpoint instead.');
      }

      // Update user with profile data
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: profileData.name,
          email: profileData.email,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          bio: profileData.bio,
          isAvailable: profileData.isAvailable,
          experienceYears: profileData.experienceYears,
          labourType: profileData.labourType,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
        },
      });

      // Add skills
      if (profileData.skills && profileData.skills.length > 0) {
        await prisma.userSkill.createMany({
          data: profileData.skills.map((skill) => ({
            userId,
            skill,
          })),
          skipDuplicates: true,
        });
      }

      // Fetch complete user with skills
      const completeUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: true,
        },
      });

      logger.info(`Profile completed for user ${userId}`);

      return this.formatUserResponse(completeUser);
    } catch (error: any) {
      logger.error('Error completing profile:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to complete profile');
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return this.formatUserResponse(user);
    } catch (error: any) {
      logger.error('Error fetching user profile:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    bio?: string;
    isAvailable?: boolean;
    skills?: string[];
    experienceYears?: number;
    labourType?: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // Update user data
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.email !== undefined && { email: updates.email }),
          ...(updates.address && { address: updates.address }),
          ...(updates.city && { city: updates.city }),
          ...(updates.state && { state: updates.state }),
          ...(updates.pincode && { pincode: updates.pincode }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
          ...(updates.isAvailable !== undefined && { isAvailable: updates.isAvailable }),
          ...(updates.experienceYears && { experienceYears: updates.experienceYears }),
          ...(updates.labourType && { labourType: updates.labourType }),
          ...(updates.latitude !== undefined && { latitude: updates.latitude }),
          ...(updates.longitude !== undefined && { longitude: updates.longitude }),
        },
      });

      // Update skills if provided
      if (updates.skills) {
        // Delete old skills
        await prisma.userSkill.deleteMany({
          where: { userId },
        });

        // Add new skills
        if (updates.skills.length > 0) {
          await prisma.userSkill.createMany({
            data: updates.skills.map((skill) => ({
              userId,
              skill,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Fetch updated user with skills
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: true,
        },
      });

      logger.info(`Profile updated for user ${userId}`);

      return this.formatUserResponse(updatedUser);
    } catch (error: any) {
      logger.error('Error updating profile:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to update profile');
    }
  }

  /**
   * Toggle user availability
   */
  async toggleAvailability(userId: string, isAvailable: boolean) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isAvailable },
      });

      logger.info(`Availability updated for user ${userId}: ${isAvailable}`);

      return {
        id: user.id,
        isAvailable: user.isAvailable,
      };
    } catch (error: any) {
      logger.error('Error toggling availability:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('User not found');
      }
      throw new DatabaseError('Failed to update availability');
    }
  }

  /**
   * Format user response
   */
  private formatUserResponse(user: any) {
    if (!user) {
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
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();

