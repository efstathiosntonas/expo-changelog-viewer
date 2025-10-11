import { ReactNode, useEffect, useState } from 'react';

import { useChangelogContext } from '@/hooks/useChangelogContext';

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
  const { loading, isInitializing, loadProgress, changelogs } = useChangelogContext();

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
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold">{funnyMessage}...</h3>
            <p className="text-lg text-muted-foreground">
              {loadProgress.loaded} of {loadProgress.total} modules loaded
            </p>
            {loadProgress.currentModule && (
              <p className="text-sm text-primary font-mono animate-pulse">
                Loading: {loadProgress.currentModule}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {loadProgress.cached} from cache · {loadProgress.loaded - loadProgress.cached} fresh
            </p>
          </div>
          <Progress className="w-full" value={progressPercent} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
