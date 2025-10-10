import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { CATEGORIES } from '@/utils/moduleList';

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  selectedCategory: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  onSelectAll,
  onClearAll,
}: CategoryFilterProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="px-4 py-5 border-b space-y-4">
        <div>
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-muted/40 px-2 text-muted-foreground flex items-center gap-1.5">
                Category Filter
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="hover:text-foreground transition-colors" type="button">
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Filter modules by category</p>
                    <p className="text-xs">
                      Narrow down the module list by selecting a category (e.g., Camera, Location,
                      Authentication, etc.).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
            </div>
          </div>
          <Select onValueChange={onCategoryChange} value={selectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-muted/40 px-2 text-muted-foreground flex items-center gap-1.5">
                Module Selection
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="hover:text-foreground transition-colors" type="button">
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Bulk module selection</p>
                    <p className="text-xs">
                      &quot;Select All&quot; checks all visible modules in the current
                      category/search. &quot;Clear&quot; unchecks them all. Or use checkboxes below
                      to pick individual modules.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onSelectAll} size="sm" variant="outline">
              Select All
            </Button>
            <Button className="flex-1" onClick={onClearAll} size="sm" variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
