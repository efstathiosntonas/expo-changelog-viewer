import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Upload, HelpCircle } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parsePackageJson, readFileAsText } from '@/utils/packageJsonParser';

export function ConfigPanel() {
  const {
    selectedModules,
    setSelectedModules,
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
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Reading file...');
      const content = await readFileAsText(file);
      const result = parsePackageJson(content);

      if (result.matched.length === 0) {
        setImportStatus('⚠️ No Expo modules found in package.json');
        setTimeout(() => setImportStatus(null), 3000);
        return;
      }

      /* Auto-select matched modules */
      setSelectedModules((prev: string[]) => [...new Set([...prev, ...result.matched])]);

      const message = `✓ ${result.matched.length} module${result.matched.length !== 1 ? 's' : ''} selected${
        result.unmatched.length > 0 ? ` (${result.unmatched.length} unmatched)` : ''
      }`;
      setImportStatus(message);
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      console.log(error);
      setImportStatus('❌ Invalid package.json file');
      setTimeout(() => setImportStatus(null), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="px-4 py-5 space-y-4 border-b">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              SDK Version
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Select which Expo SDK version&apos;s changelogs to fetch. Each SDK has its own
                  changelog branch.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="flex items-center gap-1.5 mb-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Version Limit
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Limits how many versions to display</p>
                <p className="text-xs">
                  Works with Date Filter: First filters by date, then limits the number of versions
                  shown. If using date filters, set this to &quot;All versions&quot; to see all
                  matching results.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <div className="flex items-center gap-1.5 mb-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Date Filter
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Filter versions by release date</p>
                <p className="text-xs mb-2">
                  &quot;After last visit&quot; shows only versions released since you last marked
                  the module as viewed.
                </p>
                <p className="text-xs text-muted-foreground">
                  Works with Version Limit and Hide unchanged filters.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="hide-unchanged"
            checked={hideUnchanged}
            onCheckedChange={setHideUnchanged}
          />
          <label htmlFor="hide-unchanged" className="text-sm cursor-pointer select-none">
            Hide unchanged versions
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Filters out empty changelog versions</p>
              <p className="text-xs">
                Hides versions with &quot;no user-facing changes&quot; text. Modules with no changes
                are moved to the bottom of the list.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="border-t" />

      <div className="px-4 py-5 space-y-4 border-b">
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
              aria-label="Upload package.json"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from package.json
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Quick import from your project</p>
                  <p className="text-xs">
                    Upload your package.json to automatically select all Expo modules from your
                    dependencies. All processing happens locally in your browser.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            🔒 100% private - processed locally in your browser
          </p>
          {importStatus && (
            <p
              className={`text-xs text-center py-1 px-2 rounded ${
                importStatus.startsWith('❌')
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  : importStatus.startsWith('⚠️')
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
              }`}
            >
              {importStatus}
            </p>
          )}
        </div>
      </div>

      <div className="border-t" />

      <div className="px-4 py-5">
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
    </TooltipProvider>
  );
}
