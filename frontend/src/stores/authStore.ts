import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStatus } from '../types';
import { zustandStorage } from '../utils/storage';

interface AuthState {
  authStatus: AuthStatus;
  phoneNumber: string;
  email: string;
  isAuthenticated: boolean;
  
  // Actions
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  setAuthStatus: (status: AuthStatus) => void;
}

// Hardcoded credentials for testing
const VALID_CREDENTIALS = [
  { phone: '9876543210', otp: '1234' },
  { phone: '8765432109', otp: '1234' },
  { phone: '7654321098', otp: '1234' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authStatus: 'unauthenticated',
      phoneNumber: '',
      email: '',
      isAuthenticated: false,

      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      
      setEmail: (email) => set({ email }),
      
      login: async (phone, otp) => {
        // Simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            const isValid = VALID_CREDENTIALS.some(
              (cred) => cred.phone === phone && cred.otp === otp
            );
            
            if (isValid) {
              set({ 
                isAuthenticated: true, 
                authStatus: 'authenticated',
                phoneNumber: phone 
              });
              resolve(true);
            } else {
              resolve(false);
            }
          }, 1000);
        });
      },
      
      logout: () => set({ 
        isAuthenticated: false, 
        authStatus: 'unauthenticated',
        phoneNumber: '',
        email: '' 
      }),
      
      setAuthStatus: (status) => set({ authStatus: status }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

