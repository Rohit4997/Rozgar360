import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { zustandStorage } from '../utils/storage';
import {
  postUsersProfile,
  getUsersProfile,
  putUsersProfile,
  patchUsersAvailability,
} from '../api';
import { UserResp } from '../api/types';

// Helper to convert API UserResp to app User type
const mapUserRespToUser = (userResp: UserResp): User => ({
  id: userResp.id,
  name: userResp.name,
  email: userResp.email || '',
  phone: userResp.phone,
  address: userResp.address,
  city: userResp.city,
  state: userResp.state,
  pincode: userResp.pincode,
  profilePicture: userResp.profilePictureUrl || undefined,
  bio: userResp.bio || undefined,
  isAvailable: userResp.isAvailable,
  skills: userResp.skills,
  experience: userResp.experienceYears,
  labourType: userResp.labourType as any,
  rating: userResp.rating,
  totalReviews: userResp.totalReviews,
  latitude: userResp.latitude || undefined,
  longitude: userResp.longitude || undefined,
});

interface UserState {
  currentUser: User | null;
  hasCompletedProfile: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: User) => void;
  completeProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  toggleAvailability: (isAvailable: boolean) => Promise<{ success: boolean; error?: string }>;
  setHasCompletedProfile: (completed: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      hasCompletedProfile: false,
      loading: false,
      error: null,

      setCurrentUser: (user) => set({ currentUser: user, hasCompletedProfile: true }),
      
      completeProfile: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await postUsersProfile(data);
          
          if (response.success && response.user) {
            const user = mapUserRespToUser(response.user);
            set({ 
              currentUser: user, 
              hasCompletedProfile: true,
              loading: false 
            });
            return { success: true };
          }
          
          set({ loading: false });
          return { success: false, error: response.message || 'Failed to complete profile' };
        } catch (error: any) {
          set({ loading: false, error: error.message || 'Failed to complete profile' });
          return { success: false, error: error.message || 'Failed to complete profile' };
        }
      },
      
      fetchProfile: async () => {
        try {
          set({ loading: true, error: null });
          const response = await getUsersProfile();
          
          if (response.success && response.user) {
            const user = mapUserRespToUser(response.user);
            set({ 
              currentUser: user, 
              hasCompletedProfile: true,
              loading: false 
            });
          } else {
            set({ loading: false });
          }
        } catch (error: any) {
          set({ loading: false, error: error.message || 'Failed to fetch profile' });
        }
      },
      
      updateProfile: async (updates) => {
        try {
          set({ loading: true, error: null });
          
          // Map User updates to API format
          const apiUpdates: any = {};
          if (updates.name) apiUpdates.name = updates.name;
          if (updates.email !== undefined) apiUpdates.email = updates.email;
          if (updates.address) apiUpdates.address = updates.address;
          if (updates.city) apiUpdates.city = updates.city;
          if (updates.state) apiUpdates.state = updates.state;
          if (updates.pincode) apiUpdates.pincode = updates.pincode;
          if (updates.bio !== undefined) apiUpdates.bio = updates.bio;
          if (updates.isAvailable !== undefined) apiUpdates.isAvailable = updates.isAvailable;
          if (updates.skills) apiUpdates.skills = updates.skills;
          if (updates.experience) apiUpdates.experienceYears = updates.experience;
          if (updates.labourType) apiUpdates.labourType = updates.labourType;
          if (updates.latitude !== undefined) apiUpdates.latitude = updates.latitude;
          if (updates.longitude !== undefined) apiUpdates.longitude = updates.longitude;
          
          const response = await putUsersProfile(apiUpdates);
          
          if (response.success && response.user) {
            const user = mapUserRespToUser(response.user);
            set({ 
              currentUser: user,
              loading: false 
            });
            return { success: true };
          }
          
          set({ loading: false });
          return { success: false, error: response.message || 'Failed to update profile' };
        } catch (error: any) {
          set({ loading: false, error: error.message || 'Failed to update profile' });
          return { success: false, error: error.message || 'Failed to update profile' };
        }
      },
      
      toggleAvailability: async (isAvailable: boolean) => {
        try {
          set({ loading: true, error: null });
          const response = await patchUsersAvailability({ isAvailable });
          
          if (response.success) {
            set((state) => ({
              currentUser: state.currentUser
                ? { ...state.currentUser, isAvailable: response.isAvailable }
                : null,
              loading: false,
            }));
            return { success: true };
          }
          
          set({ loading: false });
          return { success: false, error: response.message || 'Failed to update availability' };
        } catch (error: any) {
          set({ loading: false, error: error.message || 'Failed to update availability' });
          return { success: false, error: error.message || 'Failed to update availability' };
        }
      },
      
      setHasCompletedProfile: (completed) => set({ hasCompletedProfile: completed }),
      
      clearUser: () => set({ currentUser: null, hasCompletedProfile: false, error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

