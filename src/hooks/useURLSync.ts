import { useEffect, useRef } from 'react';

interface URLSyncState {
  branch?: string;
  dateFilter?: string;
  hideUnchanged?: boolean;
  modules?: string[];
  versionLimit?: number | 'all';
}

/**
 * Hook to synchronize state with URL parameters for sharing
 */
export function useURLSync(state: URLSyncState) {
  const isInitialMount = useRef(true);

  /* Write to URL when the state changes (skip on the initial mount to avoid overwriting URL params) */
  useEffect(() => {
    /* Skip the first render to allow URL params to be read first */
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (state.modules && state.modules.length > 0) {
      params.set('modules', state.modules.join(','));
    }

    if (state.branch && state.branch !== 'main') {
      params.set('branch', state.branch);
    }

    if (state.versionLimit !== undefined && state.versionLimit !== 1) {
      params.set('versions', String(state.versionLimit));
    }

    if (state.dateFilter && state.dateFilter !== 'all') {
      params.set('date', state.dateFilter);
    }

    if (state.hideUnchanged === true) {
      params.set('hideUnchanged', 'true');
    }

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }, [state.modules, state.branch, state.versionLimit, state.dateFilter, state.hideUnchanged]);
}

/**
 * Read initial state from URL parameters
 */
export function getStateFromURL(): Partial<URLSyncState> {
  const params = new URLSearchParams(window.location.search);
  const state: Partial<URLSyncState> = {};

  const modulesParam = params.get('modules');
  if (modulesParam) {
    state.modules = modulesParam.split(',').filter(Boolean);
  }

  const branchParam = params.get('branch');
  if (branchParam) {
    state.branch = branchParam;
  }

  const versionsParam = params.get('versions');
  if (versionsParam) {
    state.versionLimit = versionsParam === 'all' ? 'all' : parseInt(versionsParam, 10);
  }

  const dateParam = params.get('date');
  if (dateParam) {
    state.dateFilter = dateParam;
  }

  const hideUnchangedParam = params.get('hideUnchanged');
  if (hideUnchangedParam === 'true') {
    state.hideUnchanged = true;
  }

  return state;
}

/**
 * Clear all URL parameters
 */
export function clearURLParams() {
  window.history.replaceState({}, '', window.location.pathname);
}
