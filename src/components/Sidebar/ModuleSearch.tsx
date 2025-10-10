import { Search, X } from 'lucide-react';

interface ModuleSearchProps {
  onChange: (value: string) => void;
  value: string;
}

export function ModuleSearch({ value, onChange }: ModuleSearchProps) {
  return (
    <div className="px-4 py-5 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-9 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search modules..."
          type="text"
          value={value}
        />
        {value && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
