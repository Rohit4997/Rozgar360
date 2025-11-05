/**
 * User Profile API Functions
 */

import { api } from './client';
import {
  CompleteProfileReq,
  CompleteProfileResp,
  GetProfileResp,
  UpdateProfileReq,
  UpdateProfileResp,
  ToggleAvailabilityReq,
  ToggleAvailabilityResp,
} from './types';

/**
 * Complete user profile setup (first time)
 * POST /users/profile
 */
export async function postUsersProfile(
  data: CompleteProfileReq,
  options?: { timeout?: number }
): Promise<CompleteProfileResp> {
  try {
    return await api.post<CompleteProfileResp>('/users/profile', data, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user profile
 * GET /users/profile
 */
export async function getUsersProfile(
  options?: { timeout?: number }
): Promise<GetProfileResp> {
  try {
    return await api.get<GetProfileResp>('/users/profile', undefined, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile
 * PUT /users/profile
 */
export async function putUsersProfile(
  data: UpdateProfileReq,
  options?: { timeout?: number }
): Promise<UpdateProfileResp> {
  try {
    return await api.put<UpdateProfileResp>('/users/profile', data, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle user availability
 * PATCH /users/availability
 */
export async function patchUsersAvailability(
  data: ToggleAvailabilityReq,
  options?: { timeout?: number }
): Promise<ToggleAvailabilityResp> {
  try {
    return await api.patch<ToggleAvailabilityResp>('/users/availability', data, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

