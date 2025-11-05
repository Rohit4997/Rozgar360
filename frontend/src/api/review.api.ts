/**
 * Reviews API Functions
 */

import { api } from './client';
import {
  AddReviewReq,
  AddReviewResp,
  GetReviewsParams,
  GetReviewsResp,
  DeleteReviewResp,
} from './types';

/**
 * Add or update review for a labour
 * POST /reviews
 */
export async function postReviews(
  data: AddReviewReq,
  options?: { timeout?: number }
): Promise<AddReviewResp> {
  try {
    return await api.post<AddReviewResp>('/reviews', data, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get reviews for a user
 * GET /reviews/:userId
 */
export async function getReviewsByUserId(
  pathParams: { userId: string },
  params?: { page?: number; limit?: number },
  options?: { timeout?: number }
): Promise<GetReviewsResp> {
  try {
    let apiUrl = '/reviews/{userId}';
    apiUrl = apiUrl.replace('{userId}', String(pathParams.userId));
    
    return await api.get<GetReviewsResp>(apiUrl, params, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete review
 * DELETE /reviews/:id
 */
export async function deleteReviewsById(
  pathParams: { id: string },
  options?: { timeout?: number }
): Promise<DeleteReviewResp> {
  try {
    let apiUrl = '/reviews/{id}';
    apiUrl = apiUrl.replace('{id}', String(pathParams.id));
    
    return await api.delete<DeleteReviewResp>(apiUrl, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

