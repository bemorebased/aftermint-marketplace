"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  TrendingUp, Tag, Filter, ChevronDown, ChevronUp, Globe, Send, Users, Layers, List, Copy, 
  ArrowDownNarrowWide, ArrowUpNarrowWide, ArrowDown01, ArrowUp01, ShoppingBag, Search, UserCircle, Star, ExternalLink, Info, MoreHorizontal, ShieldCheck, Share2, X, User, Zap, Grid3x3, Grid2x2, Trash2, Plus, CheckCircle, XCircle, ArrowRightLeft
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ViewModeToggle from '@/components/ViewModeToggle';
import DirectNFTCard from '../../direct-nft-card';
import NFTInteractionModal from '@/components/NFTInteractionModal';
import { fetchCollectionInfo, fetchMultipleNFTMetadata, fetchNFTsWithPagination, getBasedCollectionDetails, fetchNFTMetadata, calculateRarityScore } from '@/utils/nft';
import { basedCollections } from '@/data/collections';
import { getBasedAIProvider, MARKETPLACE_STORAGE_ADDRESS } from '@/lib/services/nftService';
import { makeOfferOnNFT } from '@/lib/services/marketplaceService';
import { getCollectionOffers, ProcessedOffer, getCollectionFloorPriceFromContract, getCollectionVolumeFromContract, getCollectionActivity, getCollectionFloorPrice, getCollectionVolume, getCollectionHoldersCount } from '@/lib/services/storageService';
import { fetchCollectionFromExplorer } from '@/utils/blockchain';
import { formatNumber, formatCompactNumber, formatCurrency } from '@/utils/format';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useAccount, useWalletClient } from 'wagmi';
import { marketplaceABI } from '@/lib/abi/marketplaceABI';
import { MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/constants/contracts';
import { getListingInfo } from '@/lib/services/marketplaceService';
import toast from 'react-hot-toast';
import CollectionActivity from '@/components/CollectionActivity';
import { getCollectionMarketStats } from '@/lib/services/profileService';


// Define a basic CollectionPageSkeleton component
const CollectionPageSkeleton = () => {
  return (
    <div className="container mx-auto animate-pulse">
      {/* Skeleton for Collection Info Header */}
      <div className="mb-8 pt-8">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-xl border border-theme-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-xl bg-theme-surface flex-shrink-0"></div>
              <div className="flex-grow text-center md:text-left">
                <div className="h-8 bg-theme-surface rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-theme-surface rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-theme-surface rounded w-full mb-4"></div>
              </div>
              <div className="flex flex-col gap-4 md:min-w-44 md:border-l md:border-theme-border md:pl-6">
                <div className="flex flex-row gap-4 md:gap-6 justify-center">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-3 bg-theme-surface rounded w-12 mb-1"></div>
                      <div className="h-5 bg-theme-surface rounded w-16"></div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-theme-surface rounded w-20"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton for Tabs */}
      <div className="border-b border-theme-border mb-6">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-3 mr-2">
                <div className="h-5 bg-theme-surface rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton for Item Controls */}
      <div className="px-4 md:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-10 bg-theme-surface rounded-lg w-40"></div> {/* Sort buttons */}
            <div className="h-10 bg-theme-surface rounded-lg w-48"></div> {/* Search input */}
            <div className="h-10 bg-theme-surface rounded-lg w-32"></div> {/* Only Listed */}
            <div className="h-10 bg-theme-surface rounded-lg w-60"></div> {/* Sweep */}
          </div>
          <div className="h-10 bg-theme-surface rounded-lg w-24"></div> {/* ViewModeToggle */}
        </div>

        {/* Skeleton for NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-theme-surface rounded-xl mb-2"></div>
              <div className="h-4 bg-theme-surface rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-theme-surface rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ALL COLLECTIONS DATA (Copied from /app/collection/page.tsx)
const allCollections = [
  {
    name: "MockNFT",
    contract: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    logo: "https://picsum.photos/id/237/200/200", // Random dog image
    banner: "https://picsum.photos/id/1/1500/500", // Random banner
    website: "",
    twitter: "",
    telegram: "",
    description: "A collection of mock NFTs for testing the BasedAI marketplace",
    floorPrice: 0.1, 
    volume24h: 5,
    volume7d: 35,
    items: 100,
    owners: 20,
    chainId: 31337 // Hardhat local chain
  },
  {
    name: "FancyFrogFamily",
    contract: "0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81",
    logo: "https://www.fancyfrogfamily.com/images/logo/000_logo.png",
    banner: "", // Can be empty or a URL
    website: "https://www.fancyfrogfamily.com/",
    twitter: "https://x.com/IT4Station",
    telegram: "",
    description: "A unique collection of Fancy Frogs residing on the blockchain.",
    floorPrice: 0.5, // Example value
    volume24h: 10,  // Example value
    volume7d: 70,   // Example value
    items: 1000,    // Example value
    owners: 300,    // Example value
    chainId: 32323  // BasedAI chain
  },
  {
    name: "Based Pepe",
    contract: "0xd819b90f7a7f8e85639671d2951285573bbf8771",
    logo: "https://pbs.twimg.com/profile_images/1904884065343258624/Vba939p0_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1884239993247240192/1738075616/1500x500",
    website: "",
    twitter: "https://x.com/basedpepenft",
    telegram: "",
    description: "Pepe like you've never seen him before - fully based.",
    floorPrice: 0.2,
    volume24h: 25,
    volume7d: 150,
    items: 5000,
    owners: 1200,
    chainId: 32323
  },
  {
    name: "Gang Game Evolution",
    contract: "0xae6a76d106fd5f799a2501e1d563852da88c3db5",
    logo: "https://pbs.twimg.com/profile_images/1910058281579528192/YYuJqVlF_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1906940747347070976/1743485575/1500x500",
    website: "gangamevolutionbased.online",
    twitter: "https://x.com/GanGamEvolution",
    telegram: "https://t.co/DOIPPEYBNF",
    description: "Evolve your gang members in this blockchain-based game.",
    floorPrice: 1.2,
    volume24h: 50,
    volume7d: 300,
    items: 2500,
    owners: 800,
    chainId: 32323
  },
  {
    name: "LifeNodes",
    contract: "0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21",
    logo: "https://pbs.twimg.com/profile_images/1912414230336180224/Q_K-eZn__400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1890893149934858241/1745573721/1500x500",
    website: "https://basedai.art/",
    twitter: "https://x.com/BasedLifeNodes",
    telegram: "https://t.me/lifenodes",
    description: "LifeNodes is a collection of 777 unique digital assets that represent nodes in the BasedAI ecosystem. Holders enjoy exclusive benefits and reduced marketplace fees.",
    floorPrice: 0.68,
    volume24h: 14.5,
    volume7d: 105.8,
    items: 777,
    owners: 420,
    chainId: 32323
  },
  {
    name: "KEKTECH",
    contract: "0x40b6184b901334c0a88f528c1a0a1de7a77490f1",
    logo: "https://pbs.twimg.com/profile_images/1907886210724364288/xNKmFj9s_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1907383327092359168/1743710496/1500x500",
    website: "https://www.kektech.xyz/",
    twitter: "https://x.com/KektechNFT",
    telegram: "https://t.me/KEKTECH",
    description: "KEKTECH is a futuristic collection of 1000 technologies from the KEK dimension, designed to bring laughter and innovation to the BasedAI ecosystem.",
    floorPrice: 0.45,
    volume24h: 8.2,
    volume7d: 62.3,
    items: 1000,
    owners: 350,
    chainId: 32323
  },
  {
    name: "Test Taco",
    contract: "0xa8a1087c73e9d6980b42df91149f96b99f75970e",
    logo: "https://3oh.myfilebase.com/ipfs/QmSK8KA8UbDYWBA5qA6BhabC6xwoc61VtyhrFmeoQ3b5QW.png",
    banner: "https://www.nachonft.xyz/headers/test-tacos.png",
    website: "nachonft.xyz",
    twitter: "https://x.com/nachonft_xyz",
    telegram: "",
    description: "Deliciously digital tacos, each one unique.",
    floorPrice: 0.1,
    volume24h: 5,
    volume7d: 25,
    items: 500,
    owners: 150,
    chainId: 32323
  },
  {
    name: "BasedBeasts",
    contract: "0xd4b1516eea9ccd966629c2972dab8683069ed7bc",
    logo: "https://ipfs.io/ipfs/QmZH1A4CWbqh9b1ueCUibUYZawDPy4GRkxXqKpujwvW7PM",
    banner: "https://pbs.twimg.com/profile_banners/1743117866184929280/1742407630/1500x500",
    website: "https://www.basedbeasts.xyz/",
    twitter: "https://x.com/TheDiscoFrog",
    telegram: "",
    description: "Wild beasts from the Based dimension.",
    floorPrice: 0.75,
    volume24h: 30,
    volume7d: 200,
    items: 888,
    owners: 400,
    chainId: 32323
  },
  {
    name: "PepperCorn Genesis",
    contract: "0xa0c2262735c1872493c92ec39aff0d9b6894d8fd",
    logo: "https://pbs.twimg.com/profile_images/1912790640988946433/93LxnMNB_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908148796162445312/1744906164/1500x500",
    website: "",
    twitter: "https://x.com/PepperCorn15953",
    telegram: "https://t.me/peppercornisgudcoin",
    description: "The genesis collection of PepperCorn NFTs.",
    floorPrice: 0.3,
    volume24h: 12,
    volume7d: 80,
    items: 1200,
    owners: 500,
    chainId: 32323
  },
  {
    name: "Dank Pepes",
    contract: "0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d",
    logo: "https://pbs.twimg.com/profile_images/1904732858323009536/TIWjPpin_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1900002904377102336/1745118780/1500x500",
    website: "dankpepes.io",
    twitter: "https://x.com/dank_pepes",
    telegram: "The Dank Lounge",
    description: "The Dank Pepes collection features 2000 of the rarest and most valuable Pepes in the metaverse. Each Pepe is unique and brings its own special meme energy to the BasedAI network.",
    floorPrice: 0.32,
    volume24h: 5.7,
    volume7d: 38.5,
    items: 2000,
    owners: 800,
    chainId: 32323
  },
  {
    name: "PixelPepes",
    contract: "0x22af27d00c53c0fba14446958864db7e3fe0852c",
    logo: "https://pbs.twimg.com/profile_images/1915049463825018881/2RLzSbBj_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1914470955058954240/1745335435/1500x500",
    website: "",
    twitter: "https://x.com/pxlpepes",
    telegram: "",
    description: "Pixelated Pepes for the discerning collector.",
    floorPrice: 0.15,
    volume24h: 7,
    volume7d: 40,
    items: 3000,
    owners: 900,
    chainId: 32323
  },
  {
    name: "Peps",
    contract: "0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f",
    logo: "https://pbs.twimg.com/profile_images/1903806957292810240/ur3Xm_Ax_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1355098383774605313/1742737936/1500x500",
    website: "",
    twitter: "https://x.com/RealPeposhi",
    telegram: "",
    description: "A collection of Peps with various traits.",
    floorPrice: 0.05,
    volume24h: 3,
    volume7d: 20,
    items: 10000,
    owners: 2500,
    chainId: 32323
  },
  {
    name: "KEKISTANIOS",
    contract: "0x2f3df3922990e63a239d712964795efd9a150dd1",
    logo: "https://pbs.twimg.com/profile_images/1896681606078750720/UiiHVSXO_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1896680553086115840/1741045445/1500x500",
    website: "",
    twitter: "https://x.com/kekistanio62517",
    telegram: "",
    description: "Warriors from the great land of Kekistan.",
    floorPrice: 0.25,
    volume24h: 9,
    volume7d: 65,
    items: 1500,
    owners: 600,
    chainId: 32323
  },
  {
    name: "CosmicPond",
    contract: "0xd36199215717f858809b0e62441c1f81adbf3d2c",
    logo: "https://pbs.twimg.com/profile_images/1898913093465337856/p-bGc3Mq_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1898909967027146752/1741571137/1500x500",
    website: "https://cosmicpond.net/",
    twitter: "https://x.com/CosmicPondNFT",
    telegram: "https://t.me/CosmicPond",
    description: "Explore the mysteries of the Cosmic Pond.",
    floorPrice: 0.8,
    volume24h: 18,
    volume7d: 120,
    items: 600,
    owners: 250,
    chainId: 32323
  },
  {
    name: "The Based Man Collection",
    contract: "0x853efb327ea5d8766265b78c5b9092e2a85a8f70",
    logo: "https://pbs.twimg.com/media/GmeQSf5WoAAwvUo?format=jpg&name=large",
    banner: "https://pbs.twimg.com/media/Gn2D7tfXIAALZwW?format=png&name=large",
    website: "",
    twitter: "https://x.com/carpetfrawg",
    telegram: "",
    description: "The official collection of The Based Man.",
    floorPrice: 0.9,
    volume24h: 22,
    volume7d: 180,
    items: 500,
    owners: 200,
    chainId: 32323
  },
  {
    name: "Pepe Rocks",
    contract: "0x44dF92D10E91fa4D7E9eAd9fF6A6224c88ae5152",
    logo: "https://pbs.twimg.com/profile_images/1910144664059166720/6A7cs9EQ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1910144452397821952/1744249064/1500x500",
    website: "",
    twitter: "https://x.com/RocksPepe",
    telegram: "",
    description: "Pepe, but as rocks. Seriously.",
    floorPrice: 0.08,
    volume24h: 4,
    volume7d: 30,
    items: 3333,
    owners: 1000,
    chainId: 32323
  },
  {
    name: "Based Whales",
    contract: "0xd480f4a34a1740a5b6fd2da0d3c6cc6a432b56f2",
    logo: "https://pbs.twimg.com/profile_images/1904857423279775746/4t3KvYGx_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1904857193629048834/1742988775/1500x500",
    website: "basedsea.xyz",
    twitter: "https://x.com/basedsea_xyz",
    telegram: "",
    description: "Majestic whales of the Based Sea.",
    floorPrice: 1.5,
    volume24h: 40,
    volume7d: 250,
    items: 100,
    owners: 70,
    chainId: 32323
  },
  {
    name: "Lil Coalies",
    contract: "0x36003438a167d13043028d794290dda93fea1236",
    logo: "https://pbs.twimg.com/profile_images/1915215931095265280/fckrzPoY_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908363293020110848/1745458441/1500x500",
    website: "https://lilcoalies.com/",
    twitter: "https://x.com/LilCoalies",
    telegram: "",
    description: "Cute and collectible Coalies.",
    floorPrice: 0.4,
    volume24h: 15,
    volume7d: 90,
    items: 2222,
    owners: 700,
    chainId: 32323
  },
  {
    name: "DEMWORLD",
    contract: "0xaf024210fdb085fc73b3f1ca1d7d722574f0133b",
    logo: "https://pbs.twimg.com/profile_images/1897011933347201024/_kV-yNOJ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1897009617369989120/1741676552/1500x500",
    website: "",
    twitter: "https://x.com/THEDEMWORLD",
    telegram: "",
    description: "Enter DEMWORLD, a new reality on Based.",
    floorPrice: 0.6,
    volume24h: 20,
    volume7d: 140,
    items: 1800,
    owners: 650,
    chainId: 32323
  }
];

// Mock data for collection - in a real app this would come from an API
// const collections = { ... }; // REMOVE THIS OLD MOCK OBJECT

// Updated to use the Collection type from allCollections
interface Collection {
  name: string;
  contract: string;
  logo?: string;
  banner?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  description?: string;
  floorPrice?: number;
  volume24h?: number;
  volume7d?: number;
  totalSupply?: number; // Made optional to allow undefined while loading
  holders?: number; // Made optional to allow undefined while loading
  chainId: number;
}

// Price formatting utility - updated to use our new formatting
const formatPrice = (price: number): string => {
  if (price == null || isNaN(price)) return 'N/A';
  
  // For cryptocurrency, show more precision for small amounts, less for large amounts
  if (price < 1) {
    return `𝔹${price.toFixed(3)}`;
  } else if (price < 1000) {
    return `𝔹${price.toFixed(2)}`;
  } else {
    // Use our formatNumber for large amounts with commas
    return `𝔹${formatNumber(Math.round(price))}`;
  }
};

// Sort options
type SortOption = 'price_low_high' | 'price_high_low' | 'token_id_asc' | 'token_id_desc';

const generateMockNFTs = (collectionData: Collection | undefined, count: number = 20) => {
  if (!collectionData) return [];
  
  console.log(`[GenerateMockNFTs] Creating ${count} mock NFTs for collection:`, collectionData.name);

  return Array.from({ length: count }, (_, i) => {
    const tokenId = i + 1;
    
    // Create a realistic distribution: ~25% listed with varied prices
    const isListed = Math.random() < 0.25; // 25% chance of being listed
    
    // Generate realistic prices around the floor price
    const baseFloorPrice = (collectionData as any).floorPrice || 0.1;
    let price = null;
    
    if (isListed) {
      // Generate varied prices: some at floor, some higher
      const priceVariation = Math.random();
      if (priceVariation < 0.3) {
        // 30% at or near floor price
        price = baseFloorPrice * (0.95 + Math.random() * 0.1); // 0.95x to 1.05x floor
      } else if (priceVariation < 0.7) {
        // 40% moderately above floor
        price = baseFloorPrice * (1.1 + Math.random() * 2); // 1.1x to 3.1x floor
      } else {
        // 30% significantly above floor
        price = baseFloorPrice * (3 + Math.random() * 7); // 3x to 10x floor
      }
      
      // Ensure NFT #118 has specific price for testing
      if (tokenId === 118) {
        price = 555.0;
        console.log(`[GenerateMockNFTs] ✅ Setting NFT #118 with test price: ${price} BASED`);
      }
      
      // Round to 3 decimal places
      price = parseFloat(price.toFixed(3));
    }
    
    // Force NFT #118 to be listed for testing
    if (tokenId === 118) {
      price = price || 555.0;
      const finalNFT = {
        id: tokenId,
        tokenId: tokenId,
        name: `${collectionData.name} #${tokenId}`,
        image: `https://picsum.photos/seed/${(collectionData as any).contract || collectionData.name}${tokenId}/500/500`,
        price: price,
        isListed: true,
        listing: {
          active: true,
          price: String(price),
          seller: `0x${Math.random().toString(16).substring(2, 42)}`,
          nftContract: (collectionData as any).contract || 'unknown',
          tokenId: tokenId
        },
        seller: `0x${Math.random().toString(16).substring(2, 42)}`,
        owner: `0x${Math.random().toString(16).substring(2, 42)}`,
        attributes: [
          { trait_type: "Background", value: ["Blue", "Green", "Purple", "Gold", "Silver"][Math.floor(Math.random() * 5)] },
          { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 5)] }
        ]
      };
      
      console.log(`[GenerateMockNFTs] ✅ Created NFT #118 with listing:`, {
        tokenId: finalNFT.tokenId,
        isListed: finalNFT.isListed,
        price: finalNFT.price,
        listing: finalNFT.listing
      });
      
      return finalNFT;
    }
    
    const nftData = {
      id: tokenId,
      tokenId: tokenId,
      name: `${collectionData.name} #${tokenId}`,
      image: `https://picsum.photos/seed/${(collectionData as any).contract || collectionData.name}${tokenId}/500/500`,
      price: price,
      isListed: isListed,
      listing: isListed ? {
        active: true,
        price: String(price),
        seller: `0x${Math.random().toString(16).substring(2, 42)}`,
        nftContract: (collectionData as any).contract || 'unknown',
        tokenId: tokenId
      } : null,
      seller: isListed ? `0x${Math.random().toString(16).substring(2, 42)}` : null,
      owner: `0x${Math.random().toString(16).substring(2, 42)}`,
      attributes: [
        { trait_type: "Background", value: ["Blue", "Green", "Purple", "Gold", "Silver"][Math.floor(Math.random() * 5)] },
        { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 5)] }
      ]
    };
    
    return nftData;
  });
};

// Enhanced function to fetch ALL NFTs with proper marketplace listing detection
function CollectionPage({ params }: { params: Promise<{ address: string }> }) {
  const router = useRouter();
  const [address, setAddress] = useState<string>('');
  
  // Resolve params Promise
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setAddress(resolved.address);
    }
    resolveParams();
  }, [params]);
  const { address: walletAddress } = useAccount();

  // State management
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalNFTs, setTotalNFTs] = useState<number>(0);
  const [hasMoreNFTs, setHasMoreNFTs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(48);
  const [sortBy, setSortBy] = useState<SortOption>('price_low_high');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [showOnlyListed, setShowOnlyListed] = useState(false);
  const [viewMode, setViewMode] = useState<'based' | 'compact' | 'list'>('based');
  const [currentTab, setCurrentTab] = useState<'items' | 'analytics' | 'activity'>('items');
  
  // Metadata filter states
  const [showFilters, setShowFilters] = useState(false);
  const [availableTraits, setAvailableTraits] = useState<{[key: string]: string[]}>({});
  const [selectedTraits, setSelectedTraits] = useState<{[key: string]: string[]}>({});
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({min: '', max: ''});
  
  // Modal states
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sweep states
  const [sweepCount, setSweepCount] = useState(0);
  const [sweepMaxPrice, setSweepMaxPrice] = useState('');
  const [showSweepPriceModal, setShowSweepPriceModal] = useState(false);
  const [sweepHighlightIds, setSweepHighlightIds] = useState<Set<number>>(new Set());
  
  // Statistics states
  const [collectionStats, setCollectionStats] = useState({
    floorPrice: null as number | null,
    volume24h: 0,
    volume7d: 0,
    totalVolume: 0,
    realHoldersCount: null as number | null
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Activity states - removed (now handled by CollectionActivity component)
  
  // Copy states
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Utility functions
  const shortenAddress = (address: string, chars = 4) => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePageLinkCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy page link:', err);
    }
  };

  // Search handlers
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInputValue.trim());
      setCurrentPage(1);
    }
  };

  const clearSearch = () => {
    setSearchInputValue('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Metadata filter functions
  const extractTraitsFromNFTs = (nfts: any[]) => {
    const traits: {[key: string]: Set<string>} = {};
    
    nfts.forEach(nft => {
      // Check multiple possible attribute locations
      const attributes = nft.attributes || nft.metadata?.attributes || nft.traits || [];
      
      if (Array.isArray(attributes)) {
        attributes.forEach((attr: any) => {
          if (attr.trait_type && attr.value !== undefined && attr.value !== null) {
            if (!traits[attr.trait_type]) {
              traits[attr.trait_type] = new Set();
            }
            traits[attr.trait_type].add(attr.value.toString());
          }
        });
      }
    });
    
    // Convert Sets to Arrays for easier handling
    const traitsArray: {[key: string]: string[]} = {};
    Object.keys(traits).forEach(traitType => {
      traitsArray[traitType] = Array.from(traits[traitType]).sort();
    });
    
    console.log('[ExtractTraits] Found traits:', traitsArray);
    return traitsArray;
  };

  const handleTraitFilter = (traitType: string, value: string) => {
    setSelectedTraits(prev => {
      const newTraits = { ...prev };
      if (!newTraits[traitType]) {
        newTraits[traitType] = [];
      }
      
      if (newTraits[traitType].includes(value)) {
        // Remove the trait
        newTraits[traitType] = newTraits[traitType].filter(v => v !== value);
        if (newTraits[traitType].length === 0) {
          delete newTraits[traitType];
        }
      } else {
        // Add the trait
        newTraits[traitType].push(value);
      }
      
      return newTraits;
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setSelectedTraits({});
    setPriceRange({min: '', max: ''});
    setCurrentPage(1);
  };

  const applyFilters = (nfts: any[]) => {
    let filtered = [...nfts];
    
    // Apply trait filters
    Object.keys(selectedTraits).forEach(traitType => {
      const selectedValues = selectedTraits[traitType];
      if (selectedValues.length > 0) {
        filtered = filtered.filter(nft => {
          if (!nft.attributes || !Array.isArray(nft.attributes)) return false;
          
          return nft.attributes.some((attr: any) => 
            attr.trait_type === traitType && 
            selectedValues.includes(attr.value?.toString())
          );
        });
      }
    });
    
    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(nft => {
        if (!nft.price || nft.price <= 0) return false;
        
        const price = nft.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        
        return price >= min && price <= max;
      });
    }
    
    return filtered;
  };

  // Function to fetch collection activity - removed (now handled by CollectionActivity component)

  // In-memory cache for NFT data to avoid refetching
  const nftCache = React.useRef<{[key: string]: any}>({});
  const [totalCachedNFTs, setTotalCachedNFTs] = React.useState<number>(0);

  const fetchRealNFTs = async (
    collectionAddress: string, 
    page: number = 1, 
    itemsPerPage: number = 20,
    sortBy: SortOption = 'price_low_high',
    searchQuery?: string,
    showOnlyListed: boolean = false
  ) => {
    try {
      console.log(`[FetchRealNFTs] Starting optimized fetch for collection ${collectionAddress}, page ${page}`);
      
      const provider = getBasedAIProvider();
      const cacheKey = `${collectionAddress}_${page}_${itemsPerPage}_${sortBy}_${searchQuery}_${showOnlyListed}`;
      
      // Check cache first
      if (nftCache.current[cacheKey]) {
        console.log(`[FetchRealNFTs] ⚡ Using cached data for ${cacheKey}`);
        return nftCache.current[cacheKey];
      }
      
      // Get total supply once and cache it
      let totalSupply = 1000; // Fallback
      const totalSupplyCacheKey = `totalSupply_${collectionAddress}`;
      
      if (nftCache.current[totalSupplyCacheKey]) {
        totalSupply = nftCache.current[totalSupplyCacheKey];
      } else {
        try {
          console.log(`[FetchRealNFTs] Getting total supply for contract...`);
          const nftContract = new ethers.Contract(
            collectionAddress,
            ["function totalSupply() view returns (uint256)"],
            provider
          );
          
          const totalSupplyBN = await nftContract.totalSupply();
          totalSupply = Number(totalSupplyBN);
          console.log(`[FetchRealNFTs] ✅ Got total supply: ${totalSupply}`);
          
          // Cache total supply
          nftCache.current[totalSupplyCacheKey] = totalSupply;
          
        } catch (error) {
          console.warn('[FetchRealNFTs] Could not get total supply, using fallback:', error);
          // Use realistic fallback values for known collections
          if (collectionAddress.toLowerCase() === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21') {
            totalSupply = 1000; // LifeNodes
          } else {
            totalSupply = 1000; // General fallback
          }
          nftCache.current[totalSupplyCacheKey] = totalSupply;
        }
      }

      // OPTIMIZATION 1: Smart pagination - only fetch what we need for the current view
      let tokenIdsToFetch = [];
      
      if (showOnlyListed || searchQuery?.trim()) {
        // For filtered views, we need to fetch more to ensure we have enough results
        // But still be smart about it - fetch in chunks and stop when we have enough
        const startId = Math.max(1, (page - 1) * itemsPerPage * 2); // Fetch 2x to account for filtering
        const endId = Math.min(totalSupply, startId + itemsPerPage * 4); // Fetch 4x to be safe
        
        for (let i = startId; i <= endId; i++) {
          tokenIdsToFetch.push(i);
        }
      } else {
        // For unfiltered views, we can be precise
        const startId = Math.max(1, (page - 1) * itemsPerPage + 1);
        const endId = Math.min(totalSupply, startId + itemsPerPage - 1);
        
        for (let i = startId; i <= endId; i++) {
          tokenIdsToFetch.push(i);
        }
      }

      console.log(`[FetchRealNFTs] 🎯 Optimized: Fetching ${tokenIdsToFetch.length} NFTs (${tokenIdsToFetch[0]}-${tokenIdsToFetch[tokenIdsToFetch.length-1]}) instead of all ${totalSupply}`);

      // OPTIMIZATION 2: Batch fetch metadata with smaller, faster batches
      const metadataBatchSize = 10; // Smaller batches for faster initial response
      let nftData = [];
      
      for (let i = 0; i < tokenIdsToFetch.length; i += metadataBatchSize) {
        const batch = tokenIdsToFetch.slice(i, i + metadataBatchSize);
        console.log(`[FetchRealNFTs] 📦 Fetching metadata batch ${Math.floor(i/metadataBatchSize) + 1}/${Math.ceil(tokenIdsToFetch.length/metadataBatchSize)}`);
        
        const batchMetadata = await fetchMultipleNFTMetadata(collectionAddress, batch);
        
        // Process batch results
        const batchNFTs = (batchMetadata || [])
          .map((metadata, index) => {
            if (!metadata) return null;
            
            const tokenId = batch[index];
            return {
              id: tokenId,
              tokenId: tokenId,
              name: metadata.name || `#${tokenId}`,
              image: metadata.image || `/placeholder-nft.png`,
              owner: metadata.owner || '0x0000000000000000000000000000000000000000',
              isListed: false,
              price: null as number | null,
              seller: null as string | null,
              listing: null as any | null,
              collection: {
                name: 'Collection',
                contract: collectionAddress
              }
            };
          })
          .filter(nft => nft !== null);
        
        nftData.push(...batchNFTs);
        
        // Small delay between metadata batches
        if (i + metadataBatchSize < tokenIdsToFetch.length) {
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      }
      
      console.log(`[FetchRealNFTs] ✅ Fetched ${nftData.length} valid NFT metadata entries`);
      
      // OPTIMIZATION 3: Check listings for each NFT using marketplace contract
      try {
        console.log(`[FetchRealNFTs] 💰 Checking listings for ${nftData.length} NFTs...`);
        
        // Import the getListingInfo function
        const { getListingInfo } = await import('@/lib/services/marketplaceService');
        
        // Check listings in smaller batches to avoid overwhelming the RPC
        const listingBatchSize = 10;
        const listingPromises = [];
        
        for (let i = 0; i < nftData.length; i += listingBatchSize) {
          const batch = nftData.slice(i, i + listingBatchSize);
          
          const batchPromise = Promise.all(
            batch.map(async (nft) => {
              try {
                const listingInfo = await getListingInfo(collectionAddress, nft.tokenId, provider);
                if (listingInfo && listingInfo.price && Number(listingInfo.price) > 0) {
                  return {
                    ...nft,
                    isListed: true,
                    price: parseFloat(ethers.formatEther(listingInfo.price)),
                    seller: listingInfo.seller,
                    listing: listingInfo
                  };
                }
              } catch (error) {
                // Silent fail for individual listings
              }
              
              return {
                ...nft,
                isListed: false,
                price: null,
                seller: null,
                listing: null
              };
            })
          );
          
          listingPromises.push(batchPromise);
          
          // Small delay between batches
          if (i + listingBatchSize < nftData.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Wait for all listing batches to complete
        const allBatchResults = await Promise.all(listingPromises);
        
        // Flatten results
        nftData = allBatchResults.flat();
        
        const listedCount = nftData.filter(nft => nft.isListed).length;
        console.log(`[FetchRealNFTs] ✅ Found ${listedCount} listed NFTs out of ${nftData.length} checked`);
        
      } catch (error) {
        console.warn('[FetchRealNFTs] Could not fetch marketplace listings:', error);
        // Apply default listing state
        nftData = nftData.map(nft => ({
          ...nft,
          isListed: false,
          price: null,
          seller: null,
          listing: null
        }));
      }

      // OPTIMIZATION 4: Apply search filtering
      let filteredNFTs = nftData;
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        filteredNFTs = nftData.filter((nft: any) => 
          nft.name?.toLowerCase().includes(query) ||
          nft.tokenId?.toString().includes(query) ||
          `#${nft.tokenId}`.includes(query)
        );
        console.log(`[FetchRealNFTs] Search '${searchQuery}' filtered to ${filteredNFTs.length} NFTs`);
      }
      
      // Apply listing filter
      if (showOnlyListed) {
        filteredNFTs = filteredNFTs.filter((nft: any) => nft.isListed && nft.price && nft.price > 0);
        console.log(`[FetchRealNFTs] Only listed filter: ${filteredNFTs.length} NFTs`);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price_low_high':
          filteredNFTs.sort((a: any, b: any) => {
            if (!a.isListed && !b.isListed) return (a.tokenId || 0) - (b.tokenId || 0);
            if (!a.isListed) return 1;
            if (!b.isListed) return -1;
            return (a.price || 0) - (b.price || 0);
          });
          break;
        case 'price_high_low':
          filteredNFTs.sort((a: any, b: any) => {
            if (!a.isListed && !b.isListed) return (b.tokenId || 0) - (a.tokenId || 0);
            if (!a.isListed) return 1;
            if (!b.isListed) return -1;
            return (b.price || 0) - (a.price || 0);
          });
          break;
        case 'token_id_asc':
          filteredNFTs.sort((a: any, b: any) => (a.tokenId || 0) - (b.tokenId || 0));
          break;
        case 'token_id_desc':
          filteredNFTs.sort((a: any, b: any) => (b.tokenId || 0) - (a.tokenId || 0));
          break;
      }
      
      // Cache the results for faster subsequent loads
      const result = {
        nfts: filteredNFTs,
        totalItems: totalSupply, // Use actual total supply for pagination
        hasMore: false // Since we're paginating server-side, this is managed differently
      };
      
      nftCache.current[cacheKey] = result;
      
      console.log(`[FetchRealNFTs] ✅ Cached and returning ${filteredNFTs.length} NFTs for page ${page}`);
      
      return result;
      
    } catch (error) {
      console.error(`[FetchRealNFTs] Error fetching real NFTs:`, error);
      throw error;
    }
  };

  const fetchCollectionStats = async () => {
    if (!address) return;
    
    setStatsLoading(true);
    try {
      console.log(`[CollectionPage] 🚨 CRITICAL: Fetching COMPLETE collection statistics for ${address}`);
      const provider = getBasedAIProvider();
      
      // Get real collection data from BasedAI explorer API
      let realHoldersCount = null;
      let realTotalSupply = null;
      
      try {
        const response = await fetch(`https://explorer.bf1337.org/api/v2/addresses/${address}`);
        if (response.ok) {
          const explorerData = await response.json();
          console.log(`[CollectionPage] Explorer data:`, explorerData);
          
          if (explorerData.token) {
            realHoldersCount = parseInt(explorerData.token.holders) || null;
            realTotalSupply = parseInt(explorerData.token.total_supply) || null;
            console.log(`[CollectionPage] Real blockchain data - Holders: ${realHoldersCount}, Total Supply: ${realTotalSupply}`);
          }
        }
      } catch (error) {
        console.warn(`[CollectionPage] Could not fetch from explorer API:`, error);
      }
      
      // Get volume stats
      const [volume1d, volume7d, totalVolume] = await Promise.all([
        getCollectionVolume(address, provider, 1).catch(() => 0),
        getCollectionVolume(address, provider, 7).catch(() => 0),
        getCollectionVolume(address, provider).catch(() => 0)
      ]);
      
      // 🚨 CRITICAL FIX: Get ACCURATE floor price from ALL collection items
      console.log(`[CollectionPage] 🏆 Getting ACCURATE market data from ALL collection items...`);
      let accurateMarketStats = null;
      
      try {
        accurateMarketStats = await getCollectionMarketStats(address);
        console.log(`[CollectionPage] ✅ ACCURATE MARKET DATA:`, accurateMarketStats);
      } catch (error) {
        console.error(`[CollectionPage] 🚨 Failed to get accurate market stats:`, error);
        
        // Fallback: Calculate from currently loaded NFTs (with warning)
        console.warn(`[CollectionPage] ⚠️ FALLBACK: Using partial data - this may be inaccurate!`);
        const listedNFTs = nfts.filter(nft => nft.isListed && nft.price && nft.price > 0);
        const fallbackFloorPrice = listedNFTs.length > 0 ? Math.min(...listedNFTs.map(nft => nft.price)) : null;
        
        accurateMarketStats = {
          floorPrice: fallbackFloorPrice,
          listedCount: listedNFTs.length,
          totalSupply: realTotalSupply || nfts.length,
          listingRate: 0,
          averagePrice: null,
          medianPrice: null,
          totalVolume: 0
        };
      }
      
      console.log(`[CollectionPage] 📊 Complete collection stats:`, {
        floorPrice: accurateMarketStats.floorPrice,
        listedCount: accurateMarketStats.listedCount,
        totalSupply: accurateMarketStats.totalSupply,
        listingRate: accurateMarketStats.listingRate,
        volume1d,
        volume7d,
        totalVolume
      });
      
      // Update collection data with ACCURATE stats
      setCollection(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          floorPrice: accurateMarketStats.floorPrice || prev.floorPrice,
          volume24h: volume1d || prev.volume24h,
          volume7d: volume7d || prev.volume7d,
          totalSupply: accurateMarketStats.totalSupply || prev.totalSupply,
          holders: realHoldersCount || prev.holders
        };
      });
      
      // Update total NFTs count for pagination
      if (accurateMarketStats.totalSupply) {
        setTotalNFTs(accurateMarketStats.totalSupply);
      }
      
    } catch (error) {
      console.error('[CollectionPage] Error fetching collection statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Enhanced main data fetching useEffect with proper pagination and search
  useEffect(() => {
    if (!address) {
      setLoading(false);
      setError("Collection address is missing.");
      setNfts([]);
      setCollection(null);
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      
      // Always use @/data/collections.ts for known collections
      const basedCollection = basedCollections.find(c => c.id.toLowerCase() === address.toLowerCase());
      if (basedCollection) {
        // Set initial collection with static metadata but wait for real data from blockchain/API
        const formattedCollection = {
          name: basedCollection.name,
          contract: basedCollection.id,
          logo: basedCollection.logoUrl,
          banner: basedCollection.bannerUrl,
          website: basedCollection.website,
          twitter: basedCollection.twitter,
          telegram: basedCollection.telegram,
          description: `Collection for ${basedCollection.name}`,
          floorPrice: 0, // Will be calculated from listings
          volume24h: 0, // Will be calculated
          totalSupply: 0, // Will be fetched from API/contract
          holders: 0, // Will be fetched from API/contract
          chainId: 32323 // BasedAI chain
        };
        setCollection(formattedCollection);
      }

      try {
        // Load more NFTs initially to support filtering and pagination
        // Load at least 100 NFTs or 5 pages worth, whichever is larger
        const initialLoadSize = Math.max(100, itemsPerPage * 5);
        const result = await fetchRealNFTs(
          address,
          1, // Always start from page 1 for initial load
          initialLoadSize,
          sortBy,
          searchQuery,
          showOnlyListed
        );

        if (isMounted) {
          setNfts(result.nfts);
          setTotalNFTs(result.totalItems);
          setHasMoreNFTs(result.hasMore);
          
          // Extract traits for filtering
          const traits = extractTraitsFromNFTs(result.nfts);
          setAvailableTraits(traits);
          
          console.log(`[LoadData] ✅ Loaded ${result.nfts.length} NFTs with ${Object.keys(traits).length} trait types`);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load collection data:", error);
          setError("Failed to load collection data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [address, currentPage, itemsPerPage, sortBy, searchQuery, showOnlyListed]);

  // Fetch activity when activity tab is selected - removed (now handled by CollectionActivity component)

  // Fetch collection statistics when component mounts
  useEffect(() => {
    if (address && !statsLoading) {
      fetchCollectionStats();
    }
  }, [address]);

  // Apply filters to NFTs
  const filteredNFTs = applyFilters(nfts);
  
  // Pagination logic - improved for better UX
  const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNFTs = filteredNFTs.slice(startIndex, endIndex);
  
  // Show pagination if we have more than one page OR if we're filtering
  const shouldShowPagination = totalPages > 1 || Object.keys(selectedTraits).length > 0 || priceRange.min || priceRange.max;

  // Pagination controls
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    
    // Update URL with page number
    const newUrl = newPage > 1 ? 
      `/collection/${address}?page=${newPage}` : 
      `/collection/${address}`;
    router.push(newUrl);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle NFT interaction (buy/offer)
  const handleNFTInteraction = (nftData: any) => {
    setSelectedNFT(nftData);
    setIsModalOpen(true);
  };

  if (loading) {
    return <CollectionPageSkeleton />;
  }

  if (error) { // Check for error state first
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-theme-text-secondary mb-8">{error}</p>
      </div>
    );
  }

  if (!collection) { // This should ideally be caught by the error state if not found
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
        <p className="text-theme-text-secondary mb-8">
          The collection could not be loaded. It might not exist or there was an issue.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Removed duplicate header and search bar */}

      {/* Collection Information - Enhanced styling for better visibility */}
      <div className="mb-8 pt-8">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl bg-gradient-to-br from-theme-surface/40 via-theme-surface/30 to-theme-surface/20 backdrop-blur-xl border border-theme-border/50 shadow-2xl shadow-theme-primary/10 p-6 md:p-8">
            {/* Collection Logo and Title */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Collection Logo */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-theme-surface/60 to-theme-surface/40 backdrop-blur-sm shadow-lg">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${collection.logo})` }}
                />
              </div>
              
              {/* Collection Details - Main content */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-theme-text-primary drop-shadow-sm">{collection.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    {/* Contract address - improved visibility */}
                    <div 
                      className="flex items-center gap-1 text-sm text-theme-text-primary cursor-pointer group bg-theme-surface/50 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-theme-surface/70 transition-all duration-300"
                      onClick={() => handleCopy(collection.contract)}
                      title={collection.contract}
                    >
                      <span className="font-medium">{shortenAddress(collection.contract, 6)}</span>
                      <Copy size={14} className={`group-hover:text-theme-primary transition-colors ${copied ? "text-theme-primary" : "text-theme-text-secondary"}`} />
                    </div>
                    
                    {/* Social icons - improved styling */}
                    <div className="flex items-center gap-2">
                      {collection.website && (
                        <a 
                          href={collection.website.startsWith('http') ? collection.website : `https://${collection.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-theme-surface/50 backdrop-blur-sm hover:bg-theme-primary hover:text-white transition-all duration-300 shadow-lg text-theme-text-primary"
                          title="Website"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      {collection.twitter && (
                        <a 
                          href={collection.twitter}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-theme-surface/50 backdrop-blur-sm hover:bg-theme-primary hover:text-white transition-all duration-300 shadow-lg text-theme-text-primary"
                          title="Twitter"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                        </a>
                      )}
                      {collection.telegram && (
                        <a 
                          href={collection.telegram.startsWith('http') ? collection.telegram : `https://t.me/${collection.telegram}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-theme-surface/50 backdrop-blur-sm hover:bg-theme-primary hover:text-white transition-all duration-300 shadow-lg text-theme-text-primary"
                          title="Telegram"
                        >
                          <Send size={14} />
                        </a>
                      )}
                      <button 
                        onClick={handlePageLinkCopy}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-theme-surface/50 backdrop-blur-sm hover:bg-theme-primary hover:text-white transition-all duration-300 shadow-lg text-theme-text-primary"
                        title={linkCopied ? "Copied!" : "Share"}
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Collection Description - improved readability */}
                <p className="text-theme-text-secondary mb-4 max-w-2xl leading-relaxed">
                  {collection.description || `Collection of ${collection.name} NFTs on the BasedAI blockchain.`}
                </p>
              </div>
              
              {/* Stats on the right side - improved styling and number formatting */}
              <div className="flex items-center gap-6 text-base md:pl-8 md:border-l md:border-theme-border/30">
                <div className="text-center">
                  <p className="text-xs text-theme-text-secondary uppercase tracking-wide mb-1 font-medium">Floor</p>
                  <p className="font-bold text-theme-text-primary text-lg">
                    {(() => {
                      const listedNFTs = nfts.filter(nft => nft.isListed && nft.price && nft.price > 0);
                      if (listedNFTs.length === 0) {
                        return statsLoading ? '...' : 'No Listings';
                      }
                      const floorPrice = Math.min(...listedNFTs.map(nft => nft.price));
                      return formatPrice(floorPrice);
                    })()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-secondary uppercase tracking-wide mb-1 font-medium">Volume</p>
                  <p className="font-bold text-theme-text-primary text-lg">
                    {statsLoading ? '...' : collectionStats.volume24h ? formatPrice(collectionStats.volume24h) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-secondary uppercase tracking-wide mb-1 font-medium">Supply</p>
                  <p className="font-bold text-theme-text-primary text-lg">
                    {collection?.totalSupply ? formatNumber(collection.totalSupply) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-secondary uppercase tracking-wide mb-1 font-medium">Holders</p>
                  <p className="font-bold text-theme-text-primary text-lg">
                    {collection?.holders ? formatNumber(collection.holders) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Tab Navigation and Controls Row */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Items and Activity tabs - same height as other controls */}
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              currentTab === 'items' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white shadow-lg' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary shadow-lg'
            }`}
            onClick={() => setCurrentTab('items')}
          >
            Items
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              currentTab === 'activity' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white shadow-lg' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary shadow-lg'
            }`}
            onClick={() => setCurrentTab('activity')}
          >
            Activity
          </button>

          {/* Controls (only show for Items tab) */}
          {currentTab === 'items' && (
            <>
              {/* Listed Filter Toggle - same height */}
              <label className="flex items-center gap-2 bg-theme-surface/40 backdrop-blur-sm px-4 py-2 rounded-xl cursor-pointer hover:bg-theme-surface/60 transition-all duration-300 shadow-lg">
                <input 
                  type="checkbox" 
                  checked={showOnlyListed}
                  onChange={(e) => {
                    setShowOnlyListed(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 rounded text-theme-primary focus:ring-theme-primary"
                />
                <span className="text-theme-text-secondary text-sm font-medium">Listed</span>
              </label>

              {/* Search input - same height */}
              <div className="flex items-center bg-theme-surface/40 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-theme-surface/60 transition-all duration-300 shadow-lg">
                <Search size={16} className="text-theme-text-secondary mr-2" />
                <input 
                  type="text" 
                  value={searchInputValue}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search..."
                  className="bg-transparent text-sm text-theme-text-primary focus:outline-none w-32 placeholder-theme-text-secondary/70"
                />
                {searchInputValue && (
                  <button 
                    onClick={clearSearch}
                    className="ml-2 text-theme-text-secondary hover:text-theme-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg ${
                  showFilters || Object.keys(selectedTraits).length > 0 || priceRange.min || priceRange.max
                    ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' 
                    : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'
                }`}
                title="Filters"
              >
                <Filter size={16} />
                <span className="text-sm font-medium">Filters</span>
                {(Object.keys(selectedTraits).length > 0 || priceRange.min || priceRange.max) && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {Object.values(selectedTraits).flat().length + (priceRange.min || priceRange.max ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Sweep functionality - compact and same height */}
              <div className="flex items-center gap-2 bg-theme-surface/40 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-theme-surface/60 transition-all duration-300 shadow-lg">
                <div className="relative w-16">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full transform -translate-y-1/2"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transform -translate-y-1/2 transition-all duration-200"
                    style={{ width: `${((sweepCount - 2) / 8) * 100}%` }}
                  ></div>
                  <input 
                    type="range"
                    min="2"
                    max="10"
                    value={sweepCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setSweepCount(count);
                      
                      if (count > 0) {
                        const priceSortedNfts = [...paginatedNFTs]
                          .filter(nft => nft.price !== null && nft.price > 0)
                          .sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
                        
                        const nftsToHighlight = priceSortedNfts.slice(0, count);
                        setSweepHighlightIds(new Set(nftsToHighlight.map(nft => nft.tokenId)));
                        
                        const estimatedTotal = nftsToHighlight.reduce((sum, nft) => sum + (nft.price || 0), 0);
                        setSweepMaxPrice(estimatedTotal.toFixed(2));
                      } else {
                        setSweepHighlightIds(new Set());
                        setSweepMaxPrice('');
                      }
                    }}
                    className="relative w-full h-4 bg-transparent appearance-none cursor-pointer z-10
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-gradient-to-r 
                      [&::-webkit-slider-thumb]:from-cyan-400 
                      [&::-webkit-slider-thumb]:to-purple-400 
                      [&::-webkit-slider-thumb]:shadow-lg 
                      [&::-webkit-slider-thumb]:shadow-cyan-500/50
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-200"
                    title={`Sweep ${sweepCount} cheapest items`}
                  />
                </div>
                <span className="text-sm text-theme-text-primary w-4 text-center font-medium">{sweepCount}</span>
                <button
                  onClick={() => setShowSweepPriceModal(true)}
                  disabled={sweepCount === 0}
                  className="p-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Execute Sweep"
                >
                  <Zap size={14} />
                </button>
              </div>

              {/* Sorting buttons - same height */}
              <button 
                onClick={() => {
                  setSortBy('price_low_high');
                  setCurrentPage(1);
                }}
                title="Price: Low to High"
                className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${sortBy === 'price_low_high' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'}`}
              >
                <ArrowDownNarrowWide size={16} />
              </button>
              <button 
                onClick={() => {
                  setSortBy('price_high_low');
                  setCurrentPage(1);
                }}
                title="Price: High to Low"
                className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${sortBy === 'price_high_low' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'}`}
              >
                <ArrowUpNarrowWide size={16} />
              </button>
              <button 
                onClick={() => {
                  setSortBy('token_id_asc');
                  setCurrentPage(1);
                }}
                title="ID: Low to High"
                className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${sortBy === 'token_id_asc' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'}`}
              >
                <ArrowDown01 size={16} />
              </button>
              <button 
                onClick={() => {
                  setSortBy('token_id_desc');
                  setCurrentPage(1);
                }}
                title="ID: High to Low"
                className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${sortBy === 'token_id_desc' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'}`}
              >
                <ArrowUp01 size={16} />
              </button>
            </>
          )}

          {/* View mode toggle - moved to far right, same height */}
          <div className="ml-auto flex items-center gap-1">
            <button 
              onClick={() => setViewMode('based')}
              title="Based View (4 per row)"
              className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                viewMode === 'based' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'
              }`}
            >
              <Grid2x2 size={16} />
            </button>
            <button 
              onClick={() => setViewMode('compact')}
              title="Compact View (8 per row)"
              className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                viewMode === 'compact' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'
              }`}
            >
              <Grid3x3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                viewMode === 'list' ? 'bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white' : 'bg-theme-surface/40 backdrop-blur-sm hover:bg-theme-surface/60 text-theme-text-secondary'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && currentTab === 'items' && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-theme-surface/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-theme-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-text-primary">Filters</h3>
              <button 
                onClick={clearAllFilters}
                className="text-sm text-theme-text-secondary hover:text-theme-primary transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-theme-text-primary mb-3">Price Range (𝔹)</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                    className="w-full px-3 py-2 bg-theme-surface/50 border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary/70 focus:outline-none focus:border-theme-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                    className="w-full px-3 py-2 bg-theme-surface/50 border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary/70 focus:outline-none focus:border-theme-primary"
                  />
                </div>
              </div>

              {/* Trait Filters */}
              {Object.keys(availableTraits).map(traitType => (
                <div key={traitType}>
                  <h4 className="text-sm font-medium text-theme-text-primary mb-3 capitalize">
                    {traitType.replace(/_/g, ' ')}
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableTraits[traitType].map(value => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTraits[traitType]?.includes(value) || false}
                          onChange={() => handleTraitFilter(traitType, value)}
                          className="h-4 w-4 rounded text-theme-primary focus:ring-theme-primary"
                        />
                        <span className="text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Filter Summary */}
            {(Object.keys(selectedTraits).length > 0 || priceRange.min || priceRange.max) && (
              <div className="mt-4 pt-4 border-t border-theme-border/50">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedTraits).map(([traitType, values]) =>
                    values.map(value => (
                      <span
                        key={`${traitType}-${value}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-theme-primary/20 text-theme-primary rounded-full text-sm"
                      >
                        {traitType}: {value}
                        <button
                          onClick={() => handleTraitFilter(traitType, value)}
                          className="hover:text-theme-primary/70"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-theme-primary/20 text-theme-primary rounded-full text-sm">
                      Price: {priceRange.min || '0'} - {priceRange.max || '∞'} 𝔹
                      <button
                        onClick={() => setPriceRange({min: '', max: ''})}
                        className="hover:text-theme-primary/70"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content based on selected tab */}
      <div className="px-4 md:px-6 lg:px-8 py-6 pb-24">
        {currentTab === 'items' && (
          <>
            {/* NFT Grid - updated for new view modes */}
            {loading ? (
              // Skeleton loaders for better UX during loading
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(36).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-theme-card-highlight rounded-xl mb-2"></div>
                    <div className="h-4 bg-theme-card-highlight rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-theme-card-highlight rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              viewMode === 'list' ? (
                <div className="bg-theme-surface/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full">
                    <thead className="bg-theme-background/50 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">NFT</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Last Sale</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Owner</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-theme-text-secondary">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedNFTs.map((nft) => (
                        <tr 
                          key={nft.id} 
                          className={`hover:bg-theme-background/30 transition-all duration-300 ${sweepHighlightIds.has(nft.id) ? 'bg-theme-accent/10' : ''}`}>
                          <td className="px-4 py-3">
                            <Link 
                              href={`/nft/${collection.contract}/${nft.tokenId || nft.id}`} 
                              className="flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-theme-surface/50 to-theme-surface/30 backdrop-blur-sm shadow-lg">
                                <div 
                                  className="w-full h-full bg-cover bg-center" 
                                  style={{ 
                                    backgroundImage: `url(${nft.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-theme-text-primary">{`#${nft.tokenId || nft.id}`}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-theme-text-primary">{nft.price ? formatPrice(nft.price) : 'Not Listed'}</td>
                          <td className="px-4 py-3 text-right text-theme-text-secondary">{nft.lastSale ? formatPrice(nft.lastSale) : '-'}</td>
                          <td className="px-4 py-3 text-right">
                            {nft.owner ? (
                              <a 
                                href={`https://explorer.bf1337.org/address/${nft.owner}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-theme-text-secondary hover:text-theme-primary font-mono text-xs transition-colors"
                                title={nft.owner}
                              >
                                {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                              </a>
                            ) : (
                              <span className="text-theme-text-secondary">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="px-3 py-1 bg-gradient-to-r from-theme-primary to-theme-primary/90 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300" onClick={() => handleNFTInteraction(nft)}>
                              {nft.price ? 'Buy' : 'Make Offer'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === 'compact' 
                    ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' // 8 per row on large screens (compact)
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 4 per row on large screens (based)
                }`}>
                  {paginatedNFTs.map((nft) => (
                    <DirectNFTCard 
                      key={nft.id || nft.tokenId} 
                      id={nft.tokenId || nft.id || 0}
                      tokenId={nft.tokenId || nft.id || 0}
                      name={nft.name || `#${nft.tokenId}`}
                      image={nft.image || `https://picsum.photos/seed/${collection.contract}${nft.tokenId}/500/500`}
                      owner={nft.owner || '0x0000000000000000000000000000000000000000'}
                      isListed={!!nft.price}
                      price={nft.price ? String(nft.price) : undefined}
                      seller={nft.seller}
                      collection={{
                        name: collection.name || '',
                        contract: collection.contract || ''
                      }}
                      contractAddress={collection.contract}
                      compact={viewMode === 'compact'}
                      onInteract={handleNFTInteraction}
                    />
                  ))}
                </div>
              )
            )}

            {/* Pagination - improved display logic */}
            {!loading && shouldShowPagination && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-theme-border hover:bg-theme-card-highlight disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    First
                  </button>
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-theme-border hover:bg-theme-card-highlight disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Prev
                  </button>
                  
                  <span className="px-3 py-1 text-theme-text-primary">
                    Page {formatNumber(currentPage)} of {formatNumber(totalPages)} ({formatNumber(filteredNFTs.length)} {filteredNFTs.length !== nfts.length ? 'filtered' : 'total'} NFTs)
                  </span>
                  
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-theme-border hover:bg-theme-card-highlight disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Next
                  </button>
                  <button 
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-theme-border hover:bg-theme-card-highlight disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {currentTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Analytics Cards - improved styling and number formatting */}
            <div className="glass-card bg-gradient-to-br from-theme-surface/40 to-theme-surface/20 backdrop-blur-xl border border-theme-border/50 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-theme-primary/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-theme-primary" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary">Floor Price</h3>
              </div>
              <p className="text-2xl font-bold text-theme-text-primary mb-1">
                {(() => {
                  const listedNFTs = nfts.filter(nft => nft.isListed && nft.price && nft.price > 0);
                  if (listedNFTs.length === 0) {
                    return 'No Listings';
                  }
                  const floorPrice = Math.min(...listedNFTs.map(nft => nft.price));
                  return formatPrice(floorPrice);
                })()}
              </p>
              <p className="text-sm text-theme-text-secondary">Current lowest price</p>
            </div>

            <div className="glass-card bg-gradient-to-br from-theme-surface/40 to-theme-surface/20 backdrop-blur-xl border border-theme-border/50 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Layers size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary">24h Volume</h3>
              </div>
              <p className="text-2xl font-bold text-theme-text-primary mb-1">
                {statsLoading ? '...' : collectionStats.volume24h ? formatPrice(collectionStats.volume24h) : 'N/A'}
              </p>
              <p className="text-sm text-theme-text-secondary">Trading volume last 24h</p>
            </div>

            <div className="glass-card bg-gradient-to-br from-theme-surface/40 to-theme-surface/20 backdrop-blur-xl border border-theme-border/50 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users size={20} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary">Holders</h3>
              </div>
              <p className="text-2xl font-bold text-theme-text-primary mb-1">
                {collection?.holders ? formatNumber(collection.holders) : 'N/A'}
              </p>
              <p className="text-sm text-theme-text-secondary">Unique owners</p>
            </div>

            <div className="glass-card bg-gradient-to-br from-theme-surface/40 to-theme-surface/20 backdrop-blur-xl border border-theme-border/50 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Tag size={20} className="text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary">Total Supply</h3>
              </div>
              <p className="text-2xl font-bold text-theme-text-primary mb-1">
                {collection?.totalSupply ? formatNumber(collection.totalSupply) : 'N/A'}
              </p>
              <p className="text-sm text-theme-text-secondary">Total NFTs in collection</p>
            </div>
          </div>
        )}

        {currentTab === 'activity' && (
          <div className="space-y-4">
            {/* Activity Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-theme-text-primary">Recent Activity</h2>
              <p className="text-sm text-theme-text-secondary">
                Real-time blockchain transactions for this collection
              </p>
            </div>

            {/* Use our new CollectionActivity component */}
            <CollectionActivity 
              collectionAddress={address}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Sweep Price Modal */}
      {showSweepPriceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-theme-background border border-theme-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">Set Max Price for Sweep</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-theme-text-secondary mb-2 block">Maximum price per NFT</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter max price in BASED"
                  value={sweepMaxPrice}
                  onChange={(e) => setSweepMaxPrice(e.target.value)}
                  className="w-full p-3 bg-theme-surface border border-theme-border rounded-xl text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
                <p className="text-sm text-theme-text-secondary mt-2">
                  Total items selected: {sweepCount}
                </p>
              </div>
              <p className="text-sm text-theme-text-secondary">
                Total estimated cost: 𝔹{sweepCount && sweepMaxPrice ? (sweepCount * parseFloat(sweepMaxPrice)).toFixed(2) : '0.00'}
              </p>
              
              {/* Selected NFTs Preview */}
              <div className="max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-theme-text-primary mb-2">Selected NFTs:</p>
                <div className="space-y-1">
                  {Array.from(sweepHighlightIds).slice(0, 5).map((nftId) => {
                    const nft = nfts.find(n => n.id === nftId);
                    if (!nft) return null;
                    return (
                      <div key={nftId} className="flex justify-between text-sm text-theme-text-secondary py-1">
                        <span>#{nft.tokenId || nft.id}</span>
                        <span>{nft.price ? formatPrice(nft.price) : 'N/A'}</span>
                      </div>
                    );
                  })}
                  {sweepHighlightIds.size > 5 && (
                    <p className="text-xs text-theme-text-secondary">... and {sweepHighlightIds.size - 5} more</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSweepPriceModal(false);
                    setSweepHighlightIds(new Set());
                    setSweepCount(0);
                    setSweepMaxPrice('');
                  }}
                  className="flex-1 px-4 py-2 bg-theme-surface border border-theme-border text-theme-text-primary rounded-xl hover:bg-theme-surface-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (sweepMaxPrice && sweepCount > 0) {
                      // TODO: Implement sweep functionality
                      console.log('Sweep:', { count: sweepCount, maxPrice: sweepMaxPrice, nfts: Array.from(sweepHighlightIds) });
                      setShowSweepPriceModal(false);
                      setSweepHighlightIds(new Set());
                      setSweepCount(0);
                      setSweepMaxPrice('');
                      toast.success(`Sweep initiated for ${sweepCount} NFTs!`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-theme-primary text-black rounded-xl hover:bg-theme-primary/90 transition-colors disabled:opacity-50"
                  disabled={!sweepMaxPrice || sweepCount === 0}
                >
                  Sweep ({sweepCount} NFTs)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NFT Interaction Modal */}
      <NFTInteractionModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNFT(null);
        }}
      />
    </div>
  );
}

export default CollectionPage;