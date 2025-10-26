import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

/**
 * Zustand storage adapter for AsyncStorage
 */
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  },
};

/**
 * Clear all AsyncStorage data (useful for debugging)
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('All AsyncStorage data cleared');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

/**
 * Log all stored data (useful for debugging)
 */
export const logAllStoredData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log('Stored data:', items);
  } catch (error) {
    console.error('Error reading AsyncStorage:', error);
  }
};

