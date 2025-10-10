import { CATEGORIES } from '@/utils/moduleList';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  onSelectAll,
  onClearAll,
}: CategoryFilterProps) {
  return (
    <div className="p-4 border-b space-y-4">
      <div>
        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted/40 px-2 text-muted-foreground">Category Filter</span>
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted/40 px-2 text-muted-foreground">Module Selection</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll} className="flex-1">
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={onClearAll} className="flex-1">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
