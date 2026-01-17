import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  lastUpdated: number | null;
  hasLocation: boolean;
  
  // Actions
  setLocation: (latitude: number, longitude: number) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      lastUpdated: null,
      hasLocation: false,

      setLocation: (latitude, longitude) => set({
        latitude,
        longitude,
        lastUpdated: Date.now(),
        hasLocation: true,
      }),

      clearLocation: () => set({
        latitude: null,
        longitude: null,
        lastUpdated: null,
        hasLocation: false,
      }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

