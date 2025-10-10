import { CATEGORIES, EXPO_MODULES, type ExpoModule } from '@/utils/moduleList';
import { Checkbox } from '@/components/ui/checkbox';

interface ModuleListProps {
  onToggleModule: (moduleName: string, checked: boolean) => void;
  searchTerm: string;
  selectedCategory: string;
  selectedModules: string[];
  showCategoryFilter?: boolean;
}

export function ModuleList({
  selectedModules,
  onToggleModule,
  searchTerm,
  selectedCategory,
  showCategoryFilter = false,
}: ModuleListProps) {
  const filteredModules = EXPO_MODULES.filter((module) => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderModuleItem = (mod: ExpoModule) => (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent group"
      key={mod.name}
    >
      <Checkbox
        checked={selectedModules.includes(mod.name)}
        id={mod.name}
        onCheckedChange={(checked) => onToggleModule(mod.name, checked as boolean)}
      />
      <label
        className="text-sm font-mono cursor-pointer group-hover:text-primary flex-1"
        htmlFor={mod.name}
      >
        {mod.name}
      </label>
    </div>
  );

  return (
    <div className="px-3 pt-3 pb-3">
      {showCategoryFilter && selectedCategory !== 'all' && (
        <div className="mb-3 px-2 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Filtering by: <span className="font-semibold">{selectedCategory}</span>
          </p>
        </div>
      )}
      <div className="text-xs text-muted-foreground px-2 py-2">
        {selectedModules.length} of {EXPO_MODULES.length} selected
      </div>
      <div className="space-y-4">
        {selectedCategory === 'all' ? (
          CATEGORIES.map((category) => {
            const catModules = filteredModules.filter((m) => m.category === category);
            if (catModules.length === 0) return null;
            return (
              <div key={category}>
                <div className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 py-1.5 bg-gray-100 dark:bg-gray-900">
                  {category}
                </div>
                <div className="space-y-2 pt-1">{catModules.map(renderModuleItem)}</div>
              </div>
            );
          })
        ) : (
          <div>
            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 py-1.5 bg-gray-100 dark:bg-gray-900">
              {selectedCategory}
            </div>
            <div className="space-y-2 pt-1">{filteredModules.map(renderModuleItem)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
