import { Button } from '@/components/ui/button';
import { useChangelogContext } from '@/hooks/useChangelogContext';

interface ActionHeaderProps {
  onCollapseAll: () => void;
  onExport: () => void;
  allExpanded: boolean;
}

export function ActionHeader({ onCollapseAll, onExport, allExpanded }: ActionHeaderProps) {
  const { changelogs } = useChangelogContext();

  if (changelogs.length === 0) return null;

  return (
    <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <h2 className="text-2xl md:text-3xl font-bold">Changelogs ({changelogs.length})</h2>
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
