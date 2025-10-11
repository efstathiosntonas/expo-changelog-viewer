import { Search, X } from 'lucide-react';

interface ModuleSearchProps {
  onChange: (value: string) => void;
  value: string;
}

export function ModuleSearch({ value, onChange }: ModuleSearchProps) {
  return (
    <div className="px-4 py-5 border-b" role="search">
      <label className="sr-only" htmlFor="module-search">
        Search modules
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <input
          aria-describedby="search-hint"
          aria-label="Search modules"
          className="w-full pl-9 pr-9 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          id="module-search"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search modules..."
          type="search"
          value={value}
        />
        <span className="sr-only" id="search-hint">
          Type to filter the module list
        </span>
        {value && (
          <button
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onChange('')}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
