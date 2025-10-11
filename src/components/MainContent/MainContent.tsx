import { useState } from 'react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import { ActionHeader } from './ActionHeader';
import { CacheStatusBanner } from './CacheStatusBanner';
import { ChangelogList } from './ChangelogList';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingState } from './LoadingState';

export function MainContent() {
  const { changelogs, selectedBranch, setViewedModules, setModuleLastViewed } =
    useChangelogContext();
  const [allExpanded, setAllExpanded] = useState(true);
  const [collapseAllFn, setCollapseAllFn] = useState<((expanded: boolean) => void) | null>(null);

  const handleCollapseAll = () => {
    if (collapseAllFn) {
      collapseAllFn(!allExpanded);
    }
    setAllExpanded(!allExpanded);
  };

  const handleToggleViewed = (moduleName: string, checked: boolean) => {
    setViewedModules((prev: string[]) =>
      checked ? [...prev, moduleName] : prev.filter((m: string) => m !== moduleName)
    );

    if (checked) {
      setModuleLastViewed((prev) => ({
        ...prev,
        [moduleName]: Date.now(),
      }));
    }
  };

  const handleClearAllViewed = () => {
    setViewedModules([]);
  };

  const handleExportMarkdown = () => {
    if (changelogs.length === 0) return;
    const markdown = changelogs.map((c) => `# ${c.module}\n\n${c.content}\n\n---\n`).join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expo-changelogs-${selectedBranch}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main
      aria-label="Changelog content"
      className="flex-1 overflow-y-auto"
      id="main-content"
      role="main"
    >
      <div className="max-w-7xl mx-auto p-4 pt-20 md:p-8 md:pt-8">
        <CacheStatusBanner />
        <ActionHeader
          allExpanded={allExpanded}
          onClearAllViewed={handleClearAllViewed}
          onCollapseAll={handleCollapseAll}
          onExport={handleExportMarkdown}
        />
        <ErrorDisplay />
        <LoadingState>
          <ChangelogList
            onCollapseAllChange={(fn) => setCollapseAllFn(() => fn)}
            onToggleViewed={handleToggleViewed}
          />
        </LoadingState>
      </div>
    </main>
  );
}
