import { useEffect, useState } from 'react';

import { handleStorageError } from '@/utils/errorHandler';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  /* Get from local storage then parse stored json or return initialValue */
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      /* Allow value to be a function so we have same API as useState */
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      /* Save to local storage */
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      /* Save state */
      setStoredValue(valueToStore);
    } catch (error) {
      /* Handle storage quota exceeded errors specifically */
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        handleStorageError(error, 'localStorage');
      } else {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return [storedValue, setValue];
}
