import { Button } from '@/components/ui/button';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import {
  parseChangelog,
  filterVersionsByDate,
  hasNoUserFacingChanges,
} from '@/utils/changelogFilter';
import { getDateFilterCutoff } from '@/utils/dateFilter';
import { useMemo } from 'react';

interface ActionHeaderProps {
  onCollapseAll: () => void;
  onExport: () => void;
  allExpanded: boolean;
}

export function ActionHeader({ onCollapseAll, onExport, allExpanded }: ActionHeaderProps) {
  const { changelogs, hideUnchanged, dateFilter, moduleLastViewed } = useChangelogContext();

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
    <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">
          Changelogs ({visibleCount}
          {hiddenCount > 0 && ` of ${changelogs.length}`})
        </h2>
        {hiddenCount > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {hiddenCount} module{hiddenCount !== 1 ? 's' : ''} hidden (no changes)
          </p>
        )}
      </div>
      <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={onCollapseAll}
          className="flex-1 sm:flex-none text-sm md:text-base"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
        <Button onClick={onExport} className="flex-1 sm:flex-none text-sm md:text-base">
          Export Markdown
        </Button>
      </div>
    </div>
  );
}
