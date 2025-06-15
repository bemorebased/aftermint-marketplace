"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, TrendingUp, Activity, Clock, Users } from 'lucide-react';

interface CollectionCardProps {
  name: string;
  contract?: string;
  id?: string;
  logo?: string;
  logoUrl?: string;
  banner?: string;
  bannerUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  floorPrice?: number;
  volume24h?: number;
  items?: number;
  owners?: number;
  // New props for enhanced data
  onHover?: (contractAddress: string) => void;
  isHovered?: boolean;
  floorPriceLoading?: boolean;
  realFloorPrice?: number | null;
  hoverData?: {
    recentSales: number;
    activeListings: number;
    volume24h: number;
    lastActivity?: Date;
  };
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  name,
  contract,
  id,
  logo,
  logoUrl,
  banner,
  bannerUrl,
  website,
  twitter,
  telegram,
  floorPrice,
  volume24h,
  items,
  owners,
  onHover,
  isHovered,
  floorPriceLoading,
  realFloorPrice,
  hoverData
}) => {
  // Handle both data structures - old and new
  const contractAddress = id || contract || '';
  const logoImage = logoUrl || logo;
  const bannerImage = bannerUrl || banner;
  
  // Use real floor price if available, otherwise fallback to static data
  const displayFloorPrice = realFloorPrice !== undefined ? realFloorPrice : floorPrice;
  const displayVolume = hoverData?.volume24h !== undefined ? hoverData.volume24h : volume24h;
  
  const handleMouseEnter = () => {
    if (onHover && contractAddress) {
      onHover(contractAddress);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  return (
    <Link href={`/collection/${contractAddress}`} className="block group relative">
      <div 
        className="glass-card flex flex-col rounded-2xl overflow-hidden shadow-lg border border-theme-border transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-theme-primary/70 min-w-[300px] max-w-xs group-hover:rotate-y-3 group-hover:-translate-y-1 relative z-10 bg-theme-surface"
        onMouseEnter={handleMouseEnter}
      >
        {/* Shimmer effect for border */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-75 transition-opacity duration-500 blur-md group-hover:animate-shimmer-around">
        </div>
        <div className="relative z-20 flex flex-col h-full rounded-2xl bg-theme-surface overflow-hidden"> {/* Ensure content stays on top and respects border radius */}
          {/* Banner */}
          <div className="w-full relative aspect-[3/1] overflow-hidden">
            {bannerImage ? (
          <Image
                src={bannerImage}
                alt={`${name} banner`}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover object-center"
                priority={true}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 flex items-center justify-center">
                <span className="text-theme-text-secondary opacity-50 text-xl">{name}</span>
              </div>
            )}
        </div>
        
          {/* Content */}
          <div className="flex flex-col items-center p-5 pt-12 relative">
            {/* Logo overlapping banner and content */}
            <div className="absolute -top-10 w-20 h-20 rounded-xl overflow-hidden border-4 border-theme-background shadow-md">
              {logoImage ? (
                <Image 
                  src={logoImage}
                  alt={`${name} logo`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full bg-theme-card-highlight flex items-center justify-center">
                  <span className="text-3xl font-bold text-theme-text-primary">{name.charAt(0)}</span>
              </div>
              )}
            </div>
            
            <div className="w-full mt-2 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-1 text-theme-text-primary">{name}</h3>
              <p className="text-sm text-theme-text-secondary mb-4">{contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}</p>
              
              {/* Basic Stats */}
              <div className="grid grid-cols-3 gap-2 w-full mb-3">
                <div className="bg-theme-primary/40 border border-theme-primary/60 rounded-lg p-2 text-center">
                  <p className="text-sm text-theme-text-primary font-medium mb-1">Floor</p>
                  {floorPriceLoading ? (
                    <div className="h-4 bg-theme-surface/50 rounded animate-pulse"></div>
                  ) : (
                    <p className="font-bold text-theme-text-primary">
                      {displayFloorPrice !== undefined && displayFloorPrice !== null && displayFloorPrice > 0 
                        ? `${displayFloorPrice.toFixed(2)} 𝔹` 
                        : 'N/A'}
                    </p>
                  )}
                </div>
                
                <div className="bg-theme-primary/40 border border-theme-primary/60 rounded-lg p-2 text-center">
                  <p className="text-sm text-theme-text-primary font-medium mb-1">Volume</p>
                  <p className="font-bold text-theme-text-primary">
                    {displayVolume !== undefined ? `${displayVolume.toFixed(1)} 𝔹` : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-theme-primary/40 border border-theme-primary/60 rounded-lg p-2 text-center">
                  <p className="text-sm text-theme-text-primary font-medium mb-1">Items</p>
                  <p className="font-bold text-theme-text-primary">{items !== undefined ? items.toLocaleString() : 'N/A'}</p>
                </div>
              </div>

              {/* Enhanced Hover Data */}
              {isHovered && hoverData && (
                <div className="w-full mb-3 p-3 bg-theme-surface/50 rounded-lg border border-theme-border/50 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-green-500" />
                      <span className="text-theme-text-secondary">Sales: {hoverData.recentSales}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={12} className="text-blue-500" />
                      <span className="text-theme-text-secondary">Listed: {hoverData.activeListings}</span>
                    </div>
                    {owners && (
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-purple-500" />
                        <span className="text-theme-text-secondary">Owners: {owners}</span>
                      </div>
                    )}
                    {hoverData.lastActivity && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-orange-500" />
                        <span className="text-theme-text-secondary">{formatTimeAgo(hoverData.lastActivity)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              

            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
