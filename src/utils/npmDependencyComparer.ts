export interface DependencyChange {
  isDev?: boolean;
  name: string;
  newVersion: string;
  oldVersion: string;
}

export interface PackageDependencies {
  [key: string]: string;
}

interface NpmPackageVersion {
  dependencies?: PackageDependencies;
  devDependencies?: PackageDependencies;
  peerDependencies?: PackageDependencies;
  version: string;
}

/* Cache interface for dependency injection */
interface NpmCache {
  get: (key: string) => Promise<{
    dependencies: PackageDependencies;
    devDependencies: PackageDependencies;
    fetchedAt: number;
    peerDependencies: PackageDependencies;
  } | null>;
  set: (entry: {
    dependencies: PackageDependencies;
    devDependencies: PackageDependencies;
    fetchedAt: number;
    key: string;
    packageName: string;
    peerDependencies: PackageDependencies;
    ttl: number;
    version: string;
  }) => Promise<void>;
}

let npmCache: NpmCache | null = null;

/* 7 day TTL for npm package data */
const NPM_TTL = 1000 * 60 * 60 * 24 * 7;

/**
 * Initialize the npm cache
 */
export function initNpmCache(cache: NpmCache) {
  npmCache = cache;
}

/**
 * Check if cached npm entry is still valid
 */
function isNpmCacheValid(entry: { fetchedAt: number }): boolean {
  const age = Date.now() - entry.fetchedAt;
  return age < NPM_TTL;
}

/**
 * Fetch package.json data from npm registry for a specific version
 */
export async function fetchNpmPackageVersion(
  packageName: string,
  version: string
): Promise<NpmPackageVersion | null> {
  const cacheKey = `${packageName}:${version}`;

  /* Try cache first */
  if (npmCache) {
    try {
      const cached = await npmCache.get(cacheKey);
      if (cached && isNpmCacheValid(cached)) {
        return {
          dependencies: cached.dependencies,
          devDependencies: cached.devDependencies,
          peerDependencies: cached.peerDependencies,
          version,
        };
      }
    } catch (error) {
      console.warn('Npm cache read failed:', error);
    }
  }

  /* Fetch from npm registry */
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/${version}`);

    if (!response.ok) {
      console.warn(`Failed to fetch npm data for ${packageName}@${version}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = {
      dependencies: data.dependencies || {},
      devDependencies: data.devDependencies || {},
      peerDependencies: data.peerDependencies || {},
      version: data.version,
    };

    /* Store in cache */
    if (npmCache) {
      try {
        await npmCache.set({
          key: cacheKey,
          packageName,
          version,
          dependencies: result.dependencies,
          devDependencies: result.devDependencies,
          peerDependencies: result.peerDependencies,
          fetchedAt: Date.now(),
          ttl: NPM_TTL,
        });
      } catch (error) {
        console.warn('Failed to cache npm data:', error);
      }
    }

    return result;
  } catch (error) {
    console.error(`Error fetching npm data for ${packageName}@${version}:`, error);
    return null;
  }
}

/**
 * Clean a version string to extract the actual version number
 * Handles ranges like "^1.2.3", "~1.2.3", "5.0.0 || ^6.0.2 || ^7.0.0"
 */
function cleanVersion(versionStr: string): string | null {
  /* Handle version ranges - take the first version */
  const parts = versionStr.split(/\s*\|\|\s*/);
  const firstPart = parts[0].trim();

  /* Remove version prefixes like ^, ~, >=, etc. */
  const cleaned = firstPart.replace(/^[\^~>=<]+/, '');

  /* Validate it's a semver-ish version */
  if (!/^\d+\.\d+\.\d+/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Compare dependencies between two versions and return what changed
 */
export function compareDependencies(
  oldDeps: PackageDependencies,
  newDeps: PackageDependencies,
  isDev = false
): DependencyChange[] {
  const changes: DependencyChange[] = [];

  /* Check for updated or added dependencies */
  for (const [name, newVersion] of Object.entries(newDeps)) {
    const oldVersion = oldDeps[name];

    const cleanNew = cleanVersion(newVersion);
    if (!cleanNew) {
      /* Invalid version format, skip */
      continue;
    }

    if (!oldVersion) {
      /* New dependency added - skip these as we can't compare versions */
      continue;
    }

    const cleanOld = cleanVersion(oldVersion);
    if (!cleanOld) {
      /* Invalid old version format, skip */
      continue;
    }

    if (cleanOld !== cleanNew) {
      /* Dependency version changed */
      changes.push({
        name,
        oldVersion: cleanOld,
        newVersion: cleanNew,
        isDev,
      });
    }
  }

  return changes;
}

/**
 * Check if a package is part of the Expo ecosystem
 * Includes packages that don't follow expo-* naming but are maintained by Expo
 */
function isExpoEcosystemPackage(packageName: string): boolean {
  if (packageName.startsWith('expo-') || packageName.startsWith('@expo/')) {
    return true;
  }

  /* Expo-maintained packages with different naming patterns */
  const expoPackages = [
    'jest-expo',
    'babel-preset-expo',
    'eslint-config-expo',
    'eslint-config-universe',
    'eslint-plugin-expo',
    'create-expo',
    'patch-project',
    'pod-install',
    'uri-scheme',
    'install-expo-modules',
    'html-elements',
    'unimodules-app-loader',
  ];

  return expoPackages.includes(packageName);
}

/**
 * Find which dependencies changed between two package versions
 * Checks dependencies, peerDependencies, and devDependencies
 * Only returns changes for Expo ecosystem packages
 */
export async function findDependencyChanges(
  packageName: string,
  oldVersion: string,
  newVersion: string
): Promise<DependencyChange[]> {
  const [oldData, newData] = await Promise.all([
    fetchNpmPackageVersion(packageName, oldVersion),
    fetchNpmPackageVersion(packageName, newVersion),
  ]);

  if (!oldData || !newData) {
    return [];
  }

  /* Check regular and peer dependencies */
  const oldProdDeps = { ...oldData.dependencies, ...oldData.peerDependencies };
  const newProdDeps = { ...newData.dependencies, ...newData.peerDependencies };
  const prodChanges = compareDependencies(oldProdDeps, newProdDeps, false);

  /* Check dev dependencies separately and mark them */
  const devChanges = compareDependencies(
    oldData.devDependencies || {},
    newData.devDependencies || {},
    true
  );

  /* Filter to only Expo ecosystem packages */
  const allChanges = [...prodChanges, ...devChanges];
  return allChanges.filter((change) => isExpoEcosystemPackage(change.name));
}

/**
 * Get the previous version from a list of versions
 * Assumes versions are in descending order (newest first)
 */
export function getPreviousVersion(versions: string[], currentVersion: string): string | null {
  const currentIndex = versions.indexOf(currentVersion);

  if (currentIndex === -1 || currentIndex === versions.length - 1) {
    return null;
  }

  return versions[currentIndex + 1];
}
