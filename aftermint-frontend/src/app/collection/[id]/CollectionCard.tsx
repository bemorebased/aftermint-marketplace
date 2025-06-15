"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

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
  items
}) => {
  // Handle both data structures - old and new
  const contractAddress = id || contract || '';
  const logoImage = logoUrl || logo;
  const bannerImage = bannerUrl || banner;
  
  return (
    <Link href={`/collection/${contractAddress}`} className="block group relative">
      <div 
        className="glass-card flex flex-col rounded-2xl overflow-hidden shadow-lg border border-theme-border transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-theme-primary/70 min-w-[300px] max-w-xs group-hover:rotate-y-3 group-hover:-translate-y-1 relative z-10 bg-theme-surface"
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
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 w-full mb-3">
                {floorPrice !== undefined && (
                  <div className="bg-theme-card-highlight rounded-lg p-2 text-center">
                    <p className="text-sm text-theme-text-secondary mb-1">Floor</p>
                    <p className="font-bold text-theme-text-primary">{floorPrice} BASED</p>
                  </div>
                )}
                
                {volume24h !== undefined && (
                  <div className="bg-theme-card-highlight rounded-lg p-2 text-center">
                    <p className="text-sm text-theme-text-secondary mb-1">Volume</p>
                    <p className="font-bold text-theme-text-primary">{volume24h} BASED</p>
                  </div>
                )}
                
                {items !== undefined && (
                  <div className="bg-theme-card-highlight rounded-lg p-2 text-center">
                    <p className="text-sm text-theme-text-secondary mb-1">Items</p>
                    <p className="font-bold text-theme-text-primary">{items}</p>
                  </div>
                )}
              </div>
              
              {/* External links */}
              <div className="flex gap-2 mt-2">
                {website && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(website.startsWith('http') ? website : `https://${website}`, '_blank', 'noopener,noreferrer'); }}
                    className="p-2 rounded-full bg-theme-card-highlight text-theme-text-secondary hover:text-theme-primary transition-colors cursor-pointer"
                    aria-label="Visit website"
                  >
                    <ExternalLink size={16} />
                  </button>
                )}
                
                {twitter && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(twitter, '_blank', 'noopener,noreferrer'); }}
                    className="p-2 rounded-full bg-theme-card-highlight text-theme-text-secondary hover:text-theme-primary transition-colors cursor-pointer"
                    aria-label="Visit Twitter"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </button>
                )}
                
                {telegram && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(telegram.startsWith('http') ? telegram : `https://t.me/${telegram}`, '_blank', 'noopener,noreferrer'); }}
                    className="p-2 rounded-full bg-theme-card-highlight text-theme-text-secondary hover:text-theme-primary transition-colors cursor-pointer"
                    aria-label="Visit Telegram"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.8 1.404 1.705 3.11 2.573 4.788l.221.433c.232.471.48.972.998 1.033.32.039.625-.023.823-.219.164-.163.262-.367.353-.568.18-.414.368-.832.762-1.747l.261-.652a475.31 475.31 0 0 1 4.67-11.294c.24-.551.903-1.557.166-2.588-.319-.444-.68-.749-1.133-.858z"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard; 