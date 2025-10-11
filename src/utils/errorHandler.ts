import { toast } from 'sonner';

/**
 * Centralized error handling utility
 */

export interface ErrorReport {
  context?: string;
  error: Error | unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Handle and report errors consistently across the application
 */
export function handleError({ error, context, metadata }: ErrorReport): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  /* Log to console with context */
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, {
    message: errorMessage,
    stack: errorStack,
    metadata,
  });

  /* Show user-friendly toast notification */
  toast.error(context || 'An error occurred', {
    description: errorMessage,
  });

  /* In production, send to error tracking service */
  if (process.env.NODE_ENV === 'production') {
    reportToErrorService({ error, context, metadata });
  }
}

/**
 * Report error to external service (Sentry, LogRocket, etc.)
 */
function reportToErrorService({ error, context, metadata }: ErrorReport): void {
  /* Example: Sentry integration */
  /*
  window.Sentry?.captureException(error, {
    tags: { context },
    extra: metadata,
  });
  */

  /* Placeholder for future implementation */
  console.info('Error reported to service:', { error, context, metadata });
}

/**
 * Handle async errors with try-catch wrapper
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError({ error, context });
    return null;
  }
}

/**
 * Handle network errors specifically
 */
export function handleNetworkError(error: unknown, url?: string): void {
  const context = url ? `Network request to ${url}` : 'Network request';

  if (error instanceof TypeError && error.message.includes('fetch')) {
    handleError({
      error: new Error('Network request failed. Please check your connection.'),
      context,
    });
  } else {
    handleError({ error, context });
  }
}

/**
 * Handle storage quota exceeded errors
 */
export function handleStorageError(
  error: unknown,
  storageType: 'localStorage' | 'IndexedDB'
): void {
  if (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  ) {
    toast.error(`${storageType} quota exceeded`, {
      description: 'Please clear some cached data or free up browser storage.',
      action: {
        label: 'Clear Cache',
        onClick: () => {
          if (storageType === 'localStorage') {
            localStorage.clear();
          }
          window.location.reload();
        },
      },
    });
  } else {
    handleError({ error, context: `${storageType} operation` });
  }
}
