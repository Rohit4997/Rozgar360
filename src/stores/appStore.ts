import { create } from 'zustand';
import { AppSettings } from '../types';

interface AppState {
  hasSeenWelcome: boolean;
  settings: AppSettings;
  
  // Actions
  setHasSeenWelcome: (seen: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
};

export const useAppStore = create<AppState>((set) => ({
  hasSeenWelcome: false,
  settings: defaultSettings,

  setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),
  
  resetSettings: () => set({ settings: defaultSettings }),
}));

