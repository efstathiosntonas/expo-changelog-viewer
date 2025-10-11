import { useMemo, useState } from 'react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import { TooltipProvider } from '@/components/ui/tooltip';

import { EXPO_MODULES } from '@/utils/moduleList';

import { CategorySelect } from './CategorySelect';
import { ConfigPanel } from './ConfigPanel';
import { ModuleList } from './ModuleList';
import { ModuleSearch } from './ModuleSearch';
import { ModuleSelectionActions } from './ModuleSelectionActions';
import { SidebarHeader } from './SidebarHeader';

interface SidebarContentProps {
  isMobile?: boolean;
}

export function SidebarContent({ isMobile = false }: SidebarContentProps) {
  const { selectedModules, setSelectedModules, changelogs, setChangelogs } = useChangelogContext();
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

    /* If unchecking and module is loaded, remove it from the changelog list */
    if (!checked && changelogs.some((c) => c.module === moduleName)) {
      setChangelogs((prev) => prev.filter((c) => c.module !== moduleName));
    }
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
        <ModuleSearch onChange={setSearchTerm} value={searchTerm} />
        <ConfigPanel />
        <CategorySelect
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        <ModuleSelectionActions onClearAll={handleClearAll} onSelectAll={handleSelectAll} />
        <ModuleList
          onToggleModule={handleToggleModule}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedModules={selectedModules}
          showCategoryFilter={false}
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
            <ModuleSearch onChange={setSearchTerm} value={searchTerm} />
            <ConfigPanel />
            <CategorySelect
              onCategoryChange={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <ModuleSelectionActions onClearAll={handleClearAll} onSelectAll={handleSelectAll} />
          <div className="flex-1 overflow-y-auto">
            <ModuleList
              onToggleModule={handleToggleModule}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedModules={selectedModules}
              showCategoryFilter={true}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
