'use client';

import React from 'react';
import ErrorBoundary from '@/components/error-boundary';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export default function ErrorBoundaryWrapper({ children, onError }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary onError={onError}>
      {children}
    </ErrorBoundary>
  );
}