import { createContext } from 'react';
import { type ChangelogResult } from '../hooks/useChangelogCache';

interface LoadProgress {
  loaded: number;
  total: number;
  cached: number;
}

export interface ChangelogContextType {
  changelogs: ChangelogResult[];
  loading: boolean;
  isInitializing: boolean;
  loadProgress: LoadProgress;
  errors: string[];
  dbReady: boolean;
  selectedModules: string[];
  setSelectedModules: (modules: string[] | ((prev: string[]) => string[])) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  versionLimit: number | 'all';
  setVersionLimit: (limit: number | 'all') => void;
  viewedModules: string[];
  setViewedModules: (modules: string[] | ((prev: string[]) => string[])) => void;
  loadChangelogs: (modules: string[], branch: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
  setIsInitializing: (value: boolean) => void;
}

export const ChangelogContext = createContext<ChangelogContextType | null>(null);
