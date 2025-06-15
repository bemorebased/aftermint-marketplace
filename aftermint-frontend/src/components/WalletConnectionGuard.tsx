'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function WalletConnectionGuard({ children, fallback }: WalletConnectionGuardProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [hasEthereum, setHasEthereum] = useState(false);

  useEffect(() => {
    // Check if ethereum provider is available
    if (typeof window !== 'undefined') {
      setHasEthereum(!!window.ethereum);
    }
  }, []);

  // Show fallback if not connected and fallback provided
  if (!isConnected && fallback) {
    return <>{fallback}</>;
  }

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔗 Wallet Connection Required
        </h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          To interact with NFTs and the marketplace, please connect your wallet first.
        </p>
        
        {!hasEthereum ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">⚠️ No Ethereum wallet detected</p>
            <p className="text-sm text-gray-500">
              Please install MetaMask or another Web3 wallet to continue.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Wallet is connected, render children
  return <>{children}</>;
} 