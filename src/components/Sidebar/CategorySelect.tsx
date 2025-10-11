import { HelpIcon } from '@/components/ui/help-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { CATEGORIES } from '@/utils/moduleList';

interface CategorySelectProps {
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

export function CategorySelect({ selectedCategory, onCategoryChange }: CategorySelectProps) {
  return (
    <div className="px-4 py-5 border-b">
      <div className="relative mb-3">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-muted/40 px-2 text-muted-foreground flex items-center gap-1.5">
            <span id="category-filter-label">Category Filter</span>
            <HelpIcon className="h-3 w-3">
              <p className="font-semibold mb-1">Filter modules by category</p>
              <p className="text-xs">
                Narrow down the module list by selecting a category (e.g., Camera, Location,
                Authentication, etc.).
              </p>
            </HelpIcon>
          </span>
        </div>
      </div>
      <Select onValueChange={onCategoryChange} value={selectedCategory}>
        <SelectTrigger
          aria-describedby="category-filter-label"
          aria-label="Filter modules by category"
          className={selectedCategory !== 'all' ? 'border-purple-500 dark:border-purple-400' : ''}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent role="listbox">
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
