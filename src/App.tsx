import { ChangelogProvider } from './contexts/ChangelogContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MobileNav } from './components/Sidebar/MobileNav';
import { MainContent } from './components/MainContent/MainContent';

function App() {
  return (
    <ChangelogProvider>
      <div className="flex h-screen">
        <MobileNav />
        <Sidebar />
        <MainContent />
      </div>
    </ChangelogProvider>
  );
}

export default App;
