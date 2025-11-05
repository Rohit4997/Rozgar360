/**
 * Labour Search API Functions
 */

import { api } from './client';
import {
  SearchLaboursParams,
  SearchLaboursResp,
  GetLabourDetailsResp,
  GetNearbyLaboursParams,
  GetNearbyLaboursResp,
} from './types';

/**
 * Search and filter labours
 * GET /labours
 */
export async function getLabours(
  params: SearchLaboursParams,
  options?: { timeout?: number }
): Promise<SearchLaboursResp> {
  try {
    // Convert array params to comma-separated strings for query params
    const queryParams: Record<string, any> = {
      ...params,
      skills: params.skills ? params.skills.join(',') : undefined,
    };
    
    return await api.get<SearchLaboursResp>('/labours', queryParams, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get labour details by ID
 * GET /labours/:id
 */
export async function getLaboursById(
  pathParams: { id: string },
  options?: { timeout?: number }
): Promise<GetLabourDetailsResp> {
  try {
    let apiUrl = '/labours/{id}';
    apiUrl = apiUrl.replace('{id}', String(pathParams.id));
    
    return await api.get<GetLabourDetailsResp>(apiUrl, undefined, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get nearby labours
 * GET /labours/nearby
 */
export async function getLaboursNearby(
  params: GetNearbyLaboursParams,
  options?: { timeout?: number }
): Promise<GetNearbyLaboursResp> {
  try {
    return await api.get<GetNearbyLaboursResp>('/labours/nearby', params, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

