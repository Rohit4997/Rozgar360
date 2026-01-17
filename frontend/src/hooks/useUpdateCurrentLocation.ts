import { useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
} from '../utils/location';
import { useLocationStore } from '../stores/locationStore';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to update current location once per session
 * - Checks permission
 * - Gets location if granted
 * - Shows modal if not granted
 * - Updates location store and backend (async, no loading UI)
 */
export function useUpdateCurrentLocation() {
  const { setLocation } = useLocationStore();
  const { updateProfile } = useUserStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRunRef = useRef(false);

  const updateLocation = useCallback(async (showPermissionModal = false) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        return;
      }

      // Check permission
      const hasPermission = await checkLocationPermission();
      
      if (!hasPermission) {
        if (showPermissionModal) {
          // Show modal to request permission
          Alert.alert(
            'Location Permission',
            'Rozgar360 needs access to your location to show distances to labourers. Would you like to enable location access?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Enable',
                onPress: async () => {
                  const granted = await requestLocationPermission();
                  if (granted) {
                    await updateLocation(false);
                  }
                },
              },
            ]
          );
        }
        return;
      }

      // Get current location
      const { latitude, longitude } = await getCurrentLocation();

      // Update location store
      setLocation(latitude, longitude);

      // Update backend (async, no loading UI)
      updateProfile({
        latitude,
        longitude,
      }).catch((error) => {
        // Silently fail - don't show error to user
        console.log('Failed to update location on backend:', error);
      });
    } catch (error: any) {
      // Silently fail - don't show error to user
      console.log('Failed to update location:', error);
    }
  }, [isAuthenticated, setLocation, updateProfile]);

  useEffect(() => {
    // Only run once per session
    if (!hasRunRef.current && isAuthenticated) {
      hasRunRef.current = true;
      // Check permission first, and request if not granted
      checkLocationPermission().then((hasPermission) => {
        if (!hasPermission) {
          // Show permission modal if permission is not granted
          updateLocation(true).catch(() => {
            // Silently fail
          });
        } else {
          // If permission is already granted, just update location silently
          updateLocation(false).catch(() => {
            // Silently fail
          });
        }
      }).catch(() => {
        // If check fails, try to request permission
        updateLocation(true).catch(() => {
          // Silently fail
        });
      });
    }
  }, [isAuthenticated, updateLocation]);

  return {
    updateLocation: () => updateLocation(true), // Expose function to manually trigger with modal
  };
}

