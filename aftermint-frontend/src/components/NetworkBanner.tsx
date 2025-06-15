"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

// Add inline chain id
const BASEDAI_CHAIN_ID = 32323;

export default function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [showBanner, setShowBanner] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  useEffect(() => {
    // Only check chain when component mounts or when connection state or chain changes
    const checkNetwork = () => {
      // Only show banner if user is connected but not on BasedAI (chain ID 32323)
      if (isConnected && chainId) {
        // Check if chain ID matches BasedAI's chain ID (32323)
        const isBasedAI = chainId === BASEDAI_CHAIN_ID;
        setShowBanner(!isBasedAI);
      } else {
        setShowBanner(false);
      }
    };
    
    checkNetwork();
    
    // Also set up an interval to periodically check in case wallet state changes without triggers
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, [isConnected, chainId]);
  
  // Handle adding the BasedAI network to MetaMask and switching to it
  const handleAddNetwork = async () => {
    setConnecting(true);
    try {
      // Use the new switchChain function
      if (switchChain) {
        await switchChain({ chainId: BASEDAI_CHAIN_ID });
        setShowBanner(false);
        setConnecting(false);
        return;
      }
      
      // Fall back to manual method
        console.warn('Could not add BasedAI network automatically');
    } catch (error) {
      console.error('Error adding BasedAI network:', error);
    } finally {
      setConnecting(false);
    }
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-2xl px-4 z-50">
      <div className="bg-theme-surface border border-theme-border rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Wrong Network</h3>
            <p className="text-theme-text-secondary">
              This marketplace only works on the BasedAI network (Chain ID: {BASEDAI_CHAIN_ID})
            </p>
          </div>
          <button 
            onClick={handleAddNetwork}
            disabled={connecting}
            className="px-4 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Switch to BasedAI'}
          </button>
        </div>
      </div>
    </div>
  );
} 