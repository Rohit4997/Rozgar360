import { Request, Response } from 'express';
import labourService from '../services/labour.service';
import logger from '../utils/logger';

export class LabourController {
  /**
   * Search labours
   * GET /api/v1/labours
   */
  async searchLabours(req: Request, res: Response) {
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
        page,
        limit,
        sortBy,
      } = req.query;

      const filters = {
        search: search as string,
        city: city as string,
        skills: skills ? (skills as string).split(',') : undefined,
        minExperience: minExperience ? parseInt(minExperience as string, 10) : undefined,
        maxExperience: maxExperience ? parseInt(maxExperience as string, 10) : undefined,
        labourType: labourType as string,
        availableOnly: availableOnly === 'true',
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as 'rating' | 'experience' | 'distance',
      };

      const result = await labourService.searchLabours(filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error('Search labours error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to search labours',
      });
    }
  }

  /**
   * Get labour by ID
   * GET /api/v1/labours/:id
   */
  async getLabourById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const labour = await labourService.getLabourById(id);

      return res.status(200).json({
        success: true,
        labour,
      });
    } catch (error: any) {
      logger.error('Get labour error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch labour details',
      });
    }
  }

  /**
   * Get nearby labours
   * GET /api/v1/labours/nearby
   */
  async getNearbyLabours(req: Request, res: Response) {
    try {
      const { latitude, longitude, radius, limit } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const labours = await labourService.getNearbyLabours(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        radius ? parseFloat(radius as string) : 10,
        limit ? parseInt(limit as string, 10) : 20
      );

      return res.status(200).json({
        success: true,
        labours,
      });
    } catch (error: any) {
      logger.error('Get nearby labours error:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch nearby labours',
      });
    }
  }
}

export default new LabourController();

