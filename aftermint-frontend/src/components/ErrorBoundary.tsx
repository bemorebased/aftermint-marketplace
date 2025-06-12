'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a wallet-related error
    if (error.message.includes('ethereum') || error.message.includes('MetaMask') || error.message.includes('wallet')) {
      console.log('Wallet-related error detected, attempting recovery...');
      
      // Try to resolve wallet conflicts
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            const { ethereum } = window as any;
            if (ethereum?.providers) {
              const metaMaskProvider = ethereum.providers.find((provider: any) => provider.isMetaMask);
              if (metaMaskProvider) {
                (window as any).ethereum = metaMaskProvider;
                window.location.reload();
              }
            }
          }
        } catch (recoveryError) {
          console.error('Error during wallet conflict recovery:', recoveryError);
        }
      }, 1000);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI or use provided fallback
      return this.props.fallback || (
        <div className="min-h-screen bg-theme-background flex items-center justify-center">
          <div className="text-center p-8 bg-theme-surface rounded-lg border border-theme-border max-w-md">
            <h2 className="text-xl font-semibold text-theme-text-primary mb-4">
              Something went wrong
            </h2>
            <p className="text-theme-text-secondary mb-6">
              {this.state.error?.message?.includes('ethereum') || this.state.error?.message?.includes('wallet')
                ? 'There seems to be a wallet conflict. Try disabling other wallet extensions or refreshing the page.'
                : 'An unexpected error occurred. Please refresh the page and try again.'
              }
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-futuristic px-6 py-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 