import { useCallback, useEffect, useState } from 'react';

const DB_NAME = 'expo-changelog-db';
const DB_VERSION = 2; /* Bump to force re-hydration if cache structure changes */
const STORE_NAME = 'changelogs';

export interface CachedChangelog {
  key: string;
  module: string;
  branch: string;
  content: string;
  fetchedAt: number;
  ttl: number;
}

/**
 * Validates a cached changelog entry
 */
function validateEntry(entry: unknown): entry is CachedChangelog {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const obj = entry as Record<string, unknown>;

  return (
    typeof obj.key === 'string' &&
    typeof obj.module === 'string' &&
    typeof obj.branch === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.fetchedAt === 'number' &&
    typeof obj.ttl === 'number' &&
    obj.content.length > 0 &&
    !isNaN(obj.fetchedAt)
  );
}

/**
 * Opens IndexedDB with validation and recovery
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        /* Try to recover by deleting and recreating */
        indexedDB.deleteDatabase(DB_NAME);
        reject(new Error('Database corrupted, cleared for recovery'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        /* Delete old stores if they exist */
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }

        /* Create the new store */
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('module', 'module', { unique: false });
        store.createIndex('branch', 'branch', { unique: false });
        store.createIndex('fetchedAt', 'fetchedAt', { unique: false });
      };
    } catch (error) {
      console.error('IndexedDB not supported:', error);
      reject(error);
    }
  });
}

export function useIndexedDB() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    openDB()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.warn('IndexedDB initialization failed:', err);
        setDbReady(false);
      });
  }, []);

  const get = useCallback(
    async (key: string): Promise<CachedChangelog | null> => {
      if (!dbReady) return null;

      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result;
            if (result && validateEntry(result)) {
              resolve(result);
            } else {
              if (result) {
                console.warn('Invalid cache entry:', key, result);
              }
              resolve(null);
            }
          };
          request.onerror = () => {
            console.error('IndexedDB get error:', request.error);
            resolve(null); /* Don't reject, just return null */
          };
        });
      } catch (error) {
        console.error('IndexedDB get failed:', error);
        return null;
      }
    },
    [dbReady]
  );

  const set = useCallback(
    async (entry: CachedChangelog): Promise<void> => {
      if (!dbReady) return;

      if (!validateEntry(entry)) {
        console.error('Attempted to store invalid entry:', entry);
        return;
      }

      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(entry);

        return new Promise((resolve) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            console.error('IndexedDB set error:', transaction.error);
            resolve(); /* Don't reject, just log */
          };
        });
      } catch (error) {
        console.error('IndexedDB set failed:', error);
      }
    },
    [dbReady]
  );

  const clear = useCallback(async (): Promise<void> => {
    if (!dbReady) return;

    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      return new Promise((resolve) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.error('IndexedDB clear error:', transaction.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('IndexedDB clear failed:', error);
    }
  }, [dbReady]);

  const getAll = useCallback(async (): Promise<CachedChangelog[]> => {
    if (!dbReady) return [];

    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const results = request.result || [];
          const validated = results.filter(validateEntry);
          if (validated.length !== results.length) {
            console.warn('Some cache entries were invalid and skipped');
          }
          resolve(validated);
        };
        request.onerror = () => {
          console.error('IndexedDB getAll error:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.error('IndexedDB getAll failed:', error);
      return [];
    }
  }, [dbReady]);

  return { get, set, clear, getAll, dbReady };
}
