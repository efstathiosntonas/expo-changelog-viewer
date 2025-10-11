import { findDependencyChanges } from './npmDependencyComparer';
import { fetchWithRetry } from './retryWithBackoff';

export interface DependencyTreeNode {
  changelog?: string;
  children: DependencyTreeNode[];
  hasRealChanges: boolean;
  isDev?: boolean;
  newVersion: string;
  noChangelogAvailable?: boolean;
  oldVersion: string;
  packageName: string;
}

const MAX_DEPTH = 10; /* Prevent infinite recursion */

/**
 * Cache manager for changelog content
 * Encapsulates cache logic and provides better lifecycle control
 */
class ChangelogCacheManager {
  private cache = new Map<string, string | null>();
  private maxSize = 500; /* Limit cache size to prevent unbounded growth */

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): string | null | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string | null): void {
    /* Implement simple LRU: if cache is full, remove oldest entries */
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const packageCache = new ChangelogCacheManager();

/* Packages WITHOUT CHANGELOGs that we should skip */
const PACKAGES_WITHOUT_CHANGELOG_EXPLICIT = new Set([
  'expo-dev-menu-interface',
  'expo-insights',
  'expo-network-addons',
  'expo-processing',
  'expo-random',
]);

/* Packages in the expo monorepo that HAVE CHANGELOGs (allowlist) */
const PACKAGES_WITH_CHANGELOG = new Set([
  '@expo/cli',
  '@expo/config',
  '@expo/config-plugins',
  '@expo/devtools',
  '@expo/env',
  '@expo/fingerprint',
  '@expo/image-utils',
  '@expo/json-file',
  '@expo/metro-config',
  '@expo/metro-runtime',
  '@expo/osascript',
  '@expo/package-manager',
  '@expo/pkcs12',
  '@expo/plist',
  '@expo/prebuild-config',
  '@expo/schema-utils',
  '@expo/schemer',
  'babel-preset-expo',
  'create-expo',
  'eslint-config-expo',
  'eslint-config-universe',
  'eslint-plugin-expo',
  'expo',
  'expo-app-integrity',
  'expo-apple-authentication',
  'expo-application',
  'expo-asset',
  'expo-audio',
  'expo-auth-session',
  'expo-av',
  'expo-background-fetch',
  'expo-background-task',
  'expo-battery',
  'expo-blob',
  'expo-blur',
  'expo-brightness',
  'expo-build-properties',
  'expo-calendar',
  'expo-camera',
  'expo-cellular',
  'expo-checkbox',
  'expo-clipboard',
  'expo-constants',
  'expo-contacts',
  'expo-crypto',
  'expo-dev-client',
  'expo-dev-client-components',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-device',
  'expo-doctor',
  'expo-document-picker',
  'expo-eas-client',
  'expo-env-info',
  'expo-file-system',
  'expo-font',
  'expo-gl',
  'expo-glass-effect',
  'expo-haptics',
  'expo-image',
  'expo-image-loader',
  'expo-image-manipulator',
  'expo-image-picker',
  'expo-intent-launcher',
  'expo-json-utils',
  'expo-keep-awake',
  'expo-linear-gradient',
  'expo-linking',
  'expo-live-photo',
  'expo-local-authentication',
  'expo-localization',
  'expo-location',
  'expo-mail-composer',
  'expo-manifests',
  'expo-maps',
  'expo-media-library',
  'expo-mesh-gradient',
  'expo-module-scripts',
  'expo-modules-autolinking',
  'expo-modules-core',
  'expo-navigation-bar',
  'expo-network',
  'expo-notifications',
  'expo-print',
  'expo-router',
  'expo-screen-capture',
  'expo-screen-orientation',
  'expo-secure-store',
  'expo-sensors',
  'expo-server',
  'expo-sharing',
  'expo-sms',
  'expo-speech',
  'expo-splash-screen',
  'expo-sqlite',
  'expo-status-bar',
  'expo-store-review',
  'expo-structured-headers',
  'expo-symbols',
  'expo-system-ui',
  'expo-task-manager',
  'expo-tracking-transparency',
  'expo-ui',
  'expo-updates',
  'expo-updates-interface',
  'expo-video',
  'expo-video-thumbnails',
  'expo-web-browser',
  'expo-yarn-workspaces',
  'html-elements',
  'install-expo-modules',
  'jest-expo',
  'patch-project',
  'pod-install',
  'unimodules-app-loader',
  'uri-scheme',
]);

/**
 * Check if a changelog has real user-facing changes
 */
function hasRealChanges(changelog: string): boolean {
  const noChangesPatterns = [
    /this version does not introduce any user-facing changes/i,
    /no user-facing changes/i,
  ];

  return !noChangesPatterns.some((pattern) => pattern.test(changelog));
}

/**
 * Check if a package has a CHANGELOG in the allowlist
 */
function hasChangelog(packageName: string): boolean {
  /* Explicit packages we know don't have CHANGELOGs */
  if (PACKAGES_WITHOUT_CHANGELOG_EXPLICIT.has(packageName)) {
    return false;
  }

  return PACKAGES_WITH_CHANGELOG.has(packageName);
}

/**
 * Build the correct GitHub path for a package
 * @expo/config-types → packages/%40expo/config-types
 * expo-constants → packages/expo-constants
 */
function getPackagePath(packageName: string): string {
  /* URL encode @ symbol for scoped packages */
  return packageName.replace('@', '%40');
}

/**
 * Fetch changelog from GitHub (only for packages in the allowlist)
 */
async function fetchChangelog(packageName: string, branch: string): Promise<string | null> {
  /* Only fetch for packages we know have CHANGELOGs */
  if (!hasChangelog(packageName)) {
    return null;
  }

  const cacheKey = `${packageName}:${branch}`;

  /* Check cache - both successful fetches and 404s are cached */
  if (packageCache.has(cacheKey)) {
    const cached = packageCache.get(cacheKey);
    return cached === undefined ? null : cached;
  }

  try {
    const packagePath = getPackagePath(packageName);
    const url = `https://raw.githubusercontent.com/expo/expo/${branch}/packages/${packagePath}/CHANGELOG.md`;

    /* Use fetch with retry for better reliability */
    const response = await fetchWithRetry(url, undefined, {
      maxRetries: 2,
      initialDelay: 500,
      shouldRetry: (error) => {
        /* Don't retry 404s - they're expected for packages without changelogs */
        if (error instanceof Response && error.status === 404) {
          return false;
        }
        /* Retry network errors and 5xx errors */
        return true;
      },
    });

    if (!response.ok) {
      /* Cache the 404 so we don't retry this package */
      packageCache.set(cacheKey, null);
      return null;
    }

    const content = await response.text();
    packageCache.set(cacheKey, content);
    return content;
  } catch (error) {
    console.error(`Error fetching changelog for ${packageName}:`, error);
    /* Cache the error so we don't retry */
    packageCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Extract changelog content for a specific version
 */
function extractVersionChangelog(changelog: string, version: string): string | null {
  /* Match version headers like "## 1.2.3" or "## [1.2.3]" */
  const versionRegex = new RegExp(
    `^#{1,3}\\s+\\[?${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]?.*$`,
    'gm'
  );

  const matches = [...changelog.matchAll(versionRegex)];
  if (matches.length === 0) {
    return null;
  }

  const match = matches[0];
  const startIndex = match.index!;

  /* Find the next version header */
  const nextVersionRegex = /^#{1,3}\s+\[?\d+\.\d+\.\d+[^\]\s]*\]?.*$/gm;
  nextVersionRegex.lastIndex = startIndex + match[0].length;
  const nextMatch = nextVersionRegex.exec(changelog);

  const endIndex = nextMatch ? nextMatch.index : changelog.length;
  return changelog.substring(startIndex, endIndex).trim();
}

/**
 * Recursively build dependency tree to find root cause of changes
 * @param branch - The branch to fetch CHANGELOGs from. For root packages use SDK branch, for dependencies use 'main'
 */
export async function buildDependencyTree(
  packageName: string,
  oldVersion: string,
  newVersion: string,
  branch: string,
  depth = 0,
  visited = new Set<string>(),
  isDev = false
): Promise<DependencyTreeNode> {
  const nodeKey = `${packageName}:${newVersion}`;

  /* Prevent infinite recursion and circular dependencies */
  if (depth >= MAX_DEPTH) {
    return {
      packageName,
      oldVersion,
      newVersion,
      hasRealChanges: false,
      children: [],
      isDev,
    };
  }

  if (visited.has(nodeKey)) {
    return {
      packageName,
      oldVersion,
      newVersion,
      hasRealChanges: false,
      children: [],
      isDev,
    };
  }

  visited.add(nodeKey);

  const node: DependencyTreeNode = {
    packageName,
    oldVersion,
    newVersion,
    hasRealChanges: false,
    children: [],
    isDev,
  };

  try {
    /* Fetch the changelog for this package */
    const changelog = await fetchChangelog(packageName, branch);
    if (!changelog) {
      /* Mark that no changelog is available */
      node.noChangelogAvailable = true;

      /* Still try to traverse dependencies to find root cause */
      const depChanges = await findDependencyChanges(packageName, oldVersion, newVersion);

      if (depChanges.length > 0) {
        const childPromises = depChanges.map((change) =>
          buildDependencyTree(
            change.name,
            change.oldVersion,
            change.newVersion,
            'main' /* Always use main branch for dependencies */,
            depth + 1,
            new Set(visited),
            change.isDev || false
          )
        );

        node.children = await Promise.all(childPromises);
      }

      return node;
    }

    /* Extract the specific version's changelog */
    const versionChangelog = extractVersionChangelog(changelog, newVersion);
    if (!versionChangelog) {
      return node;
    }

    node.changelog = versionChangelog;
    node.hasRealChanges = hasRealChanges(versionChangelog);

    /* If this version has real changes, we've found the root cause! */
    if (node.hasRealChanges) {
      return node;
    }

    /* Otherwise, recurse into dependencies to find what changed */
    const depChanges = await findDependencyChanges(packageName, oldVersion, newVersion);

    if (depChanges.length > 0) {
      /* Build child nodes for each dependency change */
      const childPromises = depChanges.map((change) =>
        buildDependencyTree(
          change.name,
          change.oldVersion,
          change.newVersion,
          'main' /* Always use main branch for dependencies */,
          depth + 1,
          new Set(visited) /* Pass a copy to avoid cross-branch pollution */,
          change.isDev || false
        )
      );

      node.children = await Promise.all(childPromises);
    }

    return node;
  } catch (error) {
    console.error(`Error building tree for ${packageName}:`, error);
    return node;
  }
}

/**
 * Build trees for all dependency changes in a package version
 * Note: Always uses 'main' branch for dependency CHANGELOGs regardless of the branch parameter
 */
export async function buildAllDependencyTrees(
  packageName: string,
  oldVersion: string,
  newVersion: string
): Promise<DependencyTreeNode[]> {
  const changes = await findDependencyChanges(packageName, oldVersion, newVersion);

  if (changes.length === 0) {
    return [];
  }

  /* Deduplicate changes by package name (keep first occurrence) */
  const seen = new Set<string>();
  const uniqueChanges = changes.filter((change) => {
    if (seen.has(change.name)) {
      return false;
    }
    seen.add(change.name);
    return true;
  });

  const treePromises = uniqueChanges.map((change) =>
    buildDependencyTree(
      change.name,
      change.oldVersion,
      change.newVersion,
      'main' /* Always use main branch for dependencies, even at root level */,
      0,
      new Set(),
      change.isDev || false
    )
  );

  return Promise.all(treePromises);
}

/**
 * Clear the changelog cache
 */
export function clearChangelogCache() {
  packageCache.clear();
}
