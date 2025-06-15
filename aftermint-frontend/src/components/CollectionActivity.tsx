'use client';

import React, { useState, useEffect } from 'react';
import { CollectionTransaction, getCollectionActivity } from '@/lib/services/profileService';
import { ethers } from 'ethers';

interface CollectionActivityProps {
  collectionAddress: string;
  className?: string;
}

export default function CollectionActivity({ collectionAddress, className = '' }: CollectionActivityProps) {
  const [transactions, setTransactions] = useState<CollectionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!collectionAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log(`[CollectionActivity] Fetching activity for collection: ${collectionAddress}`);
        
        const activity = await getCollectionActivity(collectionAddress, 'to%20%7C%20from', 50);
        setTransactions(activity);
        
        console.log(`[CollectionActivity] Fetched ${activity.length} transactions`);
      } catch (err) {
        console.error('[CollectionActivity] Error fetching collection activity:', err);
        setError('Failed to load collection activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [collectionAddress]);

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string) => {
    if (!value || value === '0') return '0';
    try {
      const ethValue = ethers.formatEther(value);
      return `${parseFloat(ethValue).toFixed(4)} ETH`;
    } catch {
      return '0 ETH';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Unknown time';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ok':
      case 'success':
        return 'text-green-400';
      case 'error':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getTransactionType = (tx: CollectionTransaction) => {
    if (tx.token_transfers && tx.token_transfers.length > 0) {
      const transfer = tx.token_transfers[0];
      if (transfer.type === 'ERC-721' || transfer.type === 'ERC-1155') {
        return 'NFT Transfer';
      }
      return 'Token Transfer';
    }
    if (tx.method) {
      return tx.method;
    }
    return 'Transaction';
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-theme-surface rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-theme-surface-secondary rounded w-32"></div>
                  <div className="h-3 bg-theme-surface-secondary rounded w-48"></div>
                </div>
                <div className="h-4 bg-theme-surface-secondary rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-theme-surface rounded-lg p-8 text-center">
          <p className="text-theme-text-secondary">No recent activity found for this collection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={tx.hash || index} className="bg-theme-surface rounded-lg p-4 hover:bg-theme-surface-secondary transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-theme-text-primary font-medium">
                    {getTransactionType(tx)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-theme-text-secondary">
                  <div className="flex items-center gap-2">
                    <span>From:</span>
                    <a 
                      href={`https://explorer.bf1337.org/address/${tx.from.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-theme-primary hover:underline"
                    >
                      {formatAddress(tx.from.hash)}
                    </a>
                    {tx.from.name && (
                      <span className="text-xs bg-theme-surface-secondary px-2 py-1 rounded">
                        {tx.from.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span>To:</span>
                    <a 
                      href={`https://explorer.bf1337.org/address/${tx.to.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-theme-primary hover:underline"
                    >
                      {formatAddress(tx.to.hash)}
                    </a>
                    {tx.to.name && (
                      <span className="text-xs bg-theme-surface-secondary px-2 py-1 rounded">
                        {tx.to.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span>Value: {formatValue(tx.value)}</span>
                    <span>Block: {tx.block_number}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <a 
                  href={`https://explorer.bf1337.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-primary hover:underline text-sm"
                >
                  {formatAddress(tx.hash)}
                </a>
                <div className="text-xs text-theme-text-secondary mt-1">
                  {formatTimestamp(tx.timestamp)}
                </div>
              </div>
            </div>
            
            {/* Token Transfers */}
            {tx.token_transfers && tx.token_transfers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-theme-surface-secondary">
                <div className="text-xs text-theme-text-secondary">
                  <span className="font-medium">Token Transfers:</span>
                  {tx.token_transfers.map((transfer, i) => (
                    <div key={i} className="mt-1 ml-2">
                      {transfer.token.name} ({transfer.token.symbol}) - {transfer.type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 