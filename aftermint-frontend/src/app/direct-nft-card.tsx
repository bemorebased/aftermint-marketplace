"use client";

import Image from 'next/image';
import Link from 'next/link';
import BuyButton from './buy-button';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { ShoppingCart, DollarSign, Zap, Heart } from 'lucide-react';

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
      className={`group relative bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/30 hover:border-cyan-500/40 transition-all duration-525 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 ${
        compact ? 'p-2' : 'p-3'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* NFT Image Container */}
      <div className={`relative ${compact ? 'aspect-square mb-2' : 'aspect-square mb-3'} overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50`}>
        <Link href={nftDetailUrl} className="block w-full h-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-all duration-525 group-hover:scale-110"
            sizes={compact ? "(max-width: 768px) 100px, 120px" : "(max-width: 768px) 150px, 200px"}
          />
          
          {/* Image overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-525" />
        </Link>
        
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
      <div className={`relative z-10 ${compact ? 'space-y-1' : 'space-y-2'}`}>
        {/* Row 1: Collection Name + Token ID */}
        <Link href={nftDetailUrl}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-white group-hover:text-cyan-300 transition-colors duration-525 ${
              compact ? 'text-xs' : 'text-sm'
            }`}>
              {collection?.name || 'NFT'}
            </h3>
            <span className={`font-bold text-gray-300 ${compact ? 'text-xs' : 'text-sm'}`}>
              #{displayTokenId}
            </span>
          </div>
        </Link>
        
        {/* Row 2: Price */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className={`text-gray-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              Price
            </span>
            <span className={`font-bold ${
              isListed && price 
                ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent' 
                : 'text-gray-500'
            } ${compact ? 'text-sm' : 'text-base'}`}>
              {isListed && price ? formatPrice(parseFloat(price)) : 'Not Listed'}
            </span>
          </div>
        </div>
        
        {/* Row 3: Last Sale */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className={`text-gray-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              Last Sale
            </span>
            <span className={`font-bold text-gray-300 ${compact ? 'text-sm' : 'text-base'}`}>
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
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transition-all duration-700 ${
        isHovered ? 'translate-x-full' : '-translate-x-full'
      }`} />
    </div>
  );
} 