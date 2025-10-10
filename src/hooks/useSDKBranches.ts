import { useState, useEffect } from 'react';
import { SDK_VERSIONS } from '@/utils/moduleList.ts';

export interface SDKVersion {
  value: string;
  label: string;
}

const GITHUB_API_URL = 'https://api.github.com/repos/expo/expo/branches';
const PER_PAGE = 100;
const STORAGE_KEY = 'expo-sdk-branches-cache';
const CACHE_VERSION = 2; /* Bump this when the cache structure changes for indexedDB rehydration/recreate */
const CACHE_TTL_HOURS = 24; /* Cache for 24 hours to avoid rate limiting */

/* Helper function to process raw branch names into SDK versions with labels */
const processBranchNames = (
  branchNames: string[]
): { versions: SDKVersion[]; defaultBranch: string } => {
  const sdkBranches = branchNames
    .filter((name) => /^sdk-\d+$/.test(name))
    .map((name) => ({
      value: name,
      label: name.toUpperCase().replace('SDK-', 'SDK '),
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.value.split('-')[1] ?? '0', 10);
      const bNum = parseInt(b.value.split('-')[1] ?? '0', 10);
      return bNum - aNum; /* Descending order */
    });

  /* Add (latest) label to the first SDK (highest version number) */
  if (sdkBranches.length > 0) {
    sdkBranches[0] = {
      ...sdkBranches[0],
      label: `${sdkBranches[0].label} (latest)`,
    };
  }

  /* Put main at the top and rename it to "🔥 Next (unversioned)" */
  const versions = [{ value: 'main', label: '🔥 Next (unversioned)' }, ...sdkBranches];
  const defaultBranch = sdkBranches[0]?.value ?? 'main';

  return { versions, defaultBranch };
};

interface CacheData {
  version: number;
  branchNames: string[];
  timestamp: number;
}

const readCachedVersions = (): { versions: SDKVersion[]; defaultBranch: string } | null => {
  if (typeof window === 'undefined') {
    console.log('[SDK Cache] Window is undefined, skipping cache read');
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    console.log('[SDK Cache] Raw cache data:', raw ? `${raw.substring(0, 100)}...` : 'null');

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    console.log('[SDK Cache] Parsed cache:', parsed);

    /* Check if it's the new format with version */
    if (parsed && typeof parsed === 'object' && 'version' in parsed) {
      const cacheData = parsed as CacheData;
      console.log('[SDK Cache] Cache version:', cacheData.version, 'Expected:', CACHE_VERSION);

      /* If version doesn't match, clear the cache */
      if (cacheData.version !== CACHE_VERSION) {
        console.log(
          `[SDK Cache] ⚠️ Version mismatch (${cacheData.version} !== ${CACHE_VERSION}), clearing...`
        );
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      /* Check if cache is expired */
      const cacheAge = Date.now() - (cacheData.timestamp || 0);
      const cacheAgeHours = cacheAge / (1000 * 60 * 60);
      console.log(`[SDK Cache] Cache age: ${cacheAgeHours.toFixed(1)} hours`);

      if (cacheAgeHours > CACHE_TTL_HOURS) {
        console.log(
          `[SDK Cache] ⚠️ Cache expired (${cacheAgeHours.toFixed(1)}h > ${CACHE_TTL_HOURS}h), will re-fetch`
        );
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      /* Validate branch names */
      if (!Array.isArray(cacheData.branchNames)) {
        console.log('[SDK Cache] ⚠️ branchNames is not an array');
        return null;
      }

      const branchNames = cacheData.branchNames.filter(
        (item): item is string => typeof item === 'string'
      );
      console.log('[SDK Cache] Valid branch names:', branchNames.length);

      if (branchNames.length === 0) return null;

      /* Process the raw branch names into versions with labels */
      const result = processBranchNames(branchNames);
      console.log('[SDK Cache] ✅ Loaded from cache:', result.versions.length, 'versions');
      return result;
    }

    /* Old format (array) - clear it */
    console.log('[SDK Cache] ⚠️ Old cache format detected, clearing...');
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (err) {
    console.error('[SDK Cache] ❌ Error reading cache:', err);
    return null;
  }
};

const writeCachedVersions = (branchNames: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    /* Store with version and timestamp for future migrations and TTL */
    const cacheData: CacheData = {
      version: CACHE_VERSION,
      branchNames,
      timestamp: Date.now(),
    };
    console.log('[SDK Cache] Writing to cache:', branchNames.length, 'branches');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.error('[SDK Cache] ❌ Failed to write cache:', err);
  }
};

/**
 * Custom hook to dynamically fetch SDK branches from GitHub
 */
export function useSDKBranches() {
  const cachedData = readCachedVersions();
  const initialVersions = cachedData?.versions ?? [
    { value: 'main', label: '🔥 Next (unversioned)' },
  ];
  const [sdkVersions, setSdkVersions] = useState<SDKVersion[]>(initialVersions);
  const [defaultBranch, setDefaultBranch] = useState<string>(cachedData?.defaultBranch ?? 'main');
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const hasInitialCache = Boolean(cachedData);

  useEffect(() => {
    let cancelled = false;

    const fetchBranches = async () => {
      try {
        console.log('[SDK Branches] Starting fetch from GitHub API...');
        console.log('[SDK Branches] Has initial cache:', hasInitialCache);

        if (!hasInitialCache) {
          setLoading(true);
        }
        const collectedBranches: Array<{ name: string }> = [];
        let page = 1;

        while (true) {
          const url = `${GITHUB_API_URL}?per_page=${PER_PAGE}&page=${page}`;
          console.log(`[SDK Branches] Fetching page ${page} from:`, url);

          const response = await fetch(url, {
            headers: {
              Accept: 'application/vnd.github+json',
            },
          });

          console.log(`[SDK Branches] Response status:`, response.status);

          /* Check for rate limiting */
          if (response.status === 403) {
            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
            const rateLimitReset = response.headers.get('X-RateLimit-Reset');
            console.error('[SDK Branches] ⛔ GitHub API Rate Limited!');
            console.error('[SDK Branches] Remaining:', rateLimitRemaining);
            if (rateLimitReset) {
              const resetDate = new Date(parseInt(rateLimitReset) * 1000);
              console.error('[SDK Branches] Reset at:', resetDate.toLocaleString());
            }
            throw new Error(
              `GitHub API rate limited. Resets at ${rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown'}`
            );
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch branches: ${response.status}`);
          }

          const chunk = await response.json();
          console.log(`[SDK Branches] Page ${page} returned ${chunk.length} branches`);
          collectedBranches.push(...chunk);

          const linkHeader = response.headers.get('Link');
          const hasNextPage = linkHeader?.includes('rel="next"');
          console.log(`[SDK Branches] Has next page:`, hasNextPage);

          if (!hasNextPage || chunk.length < PER_PAGE) {
            break;
          }

          page += 1;
        }

        console.log(`[SDK Branches] Total branches collected:`, collectedBranches.length);

        /* Extract branch names and add 'main' to the list */
        const branchNames = collectedBranches.map((branch) => branch.name);
        const allBranchNames = [...branchNames, 'main'];

        console.log('[SDK Branches] All branch names:', allBranchNames.slice(0, 10), '...');

        if (!cancelled) {
          /* Process the branch names into versions with labels */
          const { versions, defaultBranch: latestSdk } = processBranchNames(allBranchNames);

          console.log('[SDK Branches] Processed versions:', versions.length);
          console.log('[SDK Branches] Default branch:', latestSdk);
          console.log('[SDK Branches] First 5 versions:', versions.slice(0, 5));

          setSdkVersions(versions);
          setDefaultBranch(latestSdk);
          /* Store only raw branch names in cache */
          writeCachedVersions(allBranchNames);
          setError(null);

          console.log('[SDK Branches] ✅ Successfully fetched and cached');
        }
      } catch (err) {
        console.error('[SDK Branches] ❌ Fetch failed:', err);

        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          /* Fallback to static list if fetching fails */
          console.log('[SDK Branches] Falling back to SDK_VERSIONS:', SDK_VERSIONS);
          setSdkVersions(SDK_VERSIONS);
          /* Extract branch names from SDK_VERSIONS for caching */
          const fallbackBranchNames = SDK_VERSIONS.map((v) => v.value);
          writeCachedVersions(fallbackBranchNames);

          console.log('[SDK Branches] ⚠️ Using fallback static list');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBranches();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sdkVersions, defaultBranch, loading, error };
}
