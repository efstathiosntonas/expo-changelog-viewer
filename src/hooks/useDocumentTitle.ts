import { useEffect } from 'react';

/**
 * Custom hook to manage document title for better accessibility
 * Updates the page title to reflect current app state
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    /* Cleanup: restore previous title on unmount */
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
