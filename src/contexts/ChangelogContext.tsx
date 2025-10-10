import { ReactNode, useCallback, useState } from 'react';
import { type ChangelogResult, useChangelogCache } from '../hooks/useChangelogCache';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChangelogContext } from './ChangelogContext.context';

interface ChangelogProviderProps {
  children: ReactNode;
}

export function ChangelogProvider({ children }: ChangelogProviderProps) {
  const [selectedModules, setSelectedModules] = useLocalStorage<string[]>(
    'expo-selected-modules',
    []
  );
  const [selectedBranch, setSelectedBranch] = useLocalStorage('expo-selected-branch', 'main');
  const [versionLimit, setVersionLimit] = useLocalStorage<number | 'all'>('expo-version-limit', 1);
  const [viewedModules, setViewedModules] = useLocalStorage<string[]>('expo-viewed-modules', []);

  const [loadingState, setLoadingState] = useState({
    loading: false,
    isInitializing: selectedModules.length > 0,
    progress: { loaded: 0, total: 0, cached: 0 },
  });
  const [changelogs, setChangelogs] = useState<ChangelogResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const { fetchChangelogs, clearCache: clearCacheImpl, dbReady } = useChangelogCache();

  const loadChangelogs = useCallback(
    async (modules: string[], branch: string, forceRefresh = false) => {
      if (modules.length === 0) {
        alert('Please select at least one module');
        return;
      }

      setLoadingState({
        loading: true,
        isInitializing: false,
        progress: { loaded: 0, total: modules.length, cached: 0 },
      });
      setChangelogs([]);
      setErrors([]);

      /* Add a 1-second minimum loading time to show progress */
      const [results] = await Promise.all([
        fetchChangelogs(modules, branch, forceRefresh, (loaded, total, cached) => {
          setLoadingState((prev) => ({
            ...prev,
            progress: { loaded, total, cached },
          }));
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      const successful = results.filter((r) => !r.error);
      const failed = results.filter((r) => r.error).map((r) => `${r.module}: ${r.error}`);

      setChangelogs(successful);
      setErrors(failed);
      setLoadingState((prev) => ({ ...prev, loading: false }));
    },
    [fetchChangelogs]
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
        loading: loadingState.loading,
        isInitializing: loadingState.isInitializing,
        loadProgress: loadingState.progress,
        errors,
        dbReady,
        selectedModules,
        setSelectedModules,
        selectedBranch,
        setSelectedBranch,
        versionLimit,
        setVersionLimit,
        viewedModules,
        setViewedModules,
        loadChangelogs,
        clearCache,
        setIsInitializing: (value: boolean) =>
          setLoadingState((prev) => ({ ...prev, isInitializing: value })),
      }}
    >
      {children}
    </ChangelogContext.Provider>
  );
}
