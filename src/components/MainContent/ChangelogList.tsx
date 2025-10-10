import { useMemo, useRef, useEffect } from 'react';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { ChangelogItem, type ChangelogItemRef } from './ChangelogItem';

interface ChangelogListProps {
  onToggleViewed: (moduleName: string, checked: boolean) => void;
  onCollapseAllChange?: (callback: (expanded: boolean) => void) => void;
}

export function ChangelogList({ onToggleViewed, onCollapseAllChange }: ChangelogListProps) {
  const { changelogs, versionLimit, viewedModules, loading, isInitializing } =
    useChangelogContext();

  /* Sort: unviewed first, then viewed */
  const sortedChangelogs = useMemo(() => {
    const unviewed = changelogs.filter((c) => !viewedModules.includes(c.module));
    const viewed = changelogs.filter((c) => viewedModules.includes(c.module));
    return [...unviewed, ...viewed];
  }, [changelogs, viewedModules]);

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

  if (loading || isInitializing) {
    return null;
  }

  if (sortedChangelogs.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="inline-block p-8 bg-muted rounded-2xl mb-4">
          <svg
            className="w-16 h-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
      {sortedChangelogs.map((changelog) => (
        <ChangelogItem
          key={changelog.module}
          ref={(ref) => {
            itemRefs.current.set(changelog.module, ref);
          }}
          changelog={changelog}
          versionLimit={versionLimit}
          isViewed={viewedModules.includes(changelog.module)}
          onToggleViewed={onToggleViewed}
          defaultExpanded={true}
        />
      ))}
    </div>
  );
}
