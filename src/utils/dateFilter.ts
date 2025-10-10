export type DateFilterType =
  | 'all'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'after-last-visit';

export interface VersionWithDate {
  content: string;
  date: Date | null;
  version: string;
}

/**
 * Extract date from version header
 * Supports formats like:
 * - # 9.0.7 - 2025-09-11
 * - # 9.0.7 — 2025-09-11
 * - # 9.0.7 (2025-09-11)
 */
export function extractDateFromVersion(versionHeader: string): Date | null {
  /* Try multiple date patterns */
  const patterns = [
    /[-—]\s*(\d{4}-\d{2}-\d{2})/, // - 2025-09-11 or — 2025-09-11
    /\((\d{4}-\d{2}-\d{2})\)/, // (2025-09-11)
    /(\d{4}\/\d{2}\/\d{2})/, // 2025/09/11
  ];

  for (const pattern of patterns) {
    const match = versionHeader.match(pattern);
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
 * Parse changelog content into versions with dates
 */
export function parseVersionsWithDates(content: string): VersionWithDate[] {
  const versionRegex = /^#\s+(.+)$/gm;
  const versions: VersionWithDate[] = [];
  let match;
  const matches: { index: number; version: string }[] = [];

  while ((match = versionRegex.exec(content)) !== null) {
    matches.push({ version: match[1], index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    const versionContent = nextMatch
      ? content.slice(currentMatch.index, nextMatch.index)
      : content.slice(currentMatch.index);

    const date = extractDateFromVersion(currentMatch.version);
    versions.push({
      version: currentMatch.version,
      date,
      content: versionContent,
    });
  }

  return versions;
}

/**
 * Get cutoff date based on filter type
 */
export function getDateFilterCutoff(
  filterType: DateFilterType,
  lastVisitDate?: number
): Date | null {
  const now = new Date();

  switch (filterType) {
    case 'last-7-days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last-30-days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last-90-days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'after-last-visit':
      return lastVisitDate ? new Date(lastVisitDate) : null;
    case 'all':
    default:
      return null;
  }
}

/**
 * Filter versions by date
 */
export function filterVersionsByDate(
  versions: VersionWithDate[],
  cutoffDate: Date | null
): VersionWithDate[] {
  if (!cutoffDate) {
    return versions;
  }

  return versions.filter((v) => {
    /* If no date found, include the version (be permissive) */
    if (!v.date) {
      return true;
    }
    /* Include if version date is after cutoff */
    return v.date >= cutoffDate;
  });
}

/**
 * Check if a changelog has any dates
 */
export function hasDateInformation(content: string): boolean {
  const versions = parseVersionsWithDates(content);
  return versions.some((v) => v.date !== null);
}

/**
 * Count versions after a date
 */
export function countVersionsAfterDate(content: string, cutoffDate: Date | null): number {
  if (!cutoffDate) {
    const versions = parseVersionsWithDates(content);
    return versions.length;
  }

  const versions = parseVersionsWithDates(content);
  const filtered = filterVersionsByDate(versions, cutoffDate);
  return filtered.length;
}
