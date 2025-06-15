"use client";

import React from 'react';
import Image from 'next/image';

interface NftListItemProps {
  imageUrl: string;
  name: string;
  collectionName?: string;
  price?: string;
  floorPrice?: string;
  tokenId?: string;
  lastSale?: string;
  owner?: string;
}

const NftListItem: React.FC<NftListItemProps> = ({
  imageUrl,
  name,
  collectionName,
  price,
  floorPrice,
  tokenId,
  lastSale,
  owner
}) => {
  return (
    <div className="glass-card rounded-md flex items-center gap-4 p-3 hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          fill={true}
          className="object-cover"
          sizes="64px"
        />
      </div>
      
      {/* Info */}
      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* NFT details */}
        <div className="flex flex-col">
          <p className="text-xs text-theme-text-secondary">{collectionName}</p>
          <p className="font-medium text-theme-text-primary truncate">{name}</p>
          <p className="text-xs text-theme-text-secondary">#{tokenId}</p>
        </div>
        
        {/* Price */}
        <div className="flex flex-col">
          <p className="text-xs text-theme-text-secondary">Price</p>
          <p className="font-bold text-theme-primary">{price || 'Not listed'}</p>
        </div>
        
        {/* Last sale - mobile hidden */}
        <div className="hidden md:flex flex-col">
          <p className="text-xs text-theme-text-secondary">Last Sale</p>
          <p className="font-medium text-theme-text-primary">{lastSale || '—'}</p>
        </div>
        
        {/* Owner - mobile hidden */}
        <div className="hidden md:flex flex-col">
          <p className="text-xs text-theme-text-secondary">Owner</p>
          <p className="font-medium text-theme-text-primary truncate">{owner || '—'}</p>
        </div>
      </div>
      
      {/* Buy button */}
      <button className="btn-futuristic text-sm rounded-md py-1 px-3">
        Buy Now
      </button>
    </div>
  );
};

export default NftListItem;
