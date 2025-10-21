import { ReactNode, useEffect, useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  children: ReactNode;
}

const FUNNY_MESSAGES = [
  'Preparing the changelog magic',
  'Summoning the release notes',
  'Dusting off the version history',
  'Gathering the change artifacts',
  'Brewing some fresh updates',
  'Fetching the good stuff',
  'Compiling the update chronicles',
  'Loading the version vault',
  'Retrieving change mysteries',
  'Assembling the changelog puzzle',
  'Harvesting version wisdom',
  'Collecting change stories',
  'Mining changelog gold',
  'Unwrapping version gifts',
  'Decoding the update matrix',
];

export function LoadingState({ children }: LoadingStateProps) {
  const {
    loading,
    isInitializing,
    loadProgress,
    changelogs,
    loadChangelogs,
    selectedModules,
    selectedBranch,
  } = useChangelogContext();

  /* Pick a random funny message initially */
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * FUNNY_MESSAGES.length)
  );

  /* Rotate message every 2 seconds while loading to keep user engaged lol */
  useEffect(() => {
    if (!loading || changelogs.length > 0) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading, changelogs.length]);

  const funnyMessage = FUNNY_MESSAGES[messageIndex];

  /* Show nothing while initializing (checking if an autoload needed) */
  if (isInitializing) {
    return null;
  }

  if (loading && changelogs.length === 0) {
    const progressPercent =
      loadProgress.total > 0 ? (loadProgress.loaded / loadProgress.total) * 100 : 0;

    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="flex items-center justify-center min-h-[calc(100vh-16rem)]"
        role="status"
      >
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <h3 aria-label={`${funnyMessage}, please wait`} className="text-2xl font-bold">
              {funnyMessage}...
            </h3>
            <p aria-live="polite" className="text-lg text-muted-foreground">
              {loadProgress.loaded} of {loadProgress.total} modules loaded
            </p>
            {loadProgress.currentModule && (
              <p aria-live="polite" className="text-sm text-primary font-mono animate-pulse">
                Loading: {loadProgress.currentModule}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {loadProgress.cached} from cache · {loadProgress.loaded - loadProgress.cached} fresh
            </p>
          </div>
          <Progress
            aria-label={`Loading progress: ${Math.round(progressPercent)}%`}
            className="w-full"
            value={progressPercent}
          />
          <Button
            aria-label="Fetch fresh changelog data for all modules"
            className="w-full"
            onClick={() => loadChangelogs(selectedModules, selectedBranch, true)}
            size="sm"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4 mr-2" />
            Fetch Fresh
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
