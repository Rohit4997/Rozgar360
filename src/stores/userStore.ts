import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  currentUser: User | null;
  hasCompletedProfile: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  toggleAvailability: () => void;
  setHasCompletedProfile: (completed: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  hasCompletedProfile: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  
  updateUser: (updates) => set((state) => ({
    currentUser: state.currentUser 
      ? { ...state.currentUser, ...updates }
      : null,
  })),
  
  toggleAvailability: () => set((state) => ({
    currentUser: state.currentUser
      ? { ...state.currentUser, isAvailable: !state.currentUser.isAvailable }
      : null,
  })),
  
  setHasCompletedProfile: (completed) => set({ hasCompletedProfile: completed }),
  
  clearUser: () => set({ currentUser: null, hasCompletedProfile: false }),
}));

