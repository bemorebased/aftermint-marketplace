// Error tracking and monitoring system for AfterMint
export interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'runtime' | 'api' | 'console' | 'contract' | 'navigation' | 'component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  additionalData?: any;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;
    
    // Capture unhandled runtime errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'runtime',
        severity: 'high',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        component: this.extractComponentFromStack(event.error?.stack),
        additionalData: {
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'runtime',
        severity: 'high',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        additionalData: { reason: event.reason }
      });
    });

    // Override console.error to capture console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.captureError({
        type: 'console',
        severity: 'medium',
        message: args.join(' '),
        additionalData: { args }
      });
      originalConsoleError.apply(console, args);
    };

    // Override console.warn for warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      this.captureError({
        type: 'console',
        severity: 'low',
        message: `Warning: ${args.join(' ')}`,
        additionalData: { args }
      });
      originalConsoleWarn.apply(console, args);
    };

    this.isInitialized = true;
    console.log('🎯 Error Tracker initialized');
  }

  private extractComponentFromStack(stack?: string): string {
    if (!stack) return 'unknown';
    
    // Try to extract React component name from stack trace
    const match = stack.match(/at (\w+)\s/);
    return match ? match[1] : 'unknown';
  }

  captureError(errorData: Partial<ErrorReport>) {
    const error: ErrorReport = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      type: errorData.type || 'runtime',
      severity: errorData.severity || 'medium',
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      component: errorData.component,
      additionalData: errorData.additionalData
    };

    this.errors.push(error);
    
    // Log immediately for debugging
    console.log(`🚨 [${error.severity.toUpperCase()}] ${error.type}: ${error.message}`, error);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  // API call wrapper with error tracking
  async trackApiCall<T>(
    url: string, 
    options?: RequestInit, 
    component?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        this.captureError({
          type: 'api',
          severity: response.status >= 500 ? 'high' : 'medium',
          message: `API Error: ${response.status} ${response.statusText}`,
          component,
          additionalData: {
            url,
            status: response.status,
            statusText: response.statusText,
            duration
          }
        });
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log successful API calls for monitoring
      console.log(`✅ API Success: ${url} (${duration}ms)`, { component, status: response.status });
      
      return data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.captureError({
        type: 'api',
        severity: 'high',
        message: `API Request Failed: ${error.message}`,
        component,
        additionalData: {
          url,
          duration,
          error: error.message
        }
      });
      
      throw error;
    }
  }

  // Contract call wrapper with error tracking
  async trackContractCall<T>(
    contractName: string,
    methodName: string,
    call: () => Promise<T>,
    component?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await call();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Contract Success: ${contractName}.${methodName} (${duration}ms)`, { component });
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.captureError({
        type: 'contract',
        severity: 'high',
        message: `Contract Error: ${contractName}.${methodName} - ${error.message}`,
        component,
        stack: error.stack,
        additionalData: {
          contractName,
          methodName,
          duration,
          error: error.message,
          code: error.code
        }
      });
      
      throw error;
    }
  }

  // Component error boundary helper
  captureComponentError(error: Error, errorInfo: any, component: string) {
    this.captureError({
      type: 'component',
      severity: 'critical',
      message: `Component Error in ${component}: ${error.message}`,
      stack: error.stack,
      component,
      additionalData: { errorInfo }
    });
  }

  // Navigation error tracking
  captureNavigationError(route: string, error: any) {
    this.captureError({
      type: 'navigation',
      severity: 'medium',
      message: `Navigation Error to ${route}: ${error.message}`,
      additionalData: { route, error: error.message }
    });
  }

  // Get all errors
  getAllErrors(): ErrorReport[] {
    return [...this.errors];
  }

  // Get errors by type
  getErrorsByType(type: ErrorReport['type']): ErrorReport[] {
    return this.errors.filter(error => error.type === type);
  }

  // Get errors by severity
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Get recent errors (last N minutes)
  getRecentErrors(minutes: number = 5): ErrorReport[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(error => new Date(error.timestamp) > cutoff);
  }

  // Get error summary
  getErrorSummary() {
    const byType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.getRecentErrors(5);

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      recentCount: recentErrors.length,
      recentErrors: recentErrors.slice(-5) // Last 5 recent errors
    };
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
    console.log('🧹 Error tracker cleared');
  }

  // Export errors for debugging
  exportErrors() {
    const summary = this.getErrorSummary();
    console.log('📊 Error Tracker Summary:', summary);
    console.table(this.errors.slice(-20)); // Show last 20 errors in table format
    return {
      summary,
      errors: this.errors
    };
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Export convenience functions
export const trackApiCall = errorTracker.trackApiCall.bind(errorTracker);
export const trackContractCall = errorTracker.trackContractCall.bind(errorTracker);
export const captureError = errorTracker.captureError.bind(errorTracker);
export const getErrorSummary = errorTracker.getErrorSummary.bind(errorTracker);
export const exportErrors = errorTracker.exportErrors.bind(errorTracker);

// Global error tracking functions for debugging
if (typeof window !== 'undefined') {
  (window as any).getErrorSummary = getErrorSummary;
  (window as any).exportErrors = exportErrors;
  (window as any).clearErrors = errorTracker.clearErrors.bind(errorTracker);
} 