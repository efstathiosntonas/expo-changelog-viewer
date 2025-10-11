/**
 * Retry utility with exponential backoff for network requests
 */

export interface RetryOptions {
  backoffMultiplier?: number;
  initialDelay?: number;
  maxDelay?: number;
  maxRetries?: number;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    /* Retry on network errors and 5xx status codes */
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    if (error instanceof Response) {
      return error.status >= 500 && error.status < 600;
    }
    return false;
  },
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      /* Check if we should retry */
      const shouldRetry = config.shouldRetry(error, attempt);
      const isLastAttempt = attempt === config.maxRetries;

      if (!shouldRetry || isLastAttempt) {
        throw error;
      }

      /* Calculate delay with exponential backoff */
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      /* Add jitter to prevent thundering herd */
      const jitter = Math.random() * 0.3 * delay; // ±15% jitter
      const delayWithJitter = delay + jitter;

      /* Call onRetry callback if provided */
      if (options.onRetry) {
        options.onRetry(error, attempt + 1, delayWithJitter);
      }

      console.log(
        `Retry attempt ${attempt + 1}/${config.maxRetries} after ${Math.round(delayWithJitter)}ms`
      );

      /* Wait before retrying */
      await new Promise((resolve) => setTimeout(resolve, delayWithJitter));
    }
  }

  throw lastError;
}

/**
 * Fetch with retry logic and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, init);

    /* Throw for error status codes to trigger retry */
    if (!response.ok && response.status >= 500) {
      throw response;
    }

    return response;
  }, options);
}

/**
 * Rate limiter to prevent too many concurrent requests
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(
    private maxConcurrent: number,
    private minDelay = 0
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    /* Wait if we're at max concurrency */
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;

    try {
      const result = await fn();

      /* Add delay between requests if specified */
      if (this.minDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.minDelay));
      }

      return result;
    } finally {
      this.running--;

      /* Process next item in queue */
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  getStats(): { queued: number; running: number } {
    return {
      queued: this.queue.length,
      running: this.running,
    };
  }
}
