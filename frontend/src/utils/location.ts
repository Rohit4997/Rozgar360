import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';

const { GeocoderModule } = NativeModules;

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

/**
 * Request location permissions for Android
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS handling not needed for now
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Rozgar360 needs access to your location to fetch your current address.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to fetch your current address. Please enable it in app settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (err) {
    console.warn('Location permission error:', err);
    return false;
  }
}

/**
 * Check if location permission is granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result;
  } catch (err) {
    console.warn('Check location permission error:', err);
    return false;
  }
}

/**
 * Get current location coordinates
 */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location error:', error);
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address using Android native Geocoder
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  if (Platform.OS !== 'android') {
    throw new Error('Geocoding is only supported on Android');
  }

  if (!GeocoderModule) {
    throw new Error('GeocoderModule is not available. Make sure the native module is properly linked.');
  }

  try {
    const address = await GeocoderModule.reverseGeocode(latitude, longitude);
    return address;
  } catch (error: any) {
    console.error('Geocoding error:', error);
    throw new Error(error.message || 'Failed to get address');
  }
}

/**
 * Fetch current location and convert to address
 */
export async function fetchCurrentLocation(): Promise<LocationData> {
  try {
    // Check permission first
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    // Get current location
    const { latitude, longitude } = await getCurrentLocation();

    // Reverse geocode to get address
    const address = await reverseGeocode(latitude, longitude);

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch location');
  }
}

