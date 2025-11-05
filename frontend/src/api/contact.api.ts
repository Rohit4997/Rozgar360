/**
 * Contacts API Functions
 */

import { api } from './client';
import {
  TrackContactReq,
  TrackContactResp,
  GetContactHistoryParams,
  GetContactHistoryResp,
} from './types';

/**
 * Track contact (call/message)
 * POST /contacts
 */
export async function postContacts(
  data: TrackContactReq,
  options?: { timeout?: number }
): Promise<TrackContactResp> {
  try {
    return await api.post<TrackContactResp>('/contacts', data, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get contact history
 * GET /contacts/history
 */
export async function getContactsHistory(
  params?: GetContactHistoryParams,
  options?: { timeout?: number }
): Promise<GetContactHistoryResp> {
  try {
    return await api.get<GetContactHistoryResp>('/contacts/history', params, {
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

