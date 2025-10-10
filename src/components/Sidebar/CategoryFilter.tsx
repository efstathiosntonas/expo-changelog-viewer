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
    <div className="p-4 border-b">
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
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={onSelectAll} className="flex-1">
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={onClearAll} className="flex-1">
          Clear
        </Button>
      </div>
    </div>
  );
}
