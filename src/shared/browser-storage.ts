import type { StoragePort } from './ports';

/** Browser window localStorage adapter conforming to StoragePort. */
export const browserStoragePort: StoragePort = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage quota or privacy sandbox restriction
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage quota or privacy sandbox restriction
    }
  },
};
