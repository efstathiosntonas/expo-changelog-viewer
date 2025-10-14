import { ReactNode, useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useChangelogCache } from '../hooks/useChangelogCache';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getStateFromURL, useURLSync } from '../hooks/useURLSync';
import { type DateFilterType } from '../utils/dateFilter';
import { initNpmCache } from '../utils/npmDependencyComparer';
import { ChangelogContext } from './ChangelogContext.context';

import type { ChangelogResult } from '../hooks/useChangelogCache';

interface ChangelogProviderProps {
  children: ReactNode;
}

export function ChangelogProvider({ children }: ChangelogProviderProps) {
  /* Get initial state from URL (takes precedence over localStorage) - only computed once */
  const [urlState] = useState(getStateFromURL);

  const [selectedModules, setSelectedModules] = useLocalStorage<string[]>(
    'expo-selected-modules',
    urlState.modules || []
  );
  const [selectedBranch, setSelectedBranch] = useLocalStorage(
    'expo-selected-branch',
    urlState.branch || 'main'
  );
  const [versionLimit, setVersionLimit] = useLocalStorage<number | 'all'>(
    'expo-version-limit',
    urlState.versionLimit ?? 1
  );
  const [viewedModules, setViewedModules] = useLocalStorage<string[]>('expo-viewed-modules', []);
  const [dateFilter, setDateFilter] = useLocalStorage<DateFilterType>(
    'expo-date-filter',
    (urlState.dateFilter as DateFilterType) || 'all'
  );
  const [hideUnchanged, setHideUnchanged] = useLocalStorage<boolean>(
    'expo-hide-unchanged',
    urlState.hideUnchanged ?? false
  );
  const [moduleLastViewed, setModuleLastViewed] = useLocalStorage<Record<string, number>>(
    'expo-module-last-viewed',
    {}
  );

  /* Sync state with URL parameters */
  useURLSync({
    modules: selectedModules,
    branch: selectedBranch,
    versionLimit,
    dateFilter,
    hideUnchanged,
  });

  const [loadingState, setLoadingState] = useState({
    loading: false,
    isInitializing: selectedModules.length > 0,
    progress: { loaded: 0, total: 0, cached: 0 },
  });
  const [changelogs, setChangelogs] = useState<ChangelogResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const { getNpmPackage, setNpmPackage } = useIndexedDB();
  const { fetchChangelogs, clearCache: clearCacheImpl, dbReady } = useChangelogCache();

  /* Initialize npm cache on mount */
  useEffect(() => {
    if (getNpmPackage && setNpmPackage) {
      initNpmCache({ get: getNpmPackage, set: setNpmPackage });
    }
  }, [getNpmPackage, setNpmPackage]);

  const loadChangelogs = useCallback(
    async (modules: string[], branch: string, forceRefresh = false) => {
      if (modules.length === 0) {
        toast.warning('Please select at least one module');
        return;
      }

      /* Generate unique request ID to prevent race conditions */
      const requestId = `${Date.now()}-${Math.random()}`;
      setCurrentRequestId(requestId);

      /* Track which modules are new (not in current changelogs) */
      const previousModules = new Set(changelogs.map((c) => c.module));
      const newlyAddedModules = modules.filter((m) => !previousModules.has(m));

      /* Incremental load: only fetch new modules if not force refreshing */
      const modulesToFetch = forceRefresh
        ? modules
        : newlyAddedModules.length > 0
          ? newlyAddedModules
          : modules;
      const isIncrementalLoad =
        !forceRefresh && newlyAddedModules.length > 0 && changelogs.length > 0;

      /* Clear viewed modules on force refresh to start fresh */
      if (forceRefresh) {
        setViewedModules([]);
      }

      setLoadingState({
        loading: true,
        isInitializing: false,
        progress: { loaded: 0, total: modulesToFetch.length, cached: 0 },
      });

      /* Only clear existing changelogs if force refresh */
      if (forceRefresh) {
        setChangelogs([]);
        setErrors([]);
      }

      /* Add a 1-second minimum loading time to show progress */
      const [results] = await Promise.all([
        fetchChangelogs(
          modulesToFetch,
          branch,
          forceRefresh,
          (loaded, total, cached, currentModule) => {
            setLoadingState((prev) => ({
              ...prev,
              progress: { loaded, total, cached, currentModule },
            }));
          }
        ),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      /* Check if this request is still current - if not, discard results */
      setCurrentRequestId((current) => {
        if (current !== requestId) {
          console.log('Discarding stale request results');
          return current; /* Keep the current request ID */
        }

        /* This is the current request, process results */
        const successful = results.filter((r) => !r.error);
        const failed = results.filter((r) => r.error).map((r) => `${r.module}: ${r.error}`);

        if (isIncrementalLoad) {
          /* Merge new results with existing changelogs, new ones first */
          setChangelogs((prev) => {
            /* Deduplicate: keep new results, then add old ones that aren't duplicates */
            const moduleSet = new Set(successful.map((c) => c.module));
            const uniquePrev = prev.filter((c) => !moduleSet.has(c.module));
            return [...successful, ...uniquePrev];
          });
          setErrors((prev) => [...prev, ...failed]);
        } else {
          /* Sort results: newly added modules first, then others */
          const sortedResults = successful.sort((a, b) => {
            const aIsNew = newlyAddedModules.includes(a.module);
            const bIsNew = newlyAddedModules.includes(b.module);
            if (aIsNew && !bIsNew) return -1;
            if (!aIsNew && bIsNew) return 1;
            return 0;
          });

          setChangelogs(sortedResults);
          setErrors(failed);
        }

        setLoadingState((prev) => ({ ...prev, loading: false }));
        return null; /* Clear current request ID */
      });
    },
    [fetchChangelogs, setViewedModules, changelogs]
  );

  const clearCache = useCallback(async () => {
    await clearCacheImpl();
    setChangelogs([]);
    setErrors([]);
  }, [clearCacheImpl]);

  return (
    <ChangelogContext.Provider
      value={{
        changelogs,
        clearCache,
        dateFilter,
        dbReady,
        errors,
        hideUnchanged,
        isInitializing: loadingState.isInitializing,
        loadChangelogs,
        loading: loadingState.loading,
        loadProgress: loadingState.progress,
        moduleLastViewed,
        selectedBranch,
        selectedModules,
        setChangelogs,
        setDateFilter,
        setHideUnchanged,
        setIsInitializing: (value: boolean) =>
          setLoadingState((prev) => ({ ...prev, isInitializing: value })),
        setModuleLastViewed,
        setSelectedBranch,
        setSelectedModules,
        setVersionLimit,
        setViewedModules,
        versionLimit,
        viewedModules,
      }}
    >
      {children}
    </ChangelogContext.Provider>
  );
}
