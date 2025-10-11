import { Toaster } from 'sonner';

import { ChangelogProvider } from '@/contexts/ChangelogContext';
import { MobileNavProvider } from '@/contexts/MobileNavContext';

import { useChangelogContext } from '@/hooks/useChangelogContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { MainContent } from '@/components/MainContent/MainContent';
import { MobileNav } from '@/components/Sidebar/MobileNav';
import { Sidebar } from '@/components/Sidebar/Sidebar';

function AppContent() {
  const { changelogs, loading, selectedBranch } = useChangelogContext();

  /* Register keyboard shortcuts for better accessibility */
  useKeyboardShortcuts([
    {
      key: '/',
      handler: () => {
        const searchInput = document.getElementById('module-search') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search input',
    },
    {
      key: 'Escape',
      handler: () => {
        /* Close mobile nav if open */
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur();
      },
      description: 'Clear focus / Close dialogs',
    },
    {
      key: 'm',
      handler: () => {
        /* Scroll to main content */
        const mainContent = document.getElementById('main-content');
        mainContent?.focus();
        mainContent?.scrollIntoView({ behavior: 'smooth' });
      },
      description: 'Jump to main content',
    },
  ]);

  /* Update document title based on app state */
  const baseTitle = 'Expo Changelog Viewer';
  let titleSuffix = '';

  if (loading) {
    titleSuffix = ' - Loading...';
  } else if (changelogs.length > 0) {
    titleSuffix = ` - ${changelogs.length} Module${changelogs.length !== 1 ? 's' : ''} (${selectedBranch})`;
  }

  useDocumentTitle(`${baseTitle}${titleSuffix}`);

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        href="#main-content"
      >
        Skip to main content
      </a>
      <div aria-label="Expo Changelog Viewer" className="flex h-screen" role="application">
        <MobileNav />
        <Sidebar />
        <MainContent />
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}

function App() {
  return (
    <ChangelogProvider>
      <MobileNavProvider>
        <AppContent />
      </MobileNavProvider>
    </ChangelogProvider>
  );
}

export default App;
