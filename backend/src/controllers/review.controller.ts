import { Request, Response } from 'express';
import reviewService from '../services/review.service';
import logger from '../utils/logger';

export class ReviewController {
  /**
   * Add review
   * POST /api/v1/reviews
   */
  async addReview(req: Request, res: Response) {
    try {
      const reviewerId = req.user?.userId;

      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { labourId, rating, comment } = req.body;

      const review = await reviewService.addReview(
        reviewerId,
        labourId,
        rating,
        comment
      );

      return res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review,
      });
    } catch (error: any) {
      logger.error('Add review error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to add review',
      });
    }
  }

  /**
   * Get reviews for a user
   * GET /api/v1/reviews/:userId
   */
  async getReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await reviewService.getReviewsForUser(
        userId,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 20
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error('Get reviews error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch reviews',
      });
    }
  }

  /**
   * Delete review
   * DELETE /api/v1/reviews/:id
   */
  async deleteReview(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      await reviewService.deleteReview(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete review error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete review',
      });
    }
  }
}

export default new ReviewController();

