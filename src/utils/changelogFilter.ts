export interface ChangelogVersion {
  content: string;
  date?: Date | null;
  version: string;
}

/**
 * Extract date from version line
 * Supports formats like: "# 9.0.7 - 2025-09-11" or "## 1.2.3 — 2025-09-11"
 */
function extractDateFromVersionLine(line: string): Date | null {
  const patterns = [
    /[-—]\s*(\d{4}-\d{2}-\d{2})/, // - 2025-09-11 or — 2025-09-11
    /\((\d{4}-\d{2}-\d{2})\)/, // (2025-09-11)
    /(\d{4}\/\d{2}\/\d{2})/, // 2025/09/11
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const dateStr = match[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Parses a Markdown changelog and extracts individual versions with dates
 */
export function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];

  /* Match version headers like "# 1.2.3" or "## [1.2.3]" or "## 1.2.3" */
  const versionRegex = /^#{1,3}\s+\[?(\d+\.\d+\.\d+[^\]\s]*)\]?.*$/gm;

  const matches = [...markdown.matchAll(versionRegex)];

  if (matches.length === 0) {
    /* No version headers found, return entire content as one version */
    return [{ version: 'All Changes', content: markdown, date: null }];
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const version = match[1];
    const fullLine = match[0];
    const startIndex = match.index!;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : markdown.length;

    const content = markdown.substring(startIndex, endIndex).trim();
    const date = extractDateFromVersionLine(fullLine);

    versions.push({ version, content, date });
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
 * Filter versions by date (after a cutoff date)
 */
export function filterVersionsByDate(
  versions: ChangelogVersion[],
  cutoffDate: Date | null
): ChangelogVersion[] {
  if (!cutoffDate) {
    return versions;
  }

  return versions.filter((v) => {
    /* If no date found, include the version (be permissive) */
    if (!v.date) {
      return true;
    }
    /* Include if version date is after or equal to cutoff */
    return v.date >= cutoffDate;
  });
}

/**
 * Filter out versions that have no user-facing changes
 */
export function filterOutNoChangeVersions(versions: ChangelogVersion[]): ChangelogVersion[] {
  const noChangesPatterns = [
    /this version does not introduce any user-facing changes/i,
    /no user-facing changes/i,
  ];

  return versions.filter((version) => {
    /* Keep version if it doesn't match "no changes" pattern */
    return !noChangesPatterns.some((pattern) => pattern.test(version.content));
  });
}

/**
 * Combines multiple version objects back into a single Markdown string
 */
export function combineVersions(versions: ChangelogVersion[]): string {
  return versions.map((v) => v.content).join('\n\n');
}

/**
 * Check if ALL versions in changelog have no user-facing changes
 * Returns true only if every version contains "no user-facing changes" text
 */
export function hasNoUserFacingChanges(content: string): boolean {
  const versions = parseChangelog(content);

  /* If no versions, consider it as having changes (don't hide) */
  if (versions.length === 0) return false;

  const noChangesPatterns = [
    /this version does not introduce any user-facing changes/i,
    /no user-facing changes/i,
  ];

  /* Check if ALL versions have no user-facing changes */
  return versions.every((version) =>
    noChangesPatterns.some((pattern) => pattern.test(version.content))
  );
}
