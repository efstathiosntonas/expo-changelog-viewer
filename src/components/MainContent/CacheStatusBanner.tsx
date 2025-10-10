import { RefreshCw } from 'lucide-react';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CacheStatusBanner() {
  const { changelogs, errors, loading, loadChangelogs, selectedModules, selectedBranch } =
    useChangelogContext();

  if (changelogs.length === 0) return null;

  const cachedCount = changelogs.filter((c) => c.cached).length;
  const freshCount = changelogs.filter((c) => !c.cached && !c.error).length;

  return (
    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="font-semibold text-foreground">Cache Status:</span>{' '}
          <Badge variant="success" className="ml-2">
            {cachedCount} Cached
          </Badge>
          <Badge variant="default" className="ml-2">
            {freshCount} Fresh
          </Badge>
          {errors.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {errors.length} Failed
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => loadChangelogs(selectedModules, selectedBranch, true)}
        disabled={loading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Fetch Fresh
      </Button>
    </div>
  );
}
