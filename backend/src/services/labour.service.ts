import prisma from '../config/database';
import logger from '../utils/logger';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors';

interface SearchFilters {
  search?: string;
  city?: string;
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  labourType?: string;
  availableOnly?: boolean;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'distance';
}

export class LabourService {
  /**
   * Search and filter labours
   */
  async searchLabours(filters: SearchFilters) {
    try {
      const {
        search,
        city,
        skills,
        minExperience,
        maxExperience,
        labourType,
        availableOnly,
        minRating,
        page = 1,
        limit = 20,
        sortBy = 'rating',
      } = filters;

      // Build where clause
      const where: any = {
        isActive: true,
        name: { not: '' }, // Only completed profiles
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (city) {
        where.city = { equals: city, mode: 'insensitive' };
      }

      if (skills && skills.length > 0) {
        where.skills = {
          some: {
            skill: { in: skills },
          },
        };
      }

      if (minExperience !== undefined || maxExperience !== undefined) {
        where.experienceYears = {};
        if (minExperience !== undefined) {
          where.experienceYears.gte = minExperience;
        }
        if (maxExperience !== undefined) {
          where.experienceYears.lte = maxExperience;
        }
      }

      if (labourType) {
        where.labourType = labourType;
      }

      if (availableOnly) {
        where.isAvailable = true;
      }

      if (minRating !== undefined && minRating > 0) {
        where.rating = { gte: minRating };
      }

      // Build order by
      const orderBy: any = {};
      if (sortBy === 'rating') {
        orderBy.rating = 'desc';
      } else if (sortBy === 'experience') {
        orderBy.experienceYears = 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      // Pagination
      const skip = (page - 1) * limit;
      const take = Math.min(limit, 100); // Max 100 per page

      // Execute query
      const [labours, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            skills: true,
          },
          orderBy,
          skip,
          take,
        }),
        prisma.user.count({ where }),
      ]);

      const formattedLabours = labours.map((labour) => this.formatLabourResponse(labour));

      return {
        labours: formattedLabours,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error: any) {
      logger.error('Error searching labours:', error);
      throw new DatabaseError('Failed to search labours');
    }
  }

  /**
   * Get labour by ID
   */
  async getLabourById(labourId: string) {
    try {
      const labour = await prisma.user.findUnique({
        where: { id: labourId },
        include: {
          skills: true,
          reviewsReceived: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  profilePictureUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!labour) {
        throw new NotFoundError('Labour not found');
      }

      if (!labour.name || labour.name.trim() === '') {
        throw new NotFoundError('Labour profile not completed');
      }

      return this.formatLabourResponse(labour);
    } catch (error: any) {
      logger.error('Error fetching labour:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch labour details');
    }
  }

  /**
   * Get nearby labours
   */
  async getNearbyLabours(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limitCount: number = 20
  ) {
    try {
      // Validate inputs
      if (!latitude || !longitude) {
        throw new ValidationError('Latitude and longitude are required');
      }

      if (latitude < -90 || latitude > 90) {
        throw new ValidationError('Invalid latitude');
      }

      if (longitude < -180 || longitude > 180) {
        throw new ValidationError('Invalid longitude');
      }

      // Get all labours with location data
      const labours = await prisma.user.findMany({
        where: {
          isActive: true,
          name: { not: '' },
          latitude: { not: null },
          longitude: { not: null },
        },
        include: {
          skills: true,
        },
        take: 1000, // Get more for distance calculation
      });

      // Calculate distances and filter by radius
      const laboursWithDistance = labours
        .map((labour) => {
          if (!labour.latitude || !labour.longitude) {
            return null;
          }

          const distance = this.calculateDistance(
            latitude,
            longitude,
            labour.latitude,
            labour.longitude
          );

          if (distance > radius) {
            return null;
          }

          return {
            ...this.formatLabourResponse(labour),
            distance: parseFloat(distance.toFixed(2)),
          };
        })
        .filter((labour) => labour !== null)
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, limitCount);

      return laboursWithDistance;
    } catch (error: any) {
      logger.error('Error fetching nearby labours:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch nearby labours');
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Format labour response
   */
  private formatLabourResponse(labour: any) {
    return {
      id: labour.id,
      phone: labour.phone,
      email: labour.email || null,
      name: labour.name,
      profilePictureUrl: labour.profilePictureUrl || null,
      bio: labour.bio || null,
      address: labour.address,
      city: labour.city,
      state: labour.state,
      pincode: labour.pincode,
      latitude: labour.latitude || null,
      longitude: labour.longitude || null,
      isAvailable: labour.isAvailable,
      skills: labour.skills ? labour.skills.map((s: any) => s.skill) : [],
      experienceYears: labour.experienceYears,
      labourType: labour.labourType,
      rating: labour.rating || 0,
      totalReviews: labour.totalReviews || 0,
      isVerified: labour.isVerified,
    };
  }
}

export default new LabourService();

