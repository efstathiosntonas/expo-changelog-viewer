import { isNoChangeVersion } from './changelogFilter';
import { buildAllDependencyTrees } from './dependencyTreeBuilder';
import { getPreviousVersion } from './npmDependencyComparer';

import type { ChangelogVersion } from './changelogFilter';

/**
 * Enriches changelog versions with dependency tree information
 * for versions that have no user-facing changes.
 * Recursively traverses dependencies to find root cause changes.
 */
export async function enrichChangelogWithDependencies(
  moduleName: string,
  versions: ChangelogVersion[]
): Promise<ChangelogVersion[]> {
  const enrichedVersions = [...versions];
  const versionNumbers = versions.map((v) => v.version);

  /* Process versions in parallel */
  const enrichPromises = enrichedVersions.map(async (version) => {
    /* Only enrich versions with no user-facing changes */
    if (!isNoChangeVersion(version)) {
      return version;
    }

    /* Get previous version */
    const prevVersion = getPreviousVersion(versionNumbers, version.version);
    if (!prevVersion) {
      return version;
    }

    /* Build dependency trees to find root cause */
    try {
      const trees = await buildAllDependencyTrees(moduleName, prevVersion, version.version);

      if (trees.length > 0) {
        return {
          ...version,
          dependencyTrees: trees,
        };
      }
    } catch (error) {
      console.error(`Failed to build dependency tree for ${moduleName}@${version.version}:`, error);
    }

    return version;
  });

  const results = await Promise.all(enrichPromises);
  return results;
}
