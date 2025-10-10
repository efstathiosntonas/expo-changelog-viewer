import { createContext } from 'react';

import { type ChangelogResult } from '@/hooks/useChangelogCache';

import { type DateFilterType } from '@/utils/dateFilter';

interface LoadProgress {
  cached: number;
  loaded: number;
  total: number;
}

export interface ChangelogContextType {
  changelogs: ChangelogResult[];
  clearCache: () => Promise<void>;
  dateFilter: DateFilterType;
  dbReady: boolean;
  errors: string[];
  hideUnchanged: boolean;
  isInitializing: boolean;
  loadChangelogs: (modules: string[], branch: string, forceRefresh?: boolean) => Promise<void>;
  loadProgress: LoadProgress;
  loading: boolean;
  moduleLastViewed: Record<string, number>;
  selectedBranch: string;
  selectedModules: string[];
  setDateFilter: (filter: DateFilterType) => void;
  setHideUnchanged: (hide: boolean) => void;
  setIsInitializing: (value: boolean) => void;
  setModuleLastViewed: (
    data: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedModules: (modules: string[] | ((prev: string[]) => string[])) => void;
  setVersionLimit: (limit: number | 'all') => void;
  setViewedModules: (modules: string[] | ((prev: string[]) => string[])) => void;
  versionLimit: number | 'all';
  viewedModules: string[];
}

export const ChangelogContext = createContext<ChangelogContextType | null>(null);
