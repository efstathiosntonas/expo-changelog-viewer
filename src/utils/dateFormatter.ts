/**
 * Format ISO date (2025-10-01) to human-readable format (01 Oct 2025)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; /* Return original if invalid */
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateString; /* Return original on error */
  }
}

/**
 * Replace ISO dates in markdown content with human-readable format
 * Matches patterns like:
 * - # 9.0.7 - 2025-09-11
 * - ## 1.2.3 — 2025-09-11
 * - ### 5.0.0 (2025-09-11)
 */
export function formatDatesInMarkdown(markdown: string): string {
  /* Match ISO dates in various contexts */
  const isoDatePattern = /(\d{4})-(\d{2})-(\d{2})/g;

  return markdown.replace(isoDatePattern, (match) => {
    return formatDate(match);
  });
}
