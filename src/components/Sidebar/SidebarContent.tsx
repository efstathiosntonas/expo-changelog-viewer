import { useState, useMemo } from 'react';
import { EXPO_MODULES } from '@/utils/moduleList';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { SidebarHeader } from './SidebarHeader';
import { ModuleSearch } from './ModuleSearch';
import { ConfigPanel } from './ConfigPanel';
import { CategoryFilter } from './CategoryFilter';
import { ModuleList } from './ModuleList';

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
      <>
        <SidebarHeader />
        <ModuleSearch value={searchTerm} onChange={setSearchTerm} />
        <ConfigPanel />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
        />
        <ModuleList
          selectedModules={selectedModules}
          onToggleModule={handleToggleModule}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
        />
      </>
    );
  }

  /* Desktop version with a fixed header and scrollable module list */
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <SidebarHeader />
        <ModuleSearch value={searchTerm} onChange={setSearchTerm} />
        <ConfigPanel />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
        />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <ModuleList
          selectedModules={selectedModules}
          onToggleModule={handleToggleModule}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
}
