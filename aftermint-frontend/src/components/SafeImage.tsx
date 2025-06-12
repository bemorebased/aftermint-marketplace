'use client';

import Image from 'next/image';
import { useState } from 'react';

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
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try alternative IPFS gateways
      if (src.includes('nursing-gray-opossum.myfilebase.com')) {
        const cid = src.split('/ipfs/')[1];
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

  // For unsafe domains, use regular img tag as fallback
  if (hasError && imageSrc === '/placeholder-nft.png') {
    return (
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // For IPFS URLs that might not be configured, try direct img first
  if (src.includes('nursing-gray-opossum.myfilebase.com') && !hasError) {
    return (
      <img
        src={src}
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