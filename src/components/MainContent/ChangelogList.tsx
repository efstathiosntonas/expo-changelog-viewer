import { useEffect, useMemo, useRef } from 'react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import {
  filterVersionsByDate,
  hasNoUserFacingChanges,
  parseChangelog,
} from '@/utils/changelogFilter';
import { getDateFilterCutoff } from '@/utils/dateFilter';

import { ChangelogItem } from './ChangelogItem';

import type { ChangelogItemRef } from './ChangelogItem';

interface ChangelogListProps {
  onCollapseAllChange?: (callback: (expanded: boolean) => void) => void;
  onToggleViewed: (moduleName: string, checked: boolean) => void;
}

export function ChangelogList({ onToggleViewed, onCollapseAllChange }: ChangelogListProps) {
  const {
    changelogs,
    versionLimit,
    viewedModules,
    loading,
    isInitializing,
    dateFilter,
    hideUnchanged,
    moduleLastViewed,
    loadProgress,
  } = useChangelogContext();

  /* Filter and sort changelogs */
  const sortedChangelogs = useMemo(() => {
    const filtered = changelogs;

    /* When hideUnchanged is enabled, separate modules with/without changes */
    if (hideUnchanged) {
      /* Split into modules with changes and modules without */
      const withChanges: typeof changelogs = [];
      const withoutChanges: typeof changelogs = [];

      changelogs.forEach((c) => {
        /* Check if module has no user-facing changes */
        const noUserChanges = hasNoUserFacingChanges(c.content);

        /* Check if module has no changes after date filtering */
        let noDateChanges = false;
        if (dateFilter !== 'all') {
          const versions = parseChangelog(c.content);
          const lastVisit = moduleLastViewed[c.module];
          const cutoff = getDateFilterCutoff(dateFilter, lastVisit);
          const filteredVersions = filterVersionsByDate(versions, cutoff);
          noDateChanges = filteredVersions.length === 0;
        }

        if (noUserChanges || noDateChanges) {
          withoutChanges.push(c);
        } else {
          withChanges.push(c);
        }
      });

      /* Sort each group: unviewed first, then viewed */
      const sortGroup = (group: typeof changelogs) => {
        const unviewed = group.filter((c) => !viewedModules.includes(c.module));
        const viewed = group.filter((c) => viewedModules.includes(c.module));
        return [...unviewed, ...viewed];
      };

      /* Return modules with changes first, then modules without changes at the bottom */
      return [...sortGroup(withChanges), ...sortGroup(withoutChanges)];
    }

    /* Normal sorting when hideUnchanged is disabled: unviewed first, then viewed */
    const unviewed = filtered.filter((c) => !viewedModules.includes(c.module));
    const viewed = filtered.filter((c) => viewedModules.includes(c.module));
    return [...unviewed, ...viewed];
  }, [changelogs, viewedModules, hideUnchanged, dateFilter, moduleLastViewed]);

  const itemRefs = useRef<Map<string, ChangelogItemRef | null>>(new Map());

  useEffect(() => {
    if (onCollapseAllChange) {
      const collapseAll = (expanded: boolean) => {
        itemRefs.current.forEach((ref) => {
          ref?.setExpanded(expanded);
        });
      };
      onCollapseAllChange(collapseAll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Show loading state only when initializing or loading with no existing changelogs */
  if ((loading || isInitializing) && sortedChangelogs.length === 0) {
    return null;
  }

  if (!loading && !isInitializing && sortedChangelogs.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="inline-block p-8 bg-muted rounded-2xl mb-4">
          <svg
            className="w-16 h-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">No Changelogs Loaded</h3>
        <p className="text-muted-foreground">
          Select modules and click <strong>&ldquo;Load XX Modules&rdquo;</strong> on the sidebar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading placeholder for incremental loads */}
      {loading && sortedChangelogs.length > 0 && (
        <div className="border rounded-lg bg-card p-8">
          <div className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm text-muted-foreground">
              Loading {loadProgress.total} module{loadProgress.total > 1 ? 's' : ''}...
            </span>
          </div>
        </div>
      )}

      {sortedChangelogs.map((changelog) => (
        <ChangelogItem
          changelog={changelog}
          defaultExpanded={true}
          isViewed={viewedModules.includes(changelog.module)}
          key={changelog.module}
          onToggleViewed={onToggleViewed}
          ref={(ref) => {
            itemRefs.current.set(changelog.module, ref);
          }}
          versionLimit={versionLimit}
        />
      ))}
    </div>
  );
}
