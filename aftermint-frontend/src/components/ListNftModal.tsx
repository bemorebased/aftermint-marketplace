"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react'; // For close button
import Image from 'next/image'; // For NFT image
// We might need a date picker component later, e.g., react-datepicker

interface ListNftModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: { // Basic NFT details to display in the modal
    id: string;
    name: string;
    image: string;
    contractAddress: string;
    collectionName?: string;
  };
  onConfirmListing: (listingDetails: {
    price: string;
    expirationDate?: Date;
    privateBuyerAddress?: string;
  }) => Promise<void>; // Function to call when "List NFT" is clicked
}

const ListNftModal: React.FC<ListNftModalProps> = ({
  isOpen,
  onClose,
  nft,
  onConfirmListing,
}) => {
  const [price, setPrice] = useState('');
  const [privateBuyerAddress, setPrivateBuyerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Expiration states (matching offer modal)
  const [selectedExpiration, setSelectedExpiration] = useState<number | null>(168); // Default 7 days
  const [customExpiration, setCustomExpiration] = useState<string>('');
  const [useCustomExpiration, setUseCustomExpiration] = useState(false);

  // Expiration presets (matching offer modal)
  const expirationPresets = [
    { label: '1 Hour', hours: 1 },
    { label: '12 Hours', hours: 12 },
    { label: '1 Day', hours: 24 },
    { label: '3 Days', hours: 72 },
    { label: '7 Days', hours: 168 },
    { label: '30 Days', hours: 720 },
    { label: 'No Expiration', hours: null }
  ];

  // Helper function for expiration calculation (matching offer modal)
  const calculateExpirationDate = () => {
    if (useCustomExpiration && customExpiration) {
      return new Date(customExpiration);
    }
    if (selectedExpiration === null) {
      return undefined; // No expiration
    }
    const now = new Date();
    return new Date(now.getTime() + selectedExpiration * 60 * 60 * 1000);
  };

  const handleSubmit = async () => {
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onConfirmListing({
        price,
        expirationDate: calculateExpirationDate(),
        privateBuyerAddress: privateBuyerAddress.trim() || undefined,
      });
      // onClose(); // Optionally close on success, or let parent handle
    } catch (err: any) {
      setError(err.message || 'Failed to list NFT. Please try again.');
      console.error("Listing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-theme-surface rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-theme-text-primary">List Your NFT</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-theme-hover text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* NFT Info Preview */}
        <div className="mb-6 p-4 border border-theme-border rounded-lg flex items-center gap-4 bg-theme-surface-secondary nft-image-container">
          {nft.image && (
            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={nft.image}
                alt={nft.name}
                fill={true}
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div>
            <p className="text-sm text-theme-text-secondary">{nft.collectionName || 'Collection'}</p>
            <p className="font-semibold text-lg text-theme-text-primary truncate">{nft.name}</p>
            <p className="text-xs text-theme-text-secondary">Token ID: {nft.id}</p>
          </div>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          {/* Price Input */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-theme-text-secondary mb-1">
              Price (BASED)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
              placeholder="Enter price in BASED"
              min="0.000001"
              step="any"
              required
            />
          </div>

          {/* Expiration Selection */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Listing Expiration
            </label>
            
            {/* Preset Options */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {expirationPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSelectedExpiration(preset.hours);
                    setUseCustomExpiration(false);
                  }}
                  className={`p-2 text-xs rounded-md border transition-colors ${
                    !useCustomExpiration && selectedExpiration === preset.hours
                      ? 'bg-theme-primary text-black border-theme-primary'
                      : 'bg-theme-surface-secondary border-theme-border text-theme-text-secondary hover:border-theme-primary'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* Custom Date Option */}
            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useCustomExpiration}
                  onChange={(e) => setUseCustomExpiration(e.target.checked)}
                  className="mr-2 accent-theme-primary"
                />
                <span className="text-sm text-theme-text-secondary">Custom expiration date</span>
              </label>
              
              {useCustomExpiration && (
            <input
                  type="datetime-local"
                  value={customExpiration}
                  onChange={(e) => setCustomExpiration(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full mt-2 p-2 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
                />
              )}
            </div>
            
            {/* Expiration Summary */}
            <div className="mt-2 p-2 bg-theme-surface-secondary rounded-md">
              <p className="text-xs text-theme-text-secondary">
                {selectedExpiration === null && !useCustomExpiration ? (
                  'Listing will never expire'
                ) : (
                  `Listing expires: ${calculateExpirationDate()?.toLocaleString() || 'Invalid date'}`
                )}
              </p>
            </div>
          </div>

          {/* Private Buyer Address */}
          <div>
            <label htmlFor="privateBuyer" className="block text-sm font-medium text-theme-text-secondary mb-1">
              Private Buyer Address (Optional)
            </label>
            <input
              type="text"
              name="privateBuyer"
              id="privateBuyer"
              value={privateBuyerAddress}
              onChange={(e) => setPrivateBuyerAddress(e.target.value)}
              className="w-full p-3 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
              placeholder="0x..."
            />
            <p className="text-xs text-theme-text-secondary mt-1">
              Only this address will be able to buy your NFT
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">{error}</p>
          )}

          {/* Listing Terms */}
          <div className="pt-2">
            <div className="text-xs text-theme-text-secondary mb-4 space-y-1">
              <p>• Your NFT will be transferred to the marketplace escrow</p>
              <p>• You can cancel your listing at any time</p>
              <p>• Buyers will see your listing immediately</p>
              {selectedExpiration !== null && !useCustomExpiration && (
                <p>• Listing will automatically expire after the selected time</p>
              )}
              {useCustomExpiration && customExpiration && (
                <p>• Listing will expire on the selected date and time</p>
              )}
            </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-futuristic-secondary flex-1 py-3"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !price}
              className="btn-futuristic flex-1 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Listing...
                </>
              ) : (
                'List NFT for Sale'
              )}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListNftModal; 