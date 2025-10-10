import { useState, useMemo } from 'react';
import { EXPO_MODULES } from '@/utils/moduleList';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { SidebarHeader } from './SidebarHeader';
import { ModuleSearch } from './ModuleSearch';
import { ConfigPanel } from './ConfigPanel';
import { CategorySelect } from './CategorySelect';
import { ModuleSelectionActions } from './ModuleSelectionActions';
import { ModuleList } from './ModuleList';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SidebarContentProps {
  isMobile?: boolean;
}

export function SidebarContent({ isMobile = false }: SidebarContentProps) {
  const { selectedModules, setSelectedModules } = useChangelogContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredModules = useMemo(() => {
    return EXPO_MODULES.filter((module) => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleToggleModule = (moduleName: string, checked: boolean) => {
    setSelectedModules((prev: string[]) =>
      checked ? [...prev, moduleName] : prev.filter((m: string) => m !== moduleName)
    );
  };

  const handleSelectAll = () => {
    const allNames = filteredModules.map((m) => m.name);
    setSelectedModules((prev: string[]) => [...new Set([...prev, ...allNames])]);
  };

  const handleClearAll = () => {
    const allNames = filteredModules.map((m) => m.name);
    setSelectedModules((prev: string[]) => prev.filter((m: string) => !allNames.includes(m)));
  };

  /*
   * On mobile: sidebar scrolls all together
   * On desktop: header/config/filters are fixed, only module checkbox list scrolls
   */
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={300}>
        <SidebarHeader />
        <ModuleSearch value={searchTerm} onChange={setSearchTerm} />
        <ConfigPanel />
        <CategorySelect
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ModuleSelectionActions onSelectAll={handleSelectAll} onClearAll={handleClearAll} />
        <ModuleList
          selectedModules={selectedModules}
          onToggleModule={handleToggleModule}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
        />
      </TooltipProvider>
    );
  }

  /* Desktop version: Side-by-side layout (filters | modules) */
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full">
        <div className="w-1/2 border-r flex flex-col">
          <SidebarHeader />
          <div className="flex-1 overflow-y-auto">
            <ModuleSearch value={searchTerm} onChange={setSearchTerm} />
            <ConfigPanel />
            <CategorySelect
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <ModuleSelectionActions onSelectAll={handleSelectAll} onClearAll={handleClearAll} />
          <div className="flex-1 overflow-y-auto">
            <ModuleList
              selectedModules={selectedModules}
              onToggleModule={handleToggleModule}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
