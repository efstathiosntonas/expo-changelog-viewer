import { Toaster } from 'sonner';

import { ChangelogProvider } from '@/contexts/ChangelogContext';
import { MobileNavProvider } from '@/contexts/MobileNavContext';

import { MainContent } from '@/components/MainContent/MainContent';
import { MobileNav } from '@/components/Sidebar/MobileNav';
import { Sidebar } from '@/components/Sidebar/Sidebar';

function App() {
  return (
    <ChangelogProvider>
      <MobileNavProvider>
        <div className="flex h-screen">
          <MobileNav />
          <Sidebar />
          <MainContent />
        </div>
        <Toaster position="top-right" richColors />
      </MobileNavProvider>
    </ChangelogProvider>
  );
}

export default App;
