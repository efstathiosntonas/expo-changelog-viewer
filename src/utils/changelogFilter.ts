export interface ChangelogVersion {
  version: string;
  content: string;
}

/**
 * Parses a markdown changelog and extracts individual versions
 */
export function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];

  /* Match version headers like "# 1.2.3" or "## [1.2.3]" or "## 1.2.3" */
  const versionRegex = /^#{1,3}\s+\[?(\d+\.\d+\.\d+[^\]\s]*)\]?/gm;

  const matches = [...markdown.matchAll(versionRegex)];

  if (matches.length === 0) {
    /* No version headers found, return entire content as one version */
    return [{ version: 'All Changes', content: markdown }];
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const version = match[1];
    const startIndex = match.index!;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : markdown.length;

    const content = markdown.substring(startIndex, endIndex).trim();
    versions.push({ version, content });
  }

  return versions;
}

/**
 * Filters changelog to only show the latest N versions
 */
export function filterVersions(
  versions: ChangelogVersion[],
  limit: number | 'all'
): ChangelogVersion[] {
  if (limit === 'all') {
    return versions;
  }

  return versions.slice(0, limit);
}

/**
 * Combines multiple version objects back into a single markdown string
 */
export function combineVersions(versions: ChangelogVersion[]): string {
  return versions.map((v) => v.content).join('\n\n');
}
