import { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronRight } from 'lucide-react';
import { type ChangelogResult } from '@/hooks/useChangelogCache';
import {
  parseChangelog,
  filterVersions,
  filterVersionsByDate,
  combineVersions,
  hasNoUserFacingChanges,
} from '@/utils/changelogFilter';
import { getDateFilterCutoff } from '@/utils/dateFilter';
import { useChangelogContext } from '@/hooks/useChangelogContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChangelogItemProps {
  changelog: ChangelogResult;
  versionLimit: number | 'all';
  isViewed: boolean;
  onToggleViewed: (moduleName: string, checked: boolean) => void;
  defaultExpanded?: boolean;
}

export interface ChangelogItemRef {
  setExpanded: (expanded: boolean) => void;
}

export const ChangelogItem = forwardRef<ChangelogItemRef, ChangelogItemProps>(
  ({ changelog, versionLimit, isViewed, onToggleViewed, defaultExpanded = false }, ref) => {
    const { dateFilter, moduleLastViewed, setModuleLastViewed } = useChangelogContext();

    /* Check if the changelog has no user-facing changes */
    const hasNoChanges = useMemo(() => {
      return hasNoUserFacingChanges(changelog.content);
    }, [changelog.content]);

    const [isExpanded, setIsExpanded] = useState(hasNoChanges ? false : defaultExpanded);
    const [cacheLabel, setCacheLabel] = useState('');

    useImperativeHandle(ref, () => ({
      setExpanded: (expanded: boolean) => setIsExpanded(expanded),
    }));

    const versions = parseChangelog(changelog.content);

    /* Apply date filtering */
    const { filteredByDate, cutoffDate } = useMemo(() => {
      const lastVisit = moduleLastViewed[changelog.module];
      const cutoff = getDateFilterCutoff(dateFilter, lastVisit);
      const filtered = filterVersionsByDate(versions, cutoff);
      return { filteredByDate: filtered, cutoffDate: cutoff };
    }, [versions, dateFilter, moduleLastViewed, changelog.module]);

    /* Apply version limit filtering */
    const filteredVersions = filterVersions(filteredByDate, versionLimit);
    const displayContent = combineVersions(filteredVersions);

    /* Calculate how many new versions since last visit */
    const newVersionCount = useMemo(() => {
      if (dateFilter !== 'after-last-visit' || !cutoffDate) return 0;
      return filteredByDate.length;
    }, [dateFilter, cutoffDate, filteredByDate.length]);

    /* Update cache age label every minute */
    useEffect(() => {
      const updateLabel = () => {
        if (!changelog.fetchedAt) {
          setCacheLabel('');
          return;
        }
        const age = Math.floor((Date.now() - changelog.fetchedAt) / (1000 * 60));
        setCacheLabel(age < 60 ? `${age}m ago` : `${Math.floor(age / 60)}h ago`);
      };

      updateLabel();
      const interval = setInterval(updateLabel, 60000); /* Update every minute */

      return () => clearInterval(interval);
    }, [changelog.fetchedAt]);

    /* Update the last viewed timestamp when marking as viewed */
    useEffect(() => {
      if (isViewed) {
        setModuleLastViewed((prev) => ({
          ...prev,
          [changelog.module]: Date.now(),
        }));
      }
    }, [isViewed, changelog.module, setModuleLastViewed]);

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className={`border rounded-lg bg-card transition-all ${isViewed ? 'opacity-40' : ''}`}
      >
        <div className="p-3 md:p-4 flex items-start sm:items-center justify-between bg-[#f1f3f5] dark:bg-[#1e293b] hover:bg-[#e9ecef] dark:hover:bg-[#334155] transition-colors cursor-pointer rounded-t-lg border-b gap-2">
          <div className="flex items-start sm:items-center gap-2 md:gap-3 flex-1 min-w-0">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0 mt-0.5 sm:mt-0"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-bold font-mono break-all">
                  {changelog.module}
                </h3>
                {changelog.cached && (
                  <Badge variant="success" className="text-xs flex-shrink-0">
                    Cached {cacheLabel}
                  </Badge>
                )}
                {!changelog.cached && !changelog.error && (
                  <Badge variant="success" className="text-xs flex-shrink-0">
                    Fresh ✓
                  </Badge>
                )}
                {dateFilter === 'after-last-visit' && newVersionCount > 0 && (
                  <Badge variant="default" className="text-xs flex-shrink-0">
                    {newVersionCount} new
                  </Badge>
                )}
                {hasNoChanges && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    No user-facing changes
                  </Badge>
                )}
                {!hasNoChanges &&
                  dateFilter !== 'all' &&
                  cutoffDate &&
                  filteredByDate.length === 0 && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      No changes in filter
                    </Badge>
                  )}
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block mt-1">
                {versions.length} version{versions.length !== 1 ? 's' : ''}{' '}
                {dateFilter !== 'all' && `(${filteredByDate.length} after filter)`} -{' '}
                <strong>
                  viewing{' '}
                  {versionLimit === 'all'
                    ? 'all'
                    : versionLimit === 1
                      ? 'latest'
                      : `latest ${Math.min(filteredVersions.length, versionLimit)}`}
                </strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
              {isViewed ? 'Viewed' : 'Get out of the way'}
            </span>
            <Checkbox
              checked={isViewed}
              onCheckedChange={(checked) => onToggleViewed(changelog.module, checked as boolean)}
            />
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-3 md:px-5 pb-4 md:pb-5 border-t pt-3 md:pt-4">
            <div className="prose dark:prose-invert max-w-none prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                }}
              >
                {displayContent || 'No changelog content available'}
              </ReactMarkdown>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

ChangelogItem.displayName = 'ChangelogItem';
