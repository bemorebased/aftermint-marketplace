'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export default function SafeImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = '', 
  priority = false,
  fill = false,
  sizes,
  quality = 75
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Initialize imageSrc from src prop in useEffect to avoid setState during render
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imageSrc) {
      setHasError(true);
      // Try alternative IPFS gateways
      if (imageSrc.includes('nursing-gray-opossum.myfilebase.com')) {
        const cid = imageSrc.split('/ipfs/')[1];
        if (cid) {
          // Try ipfs.io gateway as fallback
          setImageSrc(`https://ipfs.io/ipfs/${cid}`);
          return;
        }
      }
      
      // Final fallback to placeholder
      setImageSrc('/placeholder-nft.png');
    }
  };

  // Show loading state while imageSrc is being set
  if (!imageSrc) {
    return (
      <div 
        className={`${className} bg-theme-surface animate-pulse flex items-center justify-center`} 
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-theme-text-secondary text-sm">Loading...</span>
      </div>
    );
  }

  // For IPFS URLs that might not be configured, try direct img first
  if (imageSrc.includes('nursing-gray-opossum.myfilebase.com')) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover' }}
        onError={handleError}
      />
    );
  }

  // Use Next.js Image component for configured domains
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      onError={handleError}
      priority={priority}
      sizes={sizes}
      quality={quality}
      style={{ objectFit: 'cover' }}
    />
  );
} 