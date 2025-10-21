import { useMemo } from 'react';

import { GitBranch, Target } from 'lucide-react';
import { StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment } from 'react-complex-tree';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import 'react-complex-tree/lib/style-modern.css';

import { Badge } from '@/components/ui/badge';

import { isNoChangeVersion } from '@/utils/changelogFilter';
import { formatDatesInMarkdown } from '@/utils/dateFormatter';

import type { ChangelogVersion } from '@/utils/changelogFilter';
import type { DependencyTreeNode } from '@/utils/dependencyTreeBuilder';

interface VersionWithDependenciesProps {
  version: ChangelogVersion;
}

interface TreeItem {
  canMove?: boolean;
  canRename?: boolean;
  children?: string[];
  data: {
    changelog?: string;
    hasRealChanges: boolean;
    isDev?: boolean;
    newVersion: string;
    noChangelogAvailable?: boolean;
    oldVersion: string;
    packageName: string;
  };
  index: string;
  isFolder?: boolean;
}

function convertTreeToItems(nodes: DependencyTreeNode[]): Record<string, TreeItem> {
  const items: Record<string, TreeItem> = {
    root: {
      index: 'root',
      isFolder: true,
      children: [],
      data: {
        packageName: 'root',
        oldVersion: '',
        newVersion: '',
        hasRealChanges: false,
      },
      canMove: false,
      canRename: false,
    },
  };

  let idCounter = 0;

  function processNode(node: DependencyTreeNode, parentId: string): string {
    const nodeId = `node-${idCounter++}`;

    items[nodeId] = {
      index: nodeId,
      isFolder: node.children && node.children.length > 0,
      children: node.children ? [] : undefined,
      data: {
        packageName: node.packageName,
        oldVersion: node.oldVersion,
        newVersion: node.newVersion,
        hasRealChanges: node.hasRealChanges,
        changelog: node.changelog,
        noChangelogAvailable: node.noChangelogAvailable,
        isDev: node.isDev,
      },
      canMove: false,
      canRename: false,
    };

    if (items[parentId].children) {
      items[parentId].children!.push(nodeId);
    }

    if (node.children) {
      for (const child of node.children) {
        processNode(child, nodeId);
      }
    }

    return nodeId;
  }

  for (const node of nodes) {
    processNode(node, 'root');
  }

  return items;
}

export function VersionWithDependencies({ version }: VersionWithDependenciesProps) {
  const hasTrees = version.dependencyTrees && version.dependencyTrees.length > 0;
  const isNoChange = isNoChangeVersion(version);

  const treeItems = useMemo(() => {
    if (!hasTrees) {
      return {};
    }
    return convertTreeToItems(version.dependencyTrees!);
  }, [version.dependencyTrees, hasTrees]);

  /* Expand all items by default */
  const expandedItems = useMemo(() => {
    return Object.keys(treeItems);
  }, [treeItems]);

  /* Format dates in the version content to human-readable format */
  const formattedContent = useMemo(() => {
    return formatDatesInMarkdown(version.content);
  }, [version.content]);

  return (
    <div className="mb-6 last:mb-0 max-w-none">
      <ReactMarkdown
        components={{
          a: ({ ...props }) => <a {...props} rel="noopener noreferrer" target="_blank" />,
        }}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
      >
        {formattedContent}
      </ReactMarkdown>

      {/* Show dependency tree if this is a "no changes" version */}
      {isNoChange && !hasTrees && (
        <div className="mt-3 p-3 bg-muted/30 rounded-md border border-muted-foreground/10">
          <p className="text-xs text-muted-foreground italic">
            No dependency changes detected. This version was likely published for SDK version
            alignment, internal build changes, or to update native module configurations.
          </p>
        </div>
      )}

      {isNoChange && hasTrees && (
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-muted-foreground/20 not-prose max-w-none w-full">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="text-xs flex items-center gap-1" variant="secondary">
              <GitBranch className="h-3 w-3" />
              Dependency Update Chain
            </Badge>
          </div>
          <div
            className="rct-tree-root w-full"
            style={{
              height: 'auto',
              minHeight: '50px',
            }}
          >
            <UncontrolledTreeEnvironment
              canDragAndDrop={false}
              canDropOnFolder={false}
              canReorderItems={false}
              canSearch={false}
              dataProvider={new StaticTreeDataProvider(treeItems)}
              getItemTitle={(item) => item.data.packageName}
              renderItem={({ item, depth, children, title, context, arrow }) => {
                const InteractiveComponent = context.isRenaming ? 'div' : 'button';
                const hasRealChanges = item.data.hasRealChanges;
                const noChangelog = item.data.noChangelogAvailable;
                const isDev = item.data.isDev;

                /* Hide root item */
                if (item.index === 'root') {
                  return <>{children}</>;
                }

                return (
                  <div
                    {...context.itemContainerWithChildrenProps}
                    className="dep-tree-item"
                    data-depth={depth}
                  >
                    <InteractiveComponent
                      {...(context.itemContainerWithoutChildrenProps as Record<string, unknown>)}
                      {...(context.interactiveElementProps as Record<string, unknown>)}
                      className="dep-tree-button"
                    >
                      <span className="dep-tree-arrow">{arrow}</span>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] md:text-xs text-muted-foreground truncate">
                            {title}:
                          </span>
                          <span className="font-mono text-[11px] md:text-xs whitespace-nowrap">
                            {item.data.oldVersion && (
                              <>
                                <span className="text-muted-foreground line-through">
                                  {item.data.oldVersion}
                                </span>
                                {' → '}
                              </>
                            )}
                            <span className="text-primary font-semibold">
                              {item.data.newVersion}
                            </span>
                          </span>
                          {isDev && (
                            <Badge
                              className="text-[9px] md:text-[10px] px-1 py-0"
                              variant="secondary"
                            >
                              dev
                            </Badge>
                          )}
                          {hasRealChanges && (
                            <Badge
                              className="text-[9px] md:text-[10px] px-1.5 py-0.5 inline-flex items-center gap-1 leading-none"
                              variant="success"
                            >
                              <Target className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <span className="leading-none">Root</span>
                            </Badge>
                          )}
                          {noChangelog && !hasRealChanges && (
                            <Badge
                              className="text-[9px] md:text-[10px] px-1 py-0 hidden sm:inline-flex"
                              variant="outline"
                            >
                              No CL
                            </Badge>
                          )}
                        </div>
                      </div>
                    </InteractiveComponent>
                    {hasRealChanges && item.data.changelog && (
                      <div className="dep-changelog-box" data-depth={depth}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              a: ({ ...props }) => (
                                <a {...props} rel="noopener noreferrer" target="_blank" />
                              ),
                              h1: ({ children }) => (
                                <div className="font-semibold mb-1 text-sm">{children}</div>
                              ),
                              h2: ({ children }) => (
                                <div className="font-semibold mb-1 text-sm">{children}</div>
                              ),
                              h3: ({ children }) => (
                                <div className="font-semibold mb-1 text-sm">{children}</div>
                              ),
                            }}
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {formatDatesInMarkdown(item.data.changelog)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {children}
                  </div>
                );
              }}
              viewState={{
                'tree-1': {
                  expandedItems: expandedItems,
                },
              }}
            >
              <Tree rootItem="root" treeId="tree-1" treeLabel="Dependency Tree" />
            </UncontrolledTreeEnvironment>
          </div>
        </div>
      )}
    </div>
  );
}
