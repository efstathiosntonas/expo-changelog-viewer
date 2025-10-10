import { HelpCircle } from 'lucide-react';
import { CATEGORIES } from '@/utils/moduleList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CategorySelectProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySelect({ selectedCategory, onCategoryChange }: CategorySelectProps) {
  return (
    <div className="px-4 py-5 border-b">
      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-muted/40 px-2 text-muted-foreground flex items-center gap-1.5">
            Category Filter
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="hover:text-foreground transition-colors">
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
  );
}
