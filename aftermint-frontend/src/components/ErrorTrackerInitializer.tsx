'use client';

import { useEffect, useState } from 'react';
import { errorTracker, getErrorSummary, exportErrors } from '@/utils/errorTracking';

export function ErrorTrackerInitializer() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [errorSummary, setErrorSummary] = useState<any>(null);

  useEffect(() => {
    // Initialize error tracker
    console.log('🎯 Error Tracker initialized in app');

    // Add keyboard shortcut to show debug panel (Ctrl+Shift+E)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        setShowDebugPanel(prev => !prev);
        if (!showDebugPanel) {
          setErrorSummary(getErrorSummary());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Update summary periodically when panel is open
    const interval = setInterval(() => {
      if (showDebugPanel) {
        setErrorSummary(getErrorSummary());
      }
    }, 2000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [showDebugPanel]);

  return (
    <>
      {/* Always visible error indicator */}
      <div className="fixed bottom-20 left-4 z-50">
        <button 
          onClick={() => {
            setShowDebugPanel(true);
            setErrorSummary(getErrorSummary());
          }}
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-full shadow-lg transition-colors"
          title="Click to open error tracker (or press Ctrl+Shift+E)"
        >
          🎯 Error Tracker
        </button>
      </div>

      {/* Debug panel */}
      {showDebugPanel && (
        <div className="fixed top-4 right-4 z-50 bg-black text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">🎯 Error Tracker</h3>
            <button 
              onClick={() => setShowDebugPanel(false)}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          {errorSummary && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Summary</h4>
                <p>Total Errors: {errorSummary.total}</p>
                <p>Recent (5min): {errorSummary.recentCount}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">By Type</h4>
                {Object.entries(errorSummary.byType).map(([type, count]) => (
                  <p key={type}>{type}: {count as number}</p>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold">By Severity</h4>
                {Object.entries(errorSummary.bySeverity).map(([severity, count]) => (
                  <p key={severity} className={
                    severity === 'critical' ? 'text-red-400' :
                    severity === 'high' ? 'text-orange-400' :
                    severity === 'medium' ? 'text-yellow-400' :
                    'text-gray-400'
                  }>
                    {severity}: {count as number}
                  </p>
                ))}
              </div>

              <div>
                <h4 className="font-semibold">Recent Errors</h4>
                {errorSummary.recentErrors.length > 0 ? (
                  <div className="space-y-1 text-xs">
                    {errorSummary.recentErrors.map((error: any) => (
                      <div key={error.id} className="bg-gray-800 p-2 rounded">
                        <p className="font-semibold text-red-400">{error.type}: {error.severity}</p>
                        <p className="truncate">{error.message}</p>
                        {error.component && <p className="text-gray-400">Component: {error.component}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 text-sm">No recent errors! 🎉</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => exportErrors()}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                >
                  Export to Console
                </button>
                <button 
                  onClick={() => {
                    errorTracker.clearErrors();
                    setErrorSummary(getErrorSummary());
                  }}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Press Ctrl+Shift+E to toggle</p>
            <p>Console commands: getErrorSummary(), exportErrors(), clearErrors()</p>
          </div>
        </div>
      )}
    </>
  );
} 