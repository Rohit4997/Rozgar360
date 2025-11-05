import prisma from '../config/database';
import logger from '../utils/logger';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

export class ReviewService {
  /**
   * Add review for a labour
   */
  async addReview(
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string
  ) {
    try {
      // Validation
      if (reviewerId === revieweeId) {
        throw new ValidationError('Cannot review yourself');
      }

      if (rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5');
      }

      // Check if reviewee exists
      const reviewee = await prisma.user.findUnique({
        where: { id: revieweeId },
      });

      if (!reviewee) {
        throw new NotFoundError('Labour not found');
      }

      // Create or update review
      const review = await prisma.review.upsert({
        where: {
          reviewerId_revieweeId: {
            reviewerId,
            revieweeId,
          },
        },
        create: {
          reviewerId,
          revieweeId,
          rating,
          comment,
        },
        update: {
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
            },
          },
        },
      });

      // Update reviewee's average rating
      await this.updateUserRating(revieweeId);

      logger.info(`Review added by ${reviewerId} for ${revieweeId}`);

      return review;
    } catch (error: any) {
      logger.error('Error adding review:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to add review');
    }
  }

  /**
   * Get reviews for a user
   */
  async getReviewsForUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      const take = Math.min(limit, 100);

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { revieweeId: userId },
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
          skip,
          take,
        }),
        prisma.review.count({
          where: { revieweeId: userId },
        }),
      ]);

      // Calculate average rating
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { rating: true, totalReviews: true },
      });

      return {
        reviews,
        averageRating: user?.rating || 0,
        totalReviews: user?.totalReviews || 0,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error: any) {
      logger.error('Error fetching reviews:', error);
      throw new DatabaseError('Failed to fetch reviews');
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.reviewerId !== userId) {
        throw new ValidationError('You can only delete your own reviews');
      }

      await prisma.review.delete({
        where: { id: reviewId },
      });

      // Update reviewee's rating
      await this.updateUserRating(review.revieweeId);

      logger.info(`Review ${reviewId} deleted by ${userId}`);
    } catch (error: any) {
      logger.error('Error deleting review:', error);
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete review');
    }
  }

  /**
   * Update user's average rating
   */
  private async updateUserRating(userId: string) {
    try {
      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId },
        select: { rating: true },
      });

      if (reviews.length === 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            rating: 0,
            totalReviews: 0,
          },
        });
        return;
      }

      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await prisma.user.update({
        where: { id: userId },
        data: {
          rating: parseFloat(averageRating.toFixed(2)),
          totalReviews: reviews.length,
        },
      });
    } catch (error) {
      logger.error('Error updating user rating:', error);
      // Don't throw - this is a background update
    }
  }
}

export default new ReviewService();

