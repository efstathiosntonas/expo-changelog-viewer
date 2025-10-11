import { useCallback } from 'react';

import { enrichChangelogWithDependencies } from '@/utils/changelogEnricher';
import { parseChangelog } from '@/utils/changelogFilter';
import { fetchWithRetry } from '@/utils/retryWithBackoff';

import { useIndexedDB } from './useIndexedDB';

import type { ChangelogVersion } from '@/utils/changelogFilter';
import type { CachedChangelog } from './useIndexedDB';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/expo/expo';

/* TTL in milliseconds */
const TTL_CONFIG = {
  main: 1000 * 60 * 60 /* 1 hour for the main branch */,
  latest: 1000 * 60 * 60 * 24 /* 24 hours for the latest SDK */,
  older: 1000 * 60 * 60 * 24 * 7 /* 7 days for older SDKs */,
};

export interface ChangelogResult {
  cached: boolean;
  content: string;
  enrichedVersions?: ChangelogVersion[];
  error?: string;
  fetchedAt?: number;
  module: string;
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

      /* Fetch from GitHub with retry logic */
      const url = `${GITHUB_RAW_URL}/${branch}/packages/${module}/CHANGELOG.md`;

      try {
        const response = await fetchWithRetry(url, undefined, {
          maxRetries: 2,
          initialDelay: 500,
          shouldRetry: (error) => {
            /* Don't retry 404s - changelog doesn't exist */
            if (error instanceof Response && error.status === 404) {
              return false;
            }
            /* Retry network errors and 5xx server errors */
            return true;
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const content = await response.text();
        const fetchedAt = Date.now();

        /* Store in cache (but don't fail if storage is full) */
        if (dbReady) {
          try {
            const ttl = getTTL(branch);
            await set({
              key,
              module,
              branch,
              content,
              fetchedAt,
              ttl,
            });
          } catch (error) {
            /* Storage errors are handled in useIndexedDB, just log here */
            console.warn(`Failed to cache ${module}:`, error);
          }
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
      onProgress?: (loaded: number, total: number, cached: number, currentModule?: string) => void
    ): Promise<ChangelogResult[]> => {
      const results: ChangelogResult[] = [];
      let cached = 0;
      const BATCH_SIZE = 10; /* Fetch 10 modules concurrently */
      const BATCH_DELAY = 100; /* 100ms delay between batches */

      /* Process modules in batches for speed while showing progress */
      for (let batchStart = 0; batchStart < modules.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, modules.length);
        const batch = modules.slice(batchStart, batchEnd);

        /* Report progress before batch */
        if (onProgress) {
          onProgress(batchStart, modules.length, cached, batch[0]);
        }

        /* Fetch batch in parallel */
        const batchResults = await Promise.all(
          batch.map((module) => fetchChangelog(module, branch, forceRefresh))
        );

        /* Collect results and update cache count */
        batchResults.forEach((result) => {
          results.push(result);
          if (result.cached) {
            cached++;
          }
        });

        /* Report progress after batch */
        if (onProgress) {
          onProgress(batchEnd, modules.length, cached);
        }

        /* Add small delay between batches to be respectful to GitHub */
        if (batchEnd < modules.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      }

      /* Enrich changelogs with dependency information in parallel */
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          /* Skip enrichment if there was an error fetching */
          if (result.error || !result.content) {
            return result;
          }

          try {
            const versions = parseChangelog(result.content);
            const enrichedVersions = await enrichChangelogWithDependencies(result.module, versions);

            return {
              ...result,
              enrichedVersions,
            };
          } catch (error) {
            console.warn(`Failed to enrich ${result.module}:`, error);
            return result;
          }
        })
      );

      return enrichedResults;
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
