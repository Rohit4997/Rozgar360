import { create } from 'zustand';
import { AuthStatus } from '../types';

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

export const useAuthStore = create<AuthState>((set) => ({
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
}));

