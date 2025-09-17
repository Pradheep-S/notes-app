import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Check if it's a network-related error
    if (error.message.includes('QUIC_PROTOCOL_ERROR') || 
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('Failed to fetch')) {
      console.log('Network error detected, attempting to recover...');
      
      // Try to recover from network errors
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 3000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Issue
              </h2>
              <p className="text-gray-600 mb-4">
                There was a network connectivity issue. This might be due to:
              </p>
              <ul className="text-sm text-gray-500 text-left mb-4 space-y-1">
                <li>• Firewall or network restrictions</li>
                <li>• Temporary connectivity issues</li>
                <li>• Browser network settings</li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Reload Page
              </button>
              <p className="text-xs text-gray-400 mt-2">
                The page will automatically retry in a few seconds
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
