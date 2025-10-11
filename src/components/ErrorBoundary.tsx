import { Component, ErrorInfo, ReactNode } from 'react';

import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

/**
 * Error Boundary component to catch and handle React errors
 * Provides fallback UI and error reporting
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    /* Show toast notification */
    toast.error('Something went wrong', {
      description: error.message || 'An unexpected error occurred',
    });

    /* Store error details */
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      /* Custom fallback UI */
      if (this.props.fallback) {
        return this.props.fallback;
      }

      /* Default fallback UI */
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="max-w-md p-8 space-y-4 border rounded-lg shadow-lg bg-card">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 text-xs bg-muted rounded overflow-auto max-h-48">
                {this.state.error?.stack}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
