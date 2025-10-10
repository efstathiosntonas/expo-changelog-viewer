import { ReactNode } from 'react';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  children: ReactNode;
}

export function LoadingState({ children }: LoadingStateProps) {
  const { loading, isInitializing, loadProgress, changelogs } = useChangelogContext();

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
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Loading Changelogs...</h3>
            <p className="text-muted-foreground mb-2">
              {loadProgress.loaded} of {loadProgress.total} modules loaded
            </p>
            <p className="text-sm text-muted-foreground">
              ({loadProgress.cached} from cache, {loadProgress.loaded - loadProgress.cached}{' '}
              fetched)
            </p>
          </div>
          <Progress value={progressPercent} className="w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
