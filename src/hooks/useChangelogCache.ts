import { useCallback } from 'react';
import { useIndexedDB, type CachedChangelog } from './useIndexedDB';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/expo/expo';

/* TTL in milliseconds */
const TTL_CONFIG = {
  main: 1000 * 60 * 60 /* 1 hour for the main branch */,
  latest: 1000 * 60 * 60 * 24 /* 24 hours for the latest SDK */,
  older: 1000 * 60 * 60 * 24 * 7 /* 7 days for older SDKs */,
};

export interface ChangelogResult {
  module: string;
  content: string;
  error?: string;
  cached: boolean;
  fetchedAt?: number;
}

/**
 * Determines TTL based on branch
 */
function getTTL(branch: string): number {
  if (branch === 'main') return TTL_CONFIG.main;

  /* Extract SDK version number */
  const match = branch.match(/^sdk-(\d+)$/);
  if (!match) return TTL_CONFIG.older;

  const version = parseInt(match[1], 10);

  /* Latest SDK (54 as of Oct 2025) */
  if (version >= 54) return TTL_CONFIG.latest;

  /* Older SDKs */
  return TTL_CONFIG.older;
}

/**
 * Checks if cached entry is still valid
 */
function isValid(entry: CachedChangelog): boolean {
  const now = Date.now();
  const age = now - entry.fetchedAt;
  return age < entry.ttl;
}

export function useChangelogCache() {
  const { get, set, clear, dbReady } = useIndexedDB();

  const fetchChangelog = useCallback(
    async (module: string, branch: string, forceRefresh = false): Promise<ChangelogResult> => {
      const key = `${module}-${branch}`;

      /* Try cache first (unless force refresh) */
      if (!forceRefresh && dbReady) {
        try {
          const cached = await get(key);
          if (cached && isValid(cached)) {
            return {
              module,
              content: cached.content,
              cached: true,
              fetchedAt: cached.fetchedAt,
            };
          }
        } catch (error) {
          console.warn('Cache read failed, fetching fresh:', error);
        }
      }

      /* Fetch from GitHub */
      const url = `${GITHUB_RAW_URL}/${branch}/packages/${module}/CHANGELOG.md`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const content = await response.text();
        const fetchedAt = Date.now();

        /* Store in cache */
        if (dbReady) {
          const ttl = getTTL(branch);
          await set({
            key,
            module,
            branch,
            content,
            fetchedAt,
            ttl,
          });
        }

        return {
          module,
          content,
          cached: false,
          fetchedAt,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          module,
          content: '',
          error: errorMessage,
          cached: false,
        };
      }
    },
    [get, set, dbReady]
  );

  const fetchChangelogs = useCallback(
    async (
      modules: string[],
      branch: string,
      forceRefresh = false,
      onProgress?: (loaded: number, total: number, cached: number) => void
    ): Promise<ChangelogResult[]> => {
      const results: ChangelogResult[] = [];
      let cached = 0;

      for (let i = 0; i < modules.length; i++) {
        const result = await fetchChangelog(modules[i], branch, forceRefresh);
        results.push(result);

        if (result.cached) {
          cached++;
        }

        if (onProgress) {
          onProgress(i + 1, modules.length, cached);
        }
      }

      return results;
    },
    [fetchChangelog]
  );

  const clearCache = useCallback(async () => {
    await clear();
  }, [clear]);

  return {
    fetchChangelog,
    fetchChangelogs,
    clearCache,
    dbReady,
  };
}
