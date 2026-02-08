'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send error to monitoring service here
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.warn('Production error captured:', this.state.errorId);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-red-900 mb-3">
              حدث خطأ غير متوقع
            </h2>
            
            <p className="text-red-700 mb-6 leading-relaxed">
              عذراً، حدث خطأ أثناء تحميل هذا القسم. يرجى المحاولة مرة أخرى.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-right text-red-600 text-sm mb-6 text-start">
                <summary className="cursor-pointer font-medium mb-2">
                  تفاصيل الخطأ (للتطوير فقط)
                </summary>
                <pre className="bg-red-100 p-3 rounded-lg overflow-auto text-xs">
                  {this.state.error.stack}
                </pre>
                {this.state.errorId && (
                  <p className="mt-2 text-xs">Error ID: {this.state.errorId}</p>
                )}
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.retry}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                تحديث الصفحة
              </button>
            </div>

            {this.state.errorId && (
              <p className="mt-4 text-xs text-red-600">
                رقم الخطأ: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Custom hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    setError(error);
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, reset };
}

export default ErrorBoundary;