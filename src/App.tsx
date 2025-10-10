import { ChangelogProvider } from './contexts/ChangelogContext';
import { MobileNavProvider } from './contexts/MobileNavContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MobileNav } from './components/Sidebar/MobileNav';
import { MainContent } from './components/MainContent/MainContent';

function App() {
  return (
    <ChangelogProvider>
      <MobileNavProvider>
        <div className="flex h-screen">
          <MobileNav />
          <Sidebar />
          <MainContent />
        </div>
      </MobileNavProvider>
    </ChangelogProvider>
  );
}

export default App;
