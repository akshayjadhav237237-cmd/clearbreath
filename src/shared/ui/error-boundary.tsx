import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly fallbackTitle?: string;
  readonly fallbackMessage?: string;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/** Error boundary component safely catching unhandled rendering and chunk loading errors. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100"
          >
            <h2 className="text-base font-bold">
              {this.props.fallbackTitle ?? 'Something went wrong'}
            </h2>
            <p className="mt-2 text-xs">
              {this.props.fallbackMessage ??
                'Unable to display this view. Please try refreshing the page.'}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
