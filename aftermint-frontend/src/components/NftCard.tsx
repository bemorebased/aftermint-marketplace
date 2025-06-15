"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NftCardProps {
  id: number | string;
  name: string;
  image: string;
  price?: number | string;
  lastSale?: number | string;
  isListed?: boolean;
  collection: {
    name: string;
    contract: string;
    logo?: string;
  };
  showHoverDetails?: boolean;
  isHighlightedForSweep?: boolean;
  contractAddress?: string;
}

const NftCard: React.FC<NftCardProps> = ({ 
  id, 
  name,
  image,
  price,
  lastSale,
  isListed,
  collection,
  showHoverDetails = true,
  isHighlightedForSweep = false,
  contractAddress
}) => {
  // Calculate the correct link path based on whether item is listed
  const contract = contractAddress || collection.contract;
  const linkPath = isListed && price 
    ? `/buy/${contract}/${id}` 
    : `/nft/${contract}/${id}`;
  
  // Only show prices for listed items with a valid price
  const hasValidPrice = isListed && price && parseFloat(price.toString()) > 0;
  
  return (
    <Link 
      href={linkPath} 
      className="block"
    >
      <div className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
        isHighlightedForSweep ? 'border-theme-primary bg-theme-accent/5' : 'border-theme-border'
      }`}>
        {/* NFT Image */}
        <div className="aspect-square relative bg-theme-surface">
          {image ? (
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full font-mono text-sm">
              No Image
            </div>
          )}
          
          {/* Collection badge */}
          {collection.logo && (
            <div className="absolute top-2 left-2 flex items-center gap-1 max-w-[calc(100%-16px)] bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${collection.logo})`,
                }}
              />
              <p className="text-xs text-white font-medium truncate">{collection.name}</p>
            </div>
          )}
          
          {/* Only show price badge for listed items */}
          {hasValidPrice && (
            <div className="absolute bottom-2 right-2 bg-theme-primary/90 text-black font-semibold rounded-md px-2 py-1 text-sm">
              {price} BASED
            </div>
          )}
        </div>
        
        {/* NFT Info */}
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{name || `#${id}`}</h3>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex-1">
              {hasValidPrice ? (
                <p className="font-semibold text-theme-primary">{price} BASED</p>
              ) : (
                <p className="text-sm text-theme-text-secondary">Not listed</p>
              )}
            </div>
            
            {lastSale && (
              <div className="text-xs text-theme-text-secondary">
                Last: {lastSale} BASED
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NftCard; 