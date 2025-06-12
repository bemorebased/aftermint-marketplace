"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BuyButtonProps {
  collectionAddress: string;
  tokenId: number;
  price: string;
  isOwner: boolean;
  className?: string;
}

export default function BuyButton({
  collectionAddress,
  tokenId,
  price,
  isOwner,
  className = ''
}: BuyButtonProps) {
  const router = useRouter();
  
  // Ensure price is valid
  const priceValue = parseFloat(price);
  const hasValidPrice = !isNaN(priceValue) && priceValue > 0;
  
  if (!hasValidPrice) {
    return (
      <div className={`text-sm text-theme-text-secondary ${className}`}>
        Not listed
      </div>
    );
  }
  
  if (isOwner) {
    return (
      <button
        className={`bg-theme-surface text-theme-text-primary border border-theme-border px-3 py-1 rounded text-sm ${className}`}
        disabled
      >
        Your NFT
      </button>
    );
  }
  
  return (
    <Link 
      href={`/buy/${collectionAddress}/${tokenId}`}
      className={`bg-theme-primary hover:bg-theme-primary/90 text-black font-medium px-3 py-1 rounded transition-colors text-sm ${className}`}
    >
      Buy for {price} BASED
    </Link>
  );
} 