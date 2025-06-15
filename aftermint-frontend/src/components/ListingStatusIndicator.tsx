'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ListingStatus {
  isExpired: boolean;
  expiresAt: Date | null;
  timeLeft: string;
  status: 'active' | 'expired' | 'no-listing' | 'loading';
}

interface ListingStatusIndicatorProps {
  expiresAt?: number | string | Date;
  isListed?: boolean;
  className?: string;
  showTimeLeft?: boolean;
}

export default function ListingStatusIndicator({ 
  expiresAt, 
  isListed = false, 
  className = '',
  showTimeLeft = true 
}: ListingStatusIndicatorProps) {
  const [status, setStatus] = useState<ListingStatus>({
    isExpired: false,
    expiresAt: null,
    timeLeft: '',
    status: 'loading'
  });

  useEffect(() => {
    if (!isListed) {
      setStatus({
        isExpired: false,
        expiresAt: null,
        timeLeft: '',
        status: 'no-listing'
      });
      return;
    }

    if (!expiresAt) {
      setStatus({
        isExpired: false,
        expiresAt: null,
        timeLeft: '',
        status: 'active'
      });
      return;
    }

    // Convert expiresAt to Date
    let expirationDate: Date;
    if (typeof expiresAt === 'number') {
      // Assume it's a timestamp in seconds (smart contract format)
      expirationDate = new Date(expiresAt * 1000);
    } else if (typeof expiresAt === 'string') {
      expirationDate = new Date(expiresAt);
    } else {
      expirationDate = expiresAt;
    }

    const now = new Date();
    const isExpired = expirationDate <= now;

    let timeLeft = '';
    if (!isExpired && showTimeLeft) {
      try {
        timeLeft = formatDistanceToNow(expirationDate, { addSuffix: true });
      } catch (error) {
        console.warn('Error formatting time left:', error);
        timeLeft = 'Invalid date';
      }
    }

    setStatus({
      isExpired,
      expiresAt: expirationDate,
      timeLeft,
      status: isExpired ? 'expired' : 'active'
    });

    // Set up interval to update time left every minute
    if (!isExpired && showTimeLeft) {
      const interval = setInterval(() => {
        const currentTime = new Date();
        const stillActive = expirationDate > currentTime;
        
        if (!stillActive) {
          setStatus(prev => ({ ...prev, isExpired: true, status: 'expired', timeLeft: '' }));
          clearInterval(interval);
        } else {
          try {
            const newTimeLeft = formatDistanceToNow(expirationDate, { addSuffix: true });
            setStatus(prev => ({ ...prev, timeLeft: newTimeLeft }));
          } catch (error) {
            clearInterval(interval);
          }
        }
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [expiresAt, isListed, showTimeLeft]);

  if (status.status === 'loading') {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-gray-500">Checking status...</span>
      </div>
    );
  }

  if (status.status === 'no-listing') {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
        <span>Not listed</span>
      </div>
    );
  }

  if (status.status === 'expired') {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
        <span>Listing expired</span>
        {status.expiresAt && (
          <span className="ml-1 text-red-600">
            (on {status.expiresAt.toLocaleDateString()})
          </span>
        )}
      </div>
    );
  }

  // Active listing
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
      <span>Active listing</span>
      {showTimeLeft && status.timeLeft && (
        <span className="ml-1 text-green-600">
          ({status.timeLeft})
        </span>
      )}
    </div>
  );
}

// Helper component for listing action buttons
interface ListingActionButtonProps {
  isExpired: boolean;
  isListed: boolean;
  onBuyClick?: () => void;
  onRefreshClick?: () => void;
  disabled?: boolean;
  price?: string;
}

export function ListingActionButton({ 
  isExpired, 
  isListed, 
  onBuyClick, 
  onRefreshClick,
  disabled = false,
  price 
}: ListingActionButtonProps) {
  if (!isListed) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
      >
        Not for sale
      </button>
    );
  }

  if (isExpired) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full bg-red-200 text-red-700 px-4 py-2 rounded cursor-not-allowed"
        >
          Listing expired
        </button>
        {onRefreshClick && (
          <button
            onClick={onRefreshClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Check for new listing
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onBuyClick}
      disabled={disabled}
      className={`w-full px-4 py-2 rounded font-medium ${
        disabled
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {disabled ? 'Processing...' : `Buy Now${price ? ` for ${price}` : ''}`}
    </button>
  );
} 