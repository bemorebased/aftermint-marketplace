"use client";

import Link from 'next/link';
import BuyButton from './buy-button';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { ShoppingCart, DollarSign, Zap, Heart } from 'lucide-react';
import SafeImage from '@/components/SafeImage';

// Price formatting utility - updated to show full numbers without decimals
const formatPrice = (price: number): string => {
  // Always show full numbers, rounded to remove decimals
  return `𝔹${Math.round(price)}`;
};

interface NFTCardProps {
  id: number;
  name: string;
  image: string;
  owner?: string;
  isListed?: boolean;
  price?: string;
  seller?: string;
  collection?: {
    contract: string;
    name: string;
  };
  tokenId?: number;
  contractAddress?: string;
  compact?: boolean;
  onInteract?: (nft: any) => void;
}

export default function DirectNFTCard({
  id,
  name,
  image,
  owner,
  isListed,
  price,
  seller,
  collection,
  tokenId,
  contractAddress,
  compact = false,
  onInteract
}: NFTCardProps) {
  const { address } = useAccount();
  const [isHovered, setIsHovered] = useState(false);
  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  
  // Use tokenId if available, otherwise fall back to id
  const displayTokenId = tokenId || id;
  const nftDetailUrl = `/nft/${collection?.contract || contractAddress}/${displayTokenId}`;
  
  // Mock last sale data - in real app this would come from props
  const lastSalePrice = Math.random() > 0.7 ? (Math.random() * 2 + 0.1) : null;
  
  // Handle interaction (buy/offer) - either call onInteract or fallback to navigation
  const handleInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onInteract) {
      // Create NFT data object for the modal
      const nftData = {
        id: displayTokenId,
        tokenId: displayTokenId,
        name,
        image,
        owner,
        isListed,
        price,
        seller,
        collection: {
          contract: collection?.contract || contractAddress || '',
          name: collection?.name || 'Unknown Collection'
        }
      };
      onInteract(nftData);
    } else {
      // Fallback to navigation if no onInteract provided
      if (isListed) {
        window.location.href = `/buy/${collection?.contract || contractAddress}/${displayTokenId}`;
      } else {
        window.location.href = nftDetailUrl;
      }
    }
  };
  
  return (
    <div 
      className="group block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-xl border border-theme-border bg-theme-surface transition-all duration-300 hover:shadow-lg hover:shadow-theme-primary/10 hover:-translate-y-1">
        <div className="aspect-square relative">
          <SafeImage
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-all duration-525 group-hover:scale-110"
          />
          
          {/* Image overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-525" />
          
          {/* Status badges - positioned over image */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Listed Badge */}
            {isListed && (
              <div className="bg-gradient-to-r from-emerald-500/90 to-green-500/90 backdrop-blur-sm text-white font-bold rounded-lg px-2 py-1 text-xs shadow-lg border border-emerald-400/30">
                LISTED
              </div>
            )}
            
            {/* Owner Badge */}
            {isOwner && (
              <div className="bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm text-white font-bold rounded-lg px-2 py-1 text-xs shadow-lg border border-blue-400/30">
                OWNED
              </div>
            )}
          </div>
        </div>
        
        {/* Card Content - 3 Row Layout */}
        <div className={`p-3 relative z-10 ${compact ? 'space-y-1' : 'space-y-2'}`}>
          {/* Row 1: Collection Name + Token ID */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => window.location.href = nftDetailUrl}
          >
            <h3 className={`font-bold text-white group-hover:text-cyan-300 transition-colors duration-525 ${
              compact ? 'text-xs' : 'text-sm'
            }`}>
              {collection?.name || 'NFT'}
            </h3>
            <span className={`font-bold text-theme-text-secondary ${compact ? 'text-xs' : 'text-sm'}`}>
              #{displayTokenId}
            </span>
          </div>
          
          {/* Row 2: Price */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className={`text-theme-text-secondary font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                Price
              </span>
              <span className={`font-bold ${
                isListed && price 
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent' 
                  : 'text-theme-text-secondary opacity-60'
              } ${compact ? 'text-sm' : 'text-base'}`}>
                {isListed && price ? formatPrice(parseFloat(price)) : 'Not Listed'}
              </span>
            </div>
          </div>
          
          {/* Row 3: Last Sale */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className={`text-theme-text-secondary font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                Last Sale
              </span>
              <span className={`font-bold text-theme-text-secondary ${compact ? 'text-sm' : 'text-base'}`}>
                {lastSalePrice ? formatPrice(lastSalePrice) : '—'}
              </span>
            </div>
          </div>
          
          {/* Hover Action Button - Overlays Row 2 & 3 */}
          {!isOwner && (
            <div className={`absolute inset-x-0 bottom-0 h-16 flex items-center justify-center transition-all duration-525 ${
              isHovered ? 'opacity-100 backdrop-blur-md bg-black/40' : 'opacity-0'
            } rounded-xl`}>
              <button
                onClick={handleInteraction}
                className={`${
                  compact 
                    ? 'px-3 py-1.5 text-xs' 
                    : 'px-6 py-2 text-sm'
                } bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl border border-white/20 backdrop-blur-sm`}
              >
                {price ? (
                  <>
                    <Zap size={compact ? 14 : 16} className="inline mr-1" />
                    {compact ? 'BUY' : 'Quick Buy'}
                  </>
                ) : (
                  compact ? 'OFFER' : 'Make Offer'
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Card shine effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12 transition-transform duration-700 pointer-events-none ${
          isHovered ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'
        }`} />
      </div>
    </div>
  );
} 