import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStatus } from '../types';
import { zustandStorage } from '../utils/storage';
import { postAuthSendOTP, postAuthVerifyOTP, postAuthLogout } from '../api';
import { AuthenticationError, RateLimitError, ValidationError } from '../api/errors';

interface AuthState {
  authStatus: AuthStatus;
  phoneNumber: string;
  email: string;
  isAuthenticated: boolean;
  
  // Actions
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAuthStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authStatus: 'unauthenticated',
      phoneNumber: '',
      email: '',
      isAuthenticated: false,

      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      
      setEmail: (email) => set({ email }),
      
      sendOTP: async (phone: string) => {
        try {
          set({ authStatus: 'loading' });
          const response = await postAuthSendOTP({ phone });
          
          if (response.success) {
            set({ phoneNumber: phone });
            return { success: true };
          }
          
          return { success: false, error: response.message };
        } catch (error: any) {
          let errorMessage = 'Failed to send OTP';
          
          if (error instanceof RateLimitError) {
            errorMessage = 'Too many OTP requests. Please try after 1 hour.';
          } else if (error instanceof ValidationError) {
            errorMessage = error.message;
          }
          
          set({ authStatus: 'unauthenticated' });
          return { success: false, error: errorMessage };
        }
      },
      
      verifyOTP: async (phone: string, otp: string) => {
        try {
          set({ authStatus: 'loading' });
          const response = await postAuthVerifyOTP({ phone, otp });
          
          if (response.success) {
            set({ 
              isAuthenticated: true, 
              authStatus: 'authenticated',
              phoneNumber: phone 
            });
            return { success: true, isNewUser: response.isNewUser };
          }
          
          return { success: false, error: 'Failed to verify OTP' };
        } catch (error: any) {
          let errorMessage = 'Invalid OTP';
          
          if (error instanceof AuthenticationError) {
            errorMessage = error.message;
          } else if (error instanceof ValidationError) {
            errorMessage = error.message;
          }
          
          set({ authStatus: 'unauthenticated' });
          return { success: false, error: errorMessage };
        }
      },
      
      logout: async () => {
        try {
          const { api } = await import('../api');
          const refreshToken = await api.getRefreshToken();
          
          if (refreshToken) {
            await postAuthLogout({ refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            isAuthenticated: false, 
            authStatus: 'unauthenticated',
            phoneNumber: '',
            email: '' 
          });
        }
      },
      
      setAuthStatus: (status) => set({ authStatus: status }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

