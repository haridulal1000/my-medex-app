import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@mui/material';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: unknown, reset: () => void) => ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return this.renderDefaultFallback();
    }
    return this.props.children;
  }

  private renderDefaultFallback(): ReactNode {
    const { error } = this.state;
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          role="alert"
          className="max-w-md w-full bg-white border border-rose-200 rounded-lg p-6 text-center"
        >
          <div className="text-rose-700 font-semibold text-lg">
            Something went wrong
          </div>
          <div className="text-slate-500 text-sm mt-2">
            An unexpected error occurred while rendering this page.
          </div>
          {import.meta.env.DEV && error && (
            <pre className="mt-4 text-xs text-left bg-slate-50 p-3 rounded overflow-auto max-h-48">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          )}
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="outlined" onClick={this.reset}>
              Try again
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}