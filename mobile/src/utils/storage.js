/**
 * storage.js
 * A simple async key-value storage wrapper over AsyncStorage.
 * Used by AppContext to persist app state across app restarts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  /**
   * Get a value by key. Returns the raw string (or null if not found).
   */
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn(`[storage] getItem error for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Set a string value for the given key.
   */
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn(`[storage] setItem error for key "${key}":`, err);
    }
  },

  /**
   * Remove an item by key.
   */
  deleteItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage] deleteItem error for key "${key}":`, err);
    }
  },

  /**
   * Clear all app storage (use with caution).
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn('[storage] clear error:', err);
    }
  },
};
