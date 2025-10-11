import { RefreshCw } from 'lucide-react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CacheStatusBanner() {
  const { changelogs, errors, loading, loadChangelogs, selectedModules, selectedBranch } =
    useChangelogContext();

  if (changelogs.length === 0) return null;

  const cachedCount = changelogs.filter((c) => c.cached).length;
  const freshCount = changelogs.filter((c) => !c.cached && !c.error).length;

  return (
    <div
      aria-label="Cache status information"
      className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between"
      role="status"
    >
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="font-semibold text-foreground">Cache Status:</span>{' '}
          <Badge
            aria-label={`${cachedCount} modules loaded from cache`}
            className="ml-2"
            variant="success"
          >
            {cachedCount} Cached
          </Badge>
          <Badge
            aria-label={`${freshCount} modules freshly fetched`}
            className="ml-2"
            variant="default"
          >
            {freshCount} Fresh
          </Badge>
          {errors.length > 0 && (
            <Badge
              aria-label={`${errors.length} modules failed to load`}
              className="ml-2"
              variant="destructive"
            >
              {errors.length} Failed
            </Badge>
          )}
        </div>
      </div>
      <Button
        aria-label="Fetch fresh changelog data for all modules"
        disabled={loading}
        onClick={() => loadChangelogs(selectedModules, selectedBranch, true)}
        size="sm"
        variant="outline"
      >
        <RefreshCw aria-hidden="true" className="h-4 w-4 mr-2" />
        Fetch Fresh
      </Button>
    </div>
  );
}
