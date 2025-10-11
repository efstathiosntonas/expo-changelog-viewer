import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/components/ui/help-icon';

interface ModuleSelectionActionsProps {
  onClearAll: () => void;
  onSelectAll: () => void;
}

export function ModuleSelectionActions({ onSelectAll, onClearAll }: ModuleSelectionActionsProps) {
  return (
    <div className="px-4 py-5 border-b">
      <div className="relative mb-3">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-muted/40 px-2 text-muted-foreground flex items-center gap-1.5">
            <span id="module-selection-label">Module Selection</span>
            <HelpIcon className="h-3 w-3">
              <p className="font-semibold mb-1">Bulk module selection</p>
              <p className="text-xs">
                &quot;Select All&quot; checks all visible modules in the current category/search.
                &quot;Clear&quot; unchecks them all. Or use checkboxes below to pick individual
                modules.
              </p>
            </HelpIcon>
          </span>
        </div>
      </div>
      <div aria-labelledby="module-selection-label" className="flex gap-2" role="group">
        <Button
          aria-label="Select all visible modules"
          className="flex-1"
          onClick={onSelectAll}
          size="sm"
          variant="outline"
        >
          Select All
        </Button>
        <Button
          aria-label="Clear all visible module selections"
          className="flex-1"
          onClick={onClearAll}
          size="sm"
          variant="outline"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
