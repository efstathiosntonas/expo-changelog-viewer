import { useState } from 'react';
import { Moon, Sun, Monitor, Trash2, Github } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SidebarHeader() {
  const { theme, toggleTheme } = useTheme();
  const { clearCache } = useChangelogContext();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearStorage = async () => {
    await clearCache();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-5 pr-12 md:pr-5 border-b flex items-center justify-between">
      <h1 className="text-lg font-bold">Expo Changelogs Viewer</h1>
      <div className="flex gap-1">
        <Button asChild size="icon" title="View on GitHub" variant="ghost">
          <a
            href="https://github.com/efstathiosntonas/expo-changelog-viewer"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4" />
          </a>
        </Button>
        <AlertDialog onOpenChange={setClearDialogOpen} open={clearDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button size="icon" title="Clear storage and cache" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            onEscapeKeyDown={() => setClearDialogOpen(false)}
            onPointerDownOutside={() => setClearDialogOpen(false)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all saved selections, preferences, viewed modules, and cached
                changelogs. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearStorage}>Clear Everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={toggleTheme} size="icon" title={`Theme: ${theme}`} variant="ghost">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : theme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
