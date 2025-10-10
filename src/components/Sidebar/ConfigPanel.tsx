import { useEffect, useState } from 'react';
import { useSDKBranches } from '@/hooks/useSDKBranches';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { useMobileNav } from '@/contexts/MobileNavContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ConfigPanel() {
  const {
    selectedModules,
    selectedBranch,
    setSelectedBranch,
    versionLimit,
    setVersionLimit,
    dateFilter,
    setDateFilter,
    hideUnchanged,
    setHideUnchanged,
    loading,
    loadChangelogs,
    changelogs,
    dbReady,
    setIsInitializing,
  } = useChangelogContext();
  const { sdkVersions, defaultBranch, loading: loadingVersions } = useSDKBranches();
  const { closeMobileNav } = useMobileNav();
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [hasSetDefaultBranch, setHasSetDefaultBranch] = useState(false);

  /* Update selectedBranch to defaultBranch if it's still in 'main' and we have a better default */
  useEffect(() => {
    if (
      !hasSetDefaultBranch &&
      selectedBranch === 'main' &&
      defaultBranch !== 'main' &&
      !loadingVersions
    ) {
      setSelectedBranch(defaultBranch);
      setHasSetDefaultBranch(true);
    }
  }, [defaultBranch, loadingVersions, selectedBranch, setSelectedBranch, hasSetDefaultBranch]);

  useEffect(() => {
    if (
      !hasAutoLoaded &&
      selectedModules.length > 0 &&
      changelogs.length === 0 &&
      !loading &&
      dbReady
    ) {
      console.log('Auto-loading changelogs from cache...');
      setHasAutoLoaded(true);
      loadChangelogs(selectedModules, selectedBranch, false).finally(() => {
        setIsInitializing(false);
      });
    } else if (!hasAutoLoaded && (selectedModules.length === 0 || changelogs.length > 0)) {
      /* No autoload needed - either no modules selected or already loaded */
      setIsInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAutoLoaded, selectedModules.length, changelogs.length, loading, dbReady]);

  const handleBranchChange = async (newBranch: string) => {
    setSelectedBranch(newBranch);

    /* If there are loaded changelogs, reload them with the new branch */
    if (changelogs.length > 0 && selectedModules.length > 0) {
      await loadChangelogs(selectedModules, newBranch, true);
    }
  };

  const handleLoad = () => {
    closeMobileNav();
    loadChangelogs(selectedModules, selectedBranch, false).catch(console.log);
  };

  return (
    <div className="p-4 space-y-4 border-b">
      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
          SDK Version
        </label>
        <Select
          value={selectedBranch}
          onValueChange={handleBranchChange}
          disabled={loadingVersions}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select SDK" />
          </SelectTrigger>
          <SelectContent>
            {sdkVersions.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
          Version Limit
        </label>
        <Select
          value={versionLimit.toString()}
          onValueChange={(val) => setVersionLimit(val === 'all' ? 'all' : parseInt(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Latest only</SelectItem>
            <SelectItem value="2">Last 2</SelectItem>
            <SelectItem value="3">Last 3</SelectItem>
            <SelectItem value="4">Last 4</SelectItem>
            <SelectItem value="5">Last 5</SelectItem>
            <SelectItem value="6">Last 6</SelectItem>
            <SelectItem value="7">Last 7</SelectItem>
            <SelectItem value="8">Last 8</SelectItem>
            <SelectItem value="9">Last 9</SelectItem>
            <SelectItem value="10">Last 10</SelectItem>
            <SelectItem value="all">All versions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
          Date Filter
        </label>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="after-last-visit">After last visit ⭐</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter !== 'all' && versionLimit !== 'all' && versionLimit < 5 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-start gap-1">
            <span className="mt-0.5">⚠️</span>
            <span>
              Version limit may hide filtered versions. Consider increasing limit or set to
              &quot;All versions&quot;.
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="hide-unchanged" checked={hideUnchanged} onCheckedChange={setHideUnchanged} />
        <label htmlFor="hide-unchanged" className="text-sm cursor-pointer select-none">
          Hide unchanged modules
        </label>
      </div>

      <Button
        onClick={handleLoad}
        disabled={loading || selectedModules.length === 0}
        className="w-full"
      >
        {loading
          ? 'Loading...'
          : `Load ${selectedModules.length} Module${selectedModules.length !== 1 ? 's' : ''}`}
      </Button>
    </div>
  );
}
