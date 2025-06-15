"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ExternalLink, Users, Layers } from 'lucide-react';
import { GroupedNFTCollection, ProfileNFT } from '@/lib/services/profileService';

interface CollectionGroupProps {
  collection: GroupedNFTCollection;
  defaultExpanded?: boolean;
  onNFTClick?: (contractAddress: string, tokenId: string) => void;
  onCollectionClick?: (contractAddress: string) => void;
  showViewCollection?: boolean;
}

const CollectionGroup: React.FC<CollectionGroupProps> = ({
  collection,
  defaultExpanded = false,
  onNFTClick,
  onCollectionClick,
  showViewCollection = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Helper function to get the best image URL from an NFT
  const getNFTImageUrl = (nft: ProfileNFT): string => {
    // Try different image sources in order of preference
    if (nft.image_url) return nft.image_url;
    if (nft.image) return nft.image;
    if (nft.animation_url) return nft.animation_url;
    if (nft.media_url) return nft.media_url;
    
    // Fallback to a placeholder or default image
    return '/images/nft-placeholder.png';
  };

  // Helper function to handle IPFS URLs
  const processImageUrl = (url: string): string => {
    if (!url) return '/placeholder-nft.png';
    
    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return url;
  };

  // Helper function to format numbers
  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNFTClick = (contractAddress: string, tokenId: string) => {
    if (onNFTClick) {
      onNFTClick(contractAddress, tokenId);
    }
  };

  const handleImageError = (tokenId: string) => {
    setFailedImages(prev => new Set([...prev, tokenId]));
  };

  const shouldShowImage = (tokenId: string) => {
    return !failedImages.has(tokenId);
  };

  // Use the correct data structure from the GroupedNFTCollection interface
  const nftItems = collection.token_instances || [];

  return (
    <div className="glass-card rounded-xl border border-theme-border overflow-hidden">
      {/* Collection Header */}
      <div 
        className="p-4 border-b border-theme-border cursor-pointer hover:bg-theme-surface/30 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Collection Icon */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-theme-surface flex-shrink-0">
              {collection.token.icon_url ? (
                <Image
                  src={processImageUrl(collection.token.icon_url)}
                  alt={collection.token.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    e.currentTarget.src = '/images/collection-placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="w-6 h-6 text-theme-text-secondary" />
                </div>
              )}
            </div>

            {/* Collection Info */}
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-theme-text-primary text-lg">
                  {collection.token.name}
                </h3>
                <span className="text-sm text-theme-text-secondary">
                  ({collection.token.symbol})
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-theme-text-secondary">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  <span>{formatNumber(nftItems.length)} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(collection.token.holders)} holders</span>
                </div>
                <div>
                  <span>{formatNumber(collection.token.total_supply)} total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Button and Actions */}
          <div className="flex items-center gap-2">
            {showViewCollection && (
              <Link
                href={`/collection/${collection.token.address}`}
                className="p-2 rounded-lg bg-theme-surface hover:bg-theme-surface/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCollectionClick) {
                    onCollectionClick(collection.token.address);
                  }
                }}
                title="View Collection"
              >
                <ExternalLink className="w-4 h-4 text-theme-text-secondary" />
              </Link>
            )}
            
            <div className="p-2 rounded-lg bg-theme-surface">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-theme-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-theme-text-secondary" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NFT Instances Grid */}
      {isExpanded && (
        <div className="p-4">
          {nftItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {nftItems.map((nft) => {
                const imageUrl = processImageUrl(nft.image_url || nft.image || nft.animation_url || '');
                const showImage = shouldShowImage(nft.token_id?.toString() || '');
                const tokenId = nft.token_id?.toString() || '';
                
                return (
                  <div
                    key={`${nft.contract_address}-${tokenId}`}
                    className="group cursor-pointer"
                    onClick={() => handleNFTClick(nft.contract_address, tokenId)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-theme-surface hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                      {showImage && imageUrl !== '/placeholder-nft.png' ? (
                        <Image
                          src={imageUrl}
                          alt={nft.name || `NFT #${tokenId}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(tokenId)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <div className="text-gray-400 dark:text-gray-500 text-center p-2">
                            <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <span className="text-xs">No Image</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-theme-text-primary truncate">
                        {nft.name || `#${tokenId}`}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        Token #{tokenId}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-surface flex items-center justify-center">
                <Layers className="w-8 h-8 text-theme-text-secondary" />
              </div>
              <p className="text-theme-text-secondary">
                No NFTs found in this collection
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionGroup; 