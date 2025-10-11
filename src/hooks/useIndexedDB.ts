import { useCallback, useEffect, useState } from 'react';

const DB_NAME = 'expo-changelog-db';
const DB_VERSION = 5; /* Bump to force re-hydration if cache structure changes */
const CHANGELOG_STORE = 'changelogs';
const NPM_STORE = 'npm-packages';

export interface CachedChangelog {
  branch: string;
  content: string;
  fetchedAt: number;
  key: string;
  module: string;
  ttl: number;
}

export interface CachedNpmPackage {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  fetchedAt: number;
  key: string; // packageName:version
  packageName: string;
  peerDependencies: Record<string, string>;
  ttl: number;
  version: string;
}

/**
 * Validates a cached changelog entry
 */
function validateChangelogEntry(entry: unknown): entry is CachedChangelog {
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
 * Validates a cached npm package entry
 */
function validateNpmEntry(entry: unknown): entry is CachedNpmPackage {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const obj = entry as Record<string, unknown>;

  return (
    typeof obj.key === 'string' &&
    typeof obj.packageName === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.fetchedAt === 'number' &&
    typeof obj.ttl === 'number' &&
    typeof obj.dependencies === 'object' &&
    typeof obj.peerDependencies === 'object' &&
    /* devDependencies is optional for backward compatibility */
    (typeof obj.devDependencies === 'object' || obj.devDependencies === undefined) &&
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
        if (db.objectStoreNames.contains(CHANGELOG_STORE)) {
          db.deleteObjectStore(CHANGELOG_STORE);
        }
        if (db.objectStoreNames.contains(NPM_STORE)) {
          db.deleteObjectStore(NPM_STORE);
        }

        /* Create changelog store */
        const changelogStore = db.createObjectStore(CHANGELOG_STORE, { keyPath: 'key' });
        changelogStore.createIndex('module', 'module', { unique: false });
        changelogStore.createIndex('branch', 'branch', { unique: false });
        changelogStore.createIndex('fetchedAt', 'fetchedAt', { unique: false });

        /* Create npm package store */
        const npmStore = db.createObjectStore(NPM_STORE, { keyPath: 'key' });
        npmStore.createIndex('packageName', 'packageName', { unique: false });
        npmStore.createIndex('version', 'version', { unique: false });
        npmStore.createIndex('fetchedAt', 'fetchedAt', { unique: false });
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

  const getChangelog = useCallback(
    async (key: string): Promise<CachedChangelog | null> => {
      if (!dbReady) return null;

      try {
        const db = await openDB();
        const transaction = db.transaction(CHANGELOG_STORE, 'readonly');
        const store = transaction.objectStore(CHANGELOG_STORE);
        const request = store.get(key);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result;
            if (result && validateChangelogEntry(result)) {
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
            resolve(null);
          };
        });
      } catch (error) {
        console.error('IndexedDB get failed:', error);
        return null;
      }
    },
    [dbReady]
  );

  const setChangelog = useCallback(
    async (entry: CachedChangelog): Promise<void> => {
      if (!dbReady) return;

      if (!validateChangelogEntry(entry)) {
        console.error('Attempted to store invalid entry:', entry);
        return;
      }

      try {
        const db = await openDB();
        const transaction = db.transaction(CHANGELOG_STORE, 'readwrite');
        const store = transaction.objectStore(CHANGELOG_STORE);
        store.put(entry);

        return new Promise((resolve) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            console.error('IndexedDB set error:', transaction.error);
            resolve();
          };
        });
      } catch (error) {
        console.error('IndexedDB set failed:', error);
      }
    },
    [dbReady]
  );

  const getNpmPackage = useCallback(
    async (key: string): Promise<CachedNpmPackage | null> => {
      if (!dbReady) return null;

      try {
        const db = await openDB();
        const transaction = db.transaction(NPM_STORE, 'readonly');
        const store = transaction.objectStore(NPM_STORE);
        const request = store.get(key);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result;
            if (result && validateNpmEntry(result)) {
              resolve(result);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => {
            console.error('IndexedDB npm get error:', request.error);
            resolve(null);
          };
        });
      } catch (error) {
        console.error('IndexedDB npm get failed:', error);
        return null;
      }
    },
    [dbReady]
  );

  const setNpmPackage = useCallback(
    async (entry: CachedNpmPackage): Promise<void> => {
      if (!dbReady) return;

      if (!validateNpmEntry(entry)) {
        console.error('Attempted to store invalid npm entry:', entry);
        return;
      }

      try {
        const db = await openDB();
        const transaction = db.transaction(NPM_STORE, 'readwrite');
        const store = transaction.objectStore(NPM_STORE);
        store.put(entry);

        return new Promise((resolve) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            console.error('IndexedDB npm set error:', transaction.error);
            resolve();
          };
        });
      } catch (error) {
        console.error('IndexedDB npm set failed:', error);
      }
    },
    [dbReady]
  );

  const clear = useCallback(async (): Promise<void> => {
    if (!dbReady) return;

    try {
      const db = await openDB();
      const transaction = db.transaction([CHANGELOG_STORE, NPM_STORE], 'readwrite');
      transaction.objectStore(CHANGELOG_STORE).clear();
      transaction.objectStore(NPM_STORE).clear();

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
      const transaction = db.transaction(CHANGELOG_STORE, 'readonly');
      const store = transaction.objectStore(CHANGELOG_STORE);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const results = request.result || [];
          const validated = results.filter(validateChangelogEntry);
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

  return {
    get: getChangelog,
    set: setChangelog,
    getNpmPackage,
    setNpmPackage,
    clear,
    getAll,
    dbReady,
  };
}
