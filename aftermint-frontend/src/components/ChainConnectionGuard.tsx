'use client';

import React, { useEffect, useState } from 'react';
import { checkChainConnection, switchToBasedAI, performHealthCheck } from '@/lib/services/chainService';

interface ChainConnectionGuardProps {
  children: React.ReactNode;
  requireChain?: boolean;
}

export default function ChainConnectionGuard({ children, requireChain = true }: ChainConnectionGuardProps) {
  const [chainStatus, setChainStatus] = useState<{
    loading: boolean;
    connected: boolean;
    needsSwitch: boolean;
    error?: string;
    healthIssues: string[];
    recommendations: string[];
  }>({
    loading: true,
    connected: false,
    needsSwitch: false,
    healthIssues: [],
    recommendations: []
  });

  const checkStatus = async () => {
    setChainStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const [chainCheck, healthCheck] = await Promise.all([
        checkChainConnection(),
        performHealthCheck()
      ]);

      setChainStatus({
        loading: false,
        connected: chainCheck.isConnected,
        needsSwitch: chainCheck.needsSwitch,
        error: chainCheck.error,
        healthIssues: healthCheck.issues,
        recommendations: healthCheck.recommendations
      });
    } catch (error: any) {
      setChainStatus({
        loading: false,
        connected: false,
        needsSwitch: false,
        error: `Failed to check chain status: ${error.message}`,
        healthIssues: [],
        recommendations: []
      });
    }
  };

  const handleSwitchChain = async () => {
    try {
      setChainStatus(prev => ({ ...prev, loading: true }));
      await switchToBasedAI();
      await checkStatus(); // Recheck after switching
    } catch (error: any) {
      setChainStatus(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message 
      }));
    }
  };

  useEffect(() => {
    if (requireChain) {
      checkStatus();
    }
  }, [requireChain]);

  // Don't require chain check
  if (!requireChain) {
    return <>{children}</>;
  }

  // Loading state
  if (chainStatus.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking blockchain connection...</p>
        </div>
      </div>
    );
  }

  // Chain connection issues
  if (!chainStatus.connected || chainStatus.healthIssues.length > 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            ⚠️ Blockchain Connection Issues
          </h3>
          <p className="text-orange-700">
            Please resolve the following issues to use the marketplace:
          </p>
        </div>

        {/* Issues */}
        {chainStatus.healthIssues.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-orange-900 mb-2">Issues Found:</h4>
            <ul className="list-disc list-inside space-y-1 text-orange-800">
              {chainStatus.healthIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {chainStatus.recommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-orange-900 mb-2">Recommended Actions:</h4>
            <ul className="list-disc list-inside space-y-1 text-orange-800">
              {chainStatus.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {chainStatus.needsSwitch && (
            <button
              onClick={handleSwitchChain}
              disabled={chainStatus.loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {chainStatus.loading ? 'Switching...' : 'Switch to BasedAI Network'}
            </button>
          )}
          
          <button
            onClick={checkStatus}
            disabled={chainStatus.loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {chainStatus.loading ? 'Checking...' : 'Recheck Connection'}
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-6 p-4 bg-orange-100 rounded border border-orange-200">
          <h5 className="font-medium text-orange-900 mb-2">Need Help?</h5>
          <div className="text-sm text-orange-800 space-y-1">
            <p>• Make sure you have MetaMask or another Web3 wallet installed</p>
            <p>• Ensure your wallet is connected and unlocked</p>
            <p>• Check that you have some BASED tokens for transaction fees</p>
            <p>• Try refreshing the page if issues persist</p>
          </div>
        </div>
      </div>
    );
  }

  // All good, render children
  return <>{children}</>;
} 