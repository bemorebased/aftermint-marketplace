"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, User, Tag, DollarSign, ShoppingCart, Zap } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { buyNFT, makeOfferOnNFT } from '@/lib/services/marketplaceService';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

interface NFTData {
  id: number;
  tokenId: number;
  name: string;
  image: string;
  owner?: string;
  isListed?: boolean;
  price?: string;
  seller?: string;
  collection: {
    contract: string;
    name: string;
  };
}

interface NFTInteractionModalProps {
  nft: NFTData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NFTInteractionModal({ nft, isOpen, onClose }: NFTInteractionModalProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [selectedExpiration, setSelectedExpiration] = useState<number | null>(24); // Default 24 hours
  const [useCustomExpiration, setUseCustomExpiration] = useState(false);
  const [customExpiration, setCustomExpiration] = useState('');

  // Format price with comma separators - updated to use commas for thousands
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    const rounded = Math.round(num);
    return rounded.toLocaleString(); // This adds commas automatically
  };

  // Calculate expiration date
  const calculateExpirationDate = () => {
    if (useCustomExpiration && customExpiration) {
      return new Date(customExpiration);
    } else if (selectedExpiration !== null) {
      const now = new Date();
      return new Date(now.getTime() + selectedExpiration * 60 * 60 * 1000);
    }
    return null;
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle buy transaction directly
  const handleBuyNow = async () => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet to buy this NFT');
      return;
    }

    if (!nft || !nft.collection || !nft.collection.contract || !nft.tokenId) {
      toast.error('NFT data is incomplete');
      return;
    }

    if (!nft.isListed || !nft.price) {
      toast.error('This NFT is not currently listed for sale');
      return;
    }

    try {
      setIsBuying(true);
      toast.loading('Preparing purchase...', { id: 'buy-nft-modal' });
      
      console.log(`[NFTModal] Buying NFT ${nft.collection.contract}/${nft.tokenId} for ${nft.price} BASED`);
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(nft.price);
      
      // Use the buyNFT service function
      const receipt = await buyNFT(
        nft.collection.contract,
        Number(nft.tokenId),
        priceInWei,
        walletClient
      );
      
      console.log(`[NFTModal] Buy transaction confirmed:`, receipt.hash);
      toast.success('Successfully purchased NFT!', { id: 'buy-nft-modal' });
      
      // Close modal and refresh page after successful purchase
      onClose();
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (error: any) {
      console.error('[NFTModal] Error buying NFT:', error);
      
      let errorMessage = 'Error buying NFT';
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction canceled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees or NFT price';
        } else if (error.message.includes('Transaction would fail')) {
          errorMessage = error.message; // Show specific simulation error
        } else {
          errorMessage = `Error: ${error.message.substring(0, 100)}...`;
        }
      }
      
      toast.error(errorMessage, { id: 'buy-nft-modal' });
    } finally {
      setIsBuying(false);
    }
  };

  // Handle make offer
  const handleMakeOffer = async () => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet to make an offer');
      return;
    }

    if (!nft || !nft.collection || !nft.collection.contract || !nft.tokenId) {
      toast.error('NFT data is incomplete');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      setIsMakingOffer(true);
      toast.loading('Preparing offer...', { id: 'make-offer-modal' });
      
      const offerAmountWei = ethers.parseEther(offerAmount);
      
      // Calculate expiration timestamp
      let expirationTimestamp = 0;
      const expirationDate = calculateExpirationDate();
      if (expirationDate) {
        expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
      }
      
      console.log(`[NFTModal] Making offer:`, {
        contract: nft.collection.contract,
        tokenId: nft.tokenId,
        amount: offerAmount,
        expiration: expirationTimestamp
      });
      
      toast.loading('Submitting offer to blockchain...', { id: 'make-offer-modal' });
      
      const tx = await makeOfferOnNFT(
        nft.collection.contract,
        nft.tokenId,
        offerAmountWei,
        expirationTimestamp,
        walletClient
      );
      
      console.log(`[NFTModal] Offer transaction submitted:`, tx.hash);
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'make-offer-modal' });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success('Offer submitted successfully!', { id: 'make-offer-modal' });
        
        // Close modal and reset form
        setShowOfferForm(false);
        setOfferAmount('');
        onClose();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        console.error(`[NFTModal] Transaction failed with status:`, receipt?.status);
        toast.error('Transaction failed. Please try again.', { id: 'make-offer-modal' });
      }
    } catch (error: any) {
      console.error(`[NFTModal] Error making offer:`, error);
      
      let errorMessage = 'Error making offer';
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees or offer amount';
        } else if (error.message.includes('execution reverted')) {
          if (error.message.includes('OfferAlreadyExists')) {
            errorMessage = 'You already have an active offer for this NFT';
          } else if (error.message.includes('OfferAmountTooLow')) {
            errorMessage = 'Offer amount is too low';
          } else {
            errorMessage = 'Transaction reverted. You may already have an offer or there may be a contract issue.';
          }
        } else {
          errorMessage = `Error: ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`;
        }
      }
      
      toast.error(errorMessage, { id: 'make-offer-modal' });
    } finally {
      setIsMakingOffer(false);
    }
  };

  if (!isOpen || !nft) return null;

  const isOwner = address && nft.owner && address.toLowerCase() === nft.owner.toLowerCase();
  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(38)}`;

  // Updated expiration presets - removed 1 Hour option
  const expirationPresets = [
    { label: '12 Hours', hours: 12 },
    { label: '1 Day', hours: 24 },
    { label: '3 Days', hours: 72 },
    { label: '7 Days', hours: 168 },
    { label: '30 Days', hours: 720 },
    { label: 'No Expiration', hours: null }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-525"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/40 w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Header - Updated layout: Name and # on same line */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border-b border-gray-600/30 p-6 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {/* Collection Name and Token ID on same line */}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-white truncate">{nft.collection.name}</h2>
              <span className="text-lg font-bold text-cyan-400 flex-shrink-0">#{nft.tokenId}</span>
            </div>
            
            {/* Owner Info below */}
            {nft.owner && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">Owner:</span>
                <span className="text-white font-mono truncate">
                  {isOwner ? 'You' : shortenAddress(nft.owner)}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300 text-gray-400 hover:text-white flex-shrink-0 ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* NFT Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          
          {/* Status badges over image */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {nft.isListed && (
              <div className="bg-gradient-to-r from-emerald-500/90 to-green-500/90 backdrop-blur-sm text-white font-bold rounded-lg px-3 py-1 text-xs shadow-lg border border-emerald-400/30">
                LISTED
              </div>
            )}
            {isOwner && (
              <div className="bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm text-white font-bold rounded-lg px-3 py-1 text-xs shadow-lg border border-blue-400/30">
                OWNED
              </div>
            )}
          </div>
        </div>

        {/* NFT Info */}
        <div className="p-6 space-y-4">
          {/* Price Display */}
          {nft.isListed && nft.price && (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Current Price</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  𝔹{formatPrice(nft.price)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOwner && !showOfferForm && (
              <>
                {nft.isListed && nft.price ? (
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuying}
                    className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20 backdrop-blur-sm"
                  >
                    <Zap size={22} />
                    {isBuying ? 'Processing...' : `Buy for 𝔹${formatPrice(nft.price)}`}
                  </button>
                ) : null}
                
                <button
                  onClick={() => setShowOfferForm(true)}
                  className="w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3 text-lg border border-gray-600/50 hover:border-purple-400/50 backdrop-blur-sm"
                >
                  Make Offer
                </button>
              </>
            )}

            {/* Make Offer Form - Updated layout */}
            {!isOwner && showOfferForm && (
              <div className="space-y-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                <h3 className="text-lg font-bold text-white mb-3">Make Offer in 𝔹</h3>
                
                {/* Offer Amount Input - Removed label */}
                <div>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600/30 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Enter amount in 𝔹"
                    min="0"
                    step="0.000001"
                  />
                  {nft.isListed && nft.price && (
                    <p className="text-xs text-gray-400 mt-2">
                      Current listing price: 𝔹{formatPrice(nft.price)}
                    </p>
                  )}
                </div>
                
                {/* Expiration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Offer Expiration
                  </label>
                  
                  {/* Preset Options - Updated grid for 6 items */}
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
                            ? 'bg-cyan-500 text-black border-cyan-500'
                            : 'bg-gray-800/50 border-gray-600/30 text-gray-300 hover:border-cyan-500/50'
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
                        className="mr-2 accent-cyan-500"
                      />
                      <span className="text-sm text-gray-300">Custom expiration date</span>
                    </label>
                    
                    {useCustomExpiration && (
                      <input
                        type="datetime-local"
                        value={customExpiration}
                        onChange={(e) => setCustomExpiration(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-600/30 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white text-sm"
                      />
                    )}
                  </div>
                  
                  {/* Expiration Summary */}
                  <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
                    <p className="text-xs text-gray-400">
                      {selectedExpiration === null && !useCustomExpiration ? (
                        'Offer will never expire'
                      ) : (
                        `Offer expires: ${calculateExpirationDate()?.toLocaleString() || 'Invalid date'}`
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Offer Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowOfferForm(false);
                      setOfferAmount('');
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-600/30 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 transition-all duration-300 text-white font-medium backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMakeOffer}
                    disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isMakingOffer}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/20 backdrop-blur-sm"
                  >
                    {isMakingOffer ? 'Making Offer...' : 'Make Offer'}
                  </button>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-lg">You own this NFT</p>
              </div>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Link
                href={`/nft/${nft.collection.contract}/${nft.tokenId}`}
                className="flex-1 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 border border-gray-600/30 hover:border-gray-500/50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
              >
                <ExternalLink size={16} />
                View Details
              </Link>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.collection.contract}/${nft.tokenId}`);
                  toast.success('Link copied to clipboard!');
                }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 border border-gray-600/30 hover:border-gray-500/50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm backdrop-blur-sm"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 