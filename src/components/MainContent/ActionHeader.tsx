import { useMemo } from 'react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import { Button } from '@/components/ui/button';

import {
  filterVersionsByDate,
  hasNoUserFacingChanges,
  parseChangelog,
} from '@/utils/changelogFilter';
import { getDateFilterCutoff } from '@/utils/dateFilter';

interface ActionHeaderProps {
  allExpanded: boolean;
  onClearAllViewed: () => void;
  onCollapseAll: () => void;
  onExport: () => void;
}

export function ActionHeader({
  onCollapseAll,
  onExport,
  onClearAllViewed,
  allExpanded,
}: ActionHeaderProps) {
  const { changelogs, hideUnchanged, dateFilter, moduleLastViewed, viewedModules } =
    useChangelogContext();

  const hiddenCount = useMemo(() => {
    if (!hideUnchanged) return 0;

    return changelogs.filter((c) => {
      /* Hide modules with no user-facing changes */
      if (hasNoUserFacingChanges(c.content)) {
        return true;
      }

      /* Also count date-filtered modules for visibility */
      if (dateFilter !== 'all') {
        const versions = parseChangelog(c.content);
        const lastVisit = moduleLastViewed[c.module];
        const cutoff = getDateFilterCutoff(dateFilter, lastVisit);
        const filteredVersions = filterVersionsByDate(versions, cutoff);
        return filteredVersions.length === 0;
      }

      return false;
    }).length;
  }, [changelogs, hideUnchanged, dateFilter, moduleLastViewed]);

  const visibleCount = changelogs.length - hiddenCount;

  if (changelogs.length === 0) return null;

  return (
    <header className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold" id="changelog-count">
          Changelogs ({visibleCount}
          {hiddenCount > 0 && ` of ${changelogs.length}`})
        </h2>
        {hiddenCount > 0 && (
          <p aria-live="polite" className="text-sm text-muted-foreground mt-1" role="status">
            {hiddenCount} module{hiddenCount !== 1 ? 's' : ''} hidden (no changes)
          </p>
        )}
      </div>
      <div
        aria-label="Changelog actions"
        className="flex gap-2 md:gap-3 w-full sm:w-auto flex-wrap"
        role="toolbar"
      >
        <Button
          aria-expanded={allExpanded}
          aria-label={allExpanded ? 'Collapse all changelog items' : 'Expand all changelog items'}
          className="flex-1 sm:flex-none text-sm md:text-base"
          onClick={onCollapseAll}
          variant="outline"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
        {viewedModules.length > 0 && (
          <Button
            aria-label={`Clear all ${viewedModules.length} viewed module${viewedModules.length !== 1 ? 's' : ''}`}
            className="flex-1 sm:flex-none text-sm md:text-base"
            onClick={onClearAllViewed}
            variant="outline"
          >
            Clear All Viewed ({viewedModules.length})
          </Button>
        )}
        <Button
          aria-label="Export all changelogs as markdown file"
          className="flex-1 sm:flex-none text-sm md:text-base"
          onClick={onExport}
        >
          Export Markdown
        </Button>
      </div>
    </header>
  );
}
