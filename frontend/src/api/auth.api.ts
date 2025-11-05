/**
 * Authentication API Functions
 */

import { api } from './client';
import {
  SendOTPReq,
  SendOTPResp,
  VerifyOTPReq,
  VerifyOTPResp,
  RefreshTokenReq,
  RefreshTokenResp,
  LogoutReq,
  LogoutResp,
} from './types';

/**
 * Send OTP to phone number
 * POST /auth/send-otp
 */
export async function postAuthSendOTP(
  data: SendOTPReq,
  options?: { timeout?: number }
): Promise<SendOTPResp> {
  try {
    return await api.post<SendOTPResp>('/auth/send-otp', data, {
      skipAuth: true,
      timeout: options?.timeout,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Verify OTP and login/signup
 * POST /auth/verify-otp
 */
export async function postAuthVerifyOTP(
  data: VerifyOTPReq,
  options?: { timeout?: number }
): Promise<VerifyOTPResp> {
  try {
    const response = await api.post<VerifyOTPResp>('/auth/verify-otp', data, {
      skipAuth: true,
      timeout: options?.timeout,
    });
    
    // Store tokens if successful
    if (response.success && response.accessToken && response.refreshToken) {
      await api.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh access token
 * POST /auth/refresh-token
 */
export async function postAuthRefreshToken(
  data: RefreshTokenReq,
  options?: { timeout?: number }
): Promise<RefreshTokenResp> {
  try {
    const response = await api.post<RefreshTokenResp>('/auth/refresh-token', data, {
      skipAuth: true,
      timeout: options?.timeout,
    });
    
    // Store new tokens if successful
    if (response.success && response.accessToken && response.refreshToken) {
      await api.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user
 * POST /auth/logout
 */
export async function postAuthLogout(
  data: LogoutReq,
  options?: { timeout?: number }
): Promise<LogoutResp> {
  try {
    const response = await api.post<LogoutResp>('/auth/logout', data, {
      timeout: options?.timeout,
    });
    
    // Clear tokens after successful logout
    if (response.success) {
      await api.clearTokens();
    }
    
    return response;
  } catch (error) {
    // Clear tokens even if logout fails
    await api.clearTokens();
    throw error;
  }
}

