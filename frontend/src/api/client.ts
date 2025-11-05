/**
 * API Client - Centralized fetch-based API framework
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from './errors';

// Configuration
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api/v1' // Android Emulator
  : 'https://api.rozgar360.com/api/v1'; // Production

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface ApiOptions {
  timeout?: number;
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * API Client Class
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get access token from storage
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Set tokens in storage
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  }

  /**
   * Clear tokens from storage
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await this.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }

      // Refresh failed, clear tokens
      await this.clearTokens();
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    return `${url}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Handle API errors
   */
  private handleError(status: number, data: any): never {
    const message = data?.message || 'An error occurred';
    const response = data;

    switch (status) {
      case 400:
        throw new ValidationError(message, response);
      case 401:
        throw new AuthenticationError(message, response);
      case 404:
        throw new NotFoundError(message, response);
      case 429:
        throw new RateLimitError(message, response);
      case 500:
      case 502:
      case 503:
        throw new ServerError(message, response);
      default:
        throw new ApiError(message, status, response);
    }
  }

  /**
   * Make API request with retry logic for token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean; params?: Record<string, any>; timeout?: number } = {}
  ): Promise<T> {
    const { skipAuth = false, params, timeout, ...fetchOptions } = options;
    
    // Build URL
    const url = this.buildUrl(endpoint, params);

    // Prepare headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if needed
    if (!skipAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Handle 401 with token refresh
      if (response.status === 401 && !skipAuth) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers,
          });
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            this.handleError(retryResponse.status, retryData);
          }
          
          return retryData as T;
        }
      }

      if (!response.ok) {
        this.handleError(response.status, data);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }

      if (error instanceof ApiError || error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError(error.message || 'Network request failed');
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      skipAuth: options?.skipAuth,
      headers: options?.headers,
      timeout: options?.timeout,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      skipAuth: options?.skipAuth,
      headers: options?.headers,
      timeout: options?.timeout,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      skipAuth: options?.skipAuth,
      headers: options?.headers,
      timeout: options?.timeout,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      skipAuth: options?.skipAuth,
      headers: options?.headers,
      timeout: options?.timeout,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: ApiOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      skipAuth: options?.skipAuth,
      headers: options?.headers,
      timeout: options?.timeout,
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

