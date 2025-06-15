"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Flame, Sparkles, TrendingUp, Clock, Star, ArrowRight, Award, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import ViewModeToggle from '@/components/ViewModeToggle';
import NftCard from '@/components/NftCard';
import TrendingNftCard from '@/components/TrendingNftCard';
import MarketplaceStats from '@/components/MarketplaceStats';
import RecentActivity from '@/components/RecentActivity';
import TopCollections from '@/components/TopCollections';
import { basedCollections } from '@/data/collections';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { getHomepageData, HomepageData } from '@/lib/services/homepageService';

// Dynamically import CollectionCard with SSR turned off
const CollectionCard = dynamic(() => import('@/components/CollectionCard'), {
  ssr: false,
});

// Import all collections from our previous setup
const collections = [
  {
    name: "FancyFrogFamily",
    contract: "0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81",
    logo: "https://www.fancyfrogfamily.com/images/logo/000_logo.png",
    banner: "",
    website: "https://www.fancyfrogfamily.com/",
    twitter: "https://x.com/IT4Station",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Based Pepe",
    contract: "0xd819b90f7a7f8e85639671d2951285573bbf8771",
    logo: "https://pbs.twimg.com/profile_images/1904884065343258624/Vba939p0_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1884239993247240192/1738075616/1500x500",
    website: "",
    twitter: "https://x.com/basedpepenft",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Gang Game Evolution",
    contract: "0xae6a76d106fd5f799a2501e1d563852da88c3db5",
    logo: "https://pbs.twimg.com/profile_images/1910058281579528192/YYuJqVlF_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1906940747347070976/1743485575/1500x500",
    website: "gangamevolutionbased.online",
    twitter: "https://x.com/GanGamEvolution",
    telegram: "https://t.co/DOIPPEYBNF",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "LifeNodes",
    contract: "0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21",
    logo: "https://pbs.twimg.com/profile_images/1912414230336180224/Q_K-eZn__400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1890893149934858241/1745573721/1500x500",
    website: "https://basedai.art/",
    twitter: "https://x.com/BasedLifeNodes",
    telegram: "https://t.me/lifenodes",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "KEKTECH",
    contract: "0x40b6184b901334c0a88f528c1a0a1de7a77490f1",
    logo: "https://pbs.twimg.com/profile_images/1907886210724364288/xNKmFj9s_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1907383327092359168/1743710496/1500x500",
    website: "https://www.kektech.xyz/",
    twitter: "https://x.com/KektechNFT",
    telegram: "https://t.me/KEKTECH",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Test Taco",
    contract: "0xa8a1087c73e9d6980b42df91149f96b99f75970e",
    logo: "https://3oh.myfilebase.com/ipfs/QmSK8KA8UbDYWBA5qA6BhabC6xwoc61VtyhrFmeoQ3b5QW.png",
    banner: "https://www.nachonft.xyz/headers/test-tacos.png",
    website: "nachonft.xyz",
    twitter: "https://x.com/nachonft_xyz",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "BasedBeasts",
    contract: "0xd4b1516eea9ccd966629c2972dab8683069ed7bc",
    logo: "https://ipfs.io/ipfs/QmZH1A4CWbqh9b1ueCUibUYZawDPy4GRkxXqKpujwvW7PM",
    banner: "https://pbs.twimg.com/profile_banners/1743117866184929280/1742407630/1500x500",
    website: "https://www.basedbeasts.xyz/",
    twitter: "https://x.com/TheDiscoFrog",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "PepperCorn Genesis",
    contract: "0xa0c2262735c1872493c92ec39aff0d9b6894d8fd",
    logo: "https://pbs.twimg.com/profile_images/1912790640988946433/93LxnMNB_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908148796162445312/1744906164/1500x500",
    website: "",
    twitter: "https://x.com/PepperCorn15953",
    telegram: "https://t.me/peppercornisgudcoin",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Dank Pepes",
    contract: "0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d",
    logo: "https://pbs.twimg.com/profile_images/1904732858323009536/TIWjPpin_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1900002904377102336/1745118780/1500x500",
    website: "dankpepes.io",
    twitter: "https://x.com/dank_pepes",
    telegram: "The Dank Lounge",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "PixelPepes",
    contract: "0x22af27d00c53c0fba14446958864db7e3fe0852c",
    logo: "https://pbs.twimg.com/profile_images/1915049463825018881/2RLzSbBj_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1914470955058954240/1745335435/1500x500",
    website: "",
    twitter: "https://x.com/pxlpepes",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Peps",
    contract: "0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f",
    logo: "https://pbs.twimg.com/profile_images/1903806957292810240/ur3Xm_Ax_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1355098383774605313/1742737936/1500x500",
    website: "",
    twitter: "https://x.com/RealPeposhi",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "KEKISTANIOS",
    contract: "0x2f3df3922990e63a239d712964795efd9a150dd1",
    logo: "https://pbs.twimg.com/profile_images/1896681606078750720/UiiHVSXO_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1896680553086115840/1741045445/1500x500",
    website: "",
    twitter: "https://x.com/kekistanio62517",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "CosmicPond",
    contract: "0xd36199215717f858809b0e62441c1f81adbf3d2c",
    logo: "https://pbs.twimg.com/profile_images/1898913093465337856/p-bGc3Mq_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1898909967027146752/1741571137/1500x500",
    website: "https://cosmicpond.net/",
    twitter: "https://x.com/CosmicPondNFT",
    telegram: "https://t.me/CosmicPond",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "The Based Man Collection",
    contract: "0x853efb327ea5d8766265b78c5b9092e2a85a8f70",
    logo: "https://pbs.twimg.com/media/GmeQSf5WoAAwvUo?format=jpg&name=large",
    banner: "https://pbs.twimg.com/media/Gn2D7tfXIAALZwW?format=png&name=large",
    website: "",
    twitter: "https://x.com/carpetfrawg",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Pepe Rocks",
    contract: "0x44dF92D10E91fa4D7E9eAd9fF6A6224c88ae5152",
    logo: "https://pbs.twimg.com/profile_images/1910144664059166720/6A7cs9EQ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1910144452397821952/1744249064/1500x500",
    website: "",
    twitter: "https://x.com/RocksPepe",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Based Whales",
    contract: "0xd480f4a34a1740a5b6fd2da0d3c6cc6a432b56f2",
    logo: "https://pbs.twimg.com/profile_images/1904857423279775746/4t3KvYGx_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1904857193629048834/1742988775/1500x500",
    website: "basedsea.xyz",
    twitter: "https://x.com/basedsea_xyz",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Lil Coalies",
    contract: "0x36003438a167d13043028d794290dda93fea1236",
    logo: "https://pbs.twimg.com/profile_images/1915215931095265280/fckrzPoY_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908363293020110848/1745458441/1500x500",
    website: "https://lilcoalies.com/",
    twitter: "https://x.com/LilCoalies",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "DEMWORLD",
    contract: "0xaf024210fdb085fc73b3f1ca1d7d722574f0133b",
    logo: "https://pbs.twimg.com/profile_images/1897011933347201024/_kV-yNOJ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1897009617369989120/1741676552/1500x500",
    website: "",
    twitter: "https://x.com/THEDEMWORLD",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  }
];

const allCollections = [
  // ...collections, // This was spreading the old small list, will be replaced
  // More collections from your collinfo.md
  {
    name: "FancyFrogFamily",
    contract: "0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81",
    logo: "https://www.fancyfrogfamily.com/images/logo/000_logo.png",
    banner: "",
    website: "https://www.fancyfrogfamily.com/",
    twitter: "https://x.com/IT4Station",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Based Pepe",
    contract: "0xd819b90f7a7f8e85639671d2951285573bbf8771",
    logo: "https://pbs.twimg.com/profile_images/1904884065343258624/Vba939p0_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1884239993247240192/1738075616/1500x500",
    website: "",
    twitter: "https://x.com/basedpepenft",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Gang Game Evolution",
    contract: "0xae6a76d106fd5f799a2501e1d563852da88c3db5",
    logo: "https://pbs.twimg.com/profile_images/1910058281579528192/YYuJqVlF_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1906940747347070976/1743485575/1500x500",
    website: "gangamevolutionbased.online",
    twitter: "https://x.com/GanGamEvolution",
    telegram: "https://t.co/DOIPPEYBNF",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "LifeNodes",
    contract: "0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21",
    logo: "https://pbs.twimg.com/profile_images/1912414230336180224/Q_K-eZn__400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1890893149934858241/1745573721/1500x500",
    website: "https://basedai.art/",
    twitter: "https://x.com/BasedLifeNodes",
    telegram: "https://t.me/lifenodes",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "KEKTECH",
    contract: "0x40b6184b901334c0a88f528c1a0a1de7a77490f1",
    logo: "https://pbs.twimg.com/profile_images/1907886210724364288/xNKmFj9s_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1907383327092359168/1743710496/1500x500",
    website: "https://www.kektech.xyz/",
    twitter: "https://x.com/KektechNFT",
    telegram: "https://t.me/KEKTECH",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Test Taco",
    contract: "0xa8a1087c73e9d6980b42df91149f96b99f75970e",
    logo: "https://3oh.myfilebase.com/ipfs/QmSK8KA8UbDYWBA5qA6BhabC6xwoc61VtyhrFmeoQ3b5QW.png",
    banner: "https://www.nachonft.xyz/headers/test-tacos.png",
    website: "nachonft.xyz",
    twitter: "https://x.com/nachonft_xyz",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "BasedBeasts",
    contract: "0xd4b1516eea9ccd966629c2972dab8683069ed7bc",
    logo: "https://ipfs.io/ipfs/QmZH1A4CWbqh9b1ueCUibUYZawDPy4GRkxXqKpujwvW7PM",
    banner: "https://pbs.twimg.com/profile_banners/1743117866184929280/1742407630/1500x500",
    website: "https://www.basedbeasts.xyz/",
    twitter: "https://x.com/TheDiscoFrog",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "PepperCorn Genesis",
    contract: "0xa0c2262735c1872493c92ec39aff0d9b6894d8fd",
    logo: "https://pbs.twimg.com/profile_images/1912790640988946433/93LxnMNB_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908148796162445312/1744906164/1500x500",
    website: "",
    twitter: "https://x.com/PepperCorn15953",
    telegram: "https://t.me/peppercornisgudcoin",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Dank Pepes",
    contract: "0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d",
    logo: "https://pbs.twimg.com/profile_images/1904732858323009536/TIWjPpin_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1900002904377102336/1745118780/1500x500",
    website: "dankpepes.io",
    twitter: "https://x.com/dank_pepes",
    telegram: "The Dank Lounge",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "PixelPepes",
    contract: "0x22af27d00c53c0fba14446958864db7e3fe0852c",
    logo: "https://pbs.twimg.com/profile_images/1915049463825018881/2RLzSbBj_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1914470955058954240/1745335435/1500x500",
    website: "",
    twitter: "https://x.com/pxlpepes",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Peps",
    contract: "0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f",
    logo: "https://pbs.twimg.com/profile_images/1903806957292810240/ur3Xm_Ax_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1355098383774605313/1742737936/1500x500",
    website: "",
    twitter: "https://x.com/RealPeposhi",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "KEKISTANIOS",
    contract: "0x2f3df3922990e63a239d712964795efd9a150dd1",
    logo: "https://pbs.twimg.com/profile_images/1896681606078750720/UiiHVSXO_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1896680553086115840/1741045445/1500x500",
    website: "",
    twitter: "https://x.com/kekistanio62517",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "CosmicPond",
    contract: "0xd36199215717f858809b0e62441c1f81adbf3d2c",
    logo: "https://pbs.twimg.com/profile_images/1898913093465337856/p-bGc3Mq_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1898909967027146752/1741571137/1500x500",
    website: "https://cosmicpond.net/",
    twitter: "https://x.com/CosmicPondNFT",
    telegram: "https://t.me/CosmicPond",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "The Based Man Collection",
    contract: "0x853efb327ea5d8766265b78c5b9092e2a85a8f70",
    logo: "https://pbs.twimg.com/media/GmeQSf5WoAAwvUo?format=jpg&name=large",
    banner: "https://pbs.twimg.com/media/Gn2D7tfXIAALZwW?format=png&name=large",
    website: "",
    twitter: "https://x.com/carpetfrawg",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Pepe Rocks",
    contract: "0x44dF92D10E91fa4D7E9eAd9fF6A6224c88ae5152",
    logo: "https://pbs.twimg.com/profile_images/1910144664059166720/6A7cs9EQ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1910144452397821952/1744249064/1500x500",
    website: "",
    twitter: "https://x.com/RocksPepe",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Based Whales",
    contract: "0xd480f4a34a1740a5b6fd2da0d3c6cc6a432b56f2",
    logo: "https://pbs.twimg.com/profile_images/1904857423279775746/4t3KvYGx_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1904857193629048834/1742988775/1500x500",
    website: "basedsea.xyz",
    twitter: "https://x.com/basedsea_xyz",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "Lil Coalies",
    contract: "0x36003438a167d13043028d794290dda93fea1236",
    logo: "https://pbs.twimg.com/profile_images/1915215931095265280/fckrzPoY_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1908363293020110848/1745458441/1500x500",
    website: "https://lilcoalies.com/",
    twitter: "https://x.com/LilCoalies",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  },
  {
    name: "DEMWORLD",
    contract: "0xaf024210fdb085fc73b3f1ca1d7d722574f0133b",
    logo: "https://pbs.twimg.com/profile_images/1897011933347201024/_kV-yNOJ_400x400.jpg",
    banner: "https://pbs.twimg.com/profile_banners/1897009617369989120/1741676552/1500x500",
    website: "",
    twitter: "https://x.com/THEDEMWORLD",
    telegram: "",
    floorPrice: undefined,
    volume24h: undefined,
    items: undefined
  }
];

export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'collector' | 'trader' | 'compact'>('collector');
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'popular'>('trending');
  const [loading, setLoading] = useState(true);
  const [trendingNFTs, setTrendingNFTs] = useState<any[]>([]);
  const [trendingCollections, setTrendingCollections] = useState<any[]>([]);
  
  // Homepage data state
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [homepageLoading, setHomepageLoading] = useState(true);
  
  // Fetch homepage data
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        setHomepageLoading(true);
        const data = await getHomepageData();
        setHomepageData(data);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setHomepageLoading(false);
      }
    };
    
    loadHomepageData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadHomepageData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Generate trending collections - fetch real data where possible
      const trending = [...basedCollections].sort(() => 0.5 - Math.random()).slice(0, 8);
      
      // Try to fetch real totalSupply for each collection
      const updatedTrending = [...trending];
      try {
        for (let i = 0; i < updatedTrending.length; i++) {
          const collection = updatedTrending[i];
          try {
            // Create provider and contract
            const provider = new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/');
            
            // Test if the provider is working before creating the contract
            try {
              await provider.getBlockNumber();
            } catch (providerError) {
              console.warn(`Provider not responding for ${collection.name}, skipping totalSupply fetch`);
              continue; // Skip this collection if provider isn't working
            }
            
            // Create a minimal interface instead of just the function name
            const minimalABI = [
              {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
              }
            ];
            
            const contract = new ethers.Contract(
              collection.id,
              minimalABI,
              provider
            );
            
            // Wrap totalSupply in a Promise.race with a timeout
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout fetching totalSupply')), 5000)
            );
            
            // Get totalSupply with timeout
            const totalSupply = await Promise.race([
              contract.totalSupply(),
              timeoutPromise
            ]);
            
            // @ts-ignore - add items property to collection
            collection.items = Number(totalSupply);
          } catch (error) {
            console.error(`Error fetching data for ${collection.name}:`, error);
            // Keep default items value or set a fallback
            if (!collection.items) {
              // @ts-ignore
              collection.items = 1000; // Fallback count
            }
          }
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
      }
      
      setTrendingCollections(updatedTrending);
      
      // Generate trending NFTs
      setTrendingNFTs(generateTrendingNFTs());
      
      setLoading(false);
    };
    
    loadData();
  }, [activeTab]);

  const getSortedCollections = () => {
    // This now uses the state collections rather than generating them on the fly
    if (activeTab === 'new') {
      return [...basedCollections].sort(() => 0.5 - Math.random()).slice(0, 12);
    } else if (activeTab === 'popular') {
      return [...basedCollections].sort(() => 0.5 - Math.random()).slice(0, 8);
    } else { // 'trending' or default
      return trendingCollections;
    }
  };

  const generateTrendingNFTs = () => {
    const nfts = [];
    for (let i = 0; i < 6; i++) {
      const collectionIndex = i % basedCollections.length;
      const collection = basedCollections[collectionIndex];
      nfts.push({
        id: i + 1,
        name: `${collection.name} #${Math.floor(Math.random() * 1000) + 1}`,
        collection: collection,
        image: `https://picsum.photos/seed/${collection.id}${i}/500/500`,
        price: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
        lastSale: parseFloat((Math.random() * 1 + 0.1).toFixed(2)),
        tokenId: Math.floor(Math.random() * 1000) + 1,
        rarity: Math.floor(Math.random() * 100) + 1,
      });
    }
    return nfts;
  };

  return (
    <>
      <div className="container mx-auto py-3 md:py-6">
        {/* Marketplace Statistics */}
        <section className="mb-8">
          <MarketplaceStats 
            stats={homepageData?.stats || {
              totalListings: 0,
              totalSales: 0,
              totalOffers: 0,
              activeListings: 0,
              activeOffers: 0,
              volume24h: '0',
              volume24hInEth: 0,
              salesCount24h: 0,
              averageSalePrice: '0',
              averageSalePriceInEth: 0
            }} 
            loading={homepageLoading} 
          />
        </section>

        {/* Recent Activity and Top Collections */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity 
              activities={homepageData?.recentActivity || []} 
              loading={homepageLoading} 
            />
            <TopCollections 
              collections={homepageData?.topCollections || []} 
              loading={homepageLoading} 
            />
          </div>
        </section>

        {/* Trending NFTs Section */}
        <section className="mb-12 pt-4">
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-theme-primary" />
                  <h2 className="text-2xl font-bold text-theme-text-primary">Trending NFTs</h2>
                </div>
                <p className="text-theme-text-secondary">Hot NFTs that are gaining traction</p>
              </div>
              <Link href="/trending" className="flex items-center gap-1 text-theme-primary hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-theme-card-highlight rounded-xl mb-2"></div>
                    <div className="h-4 bg-theme-card-highlight rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-theme-card-highlight rounded w-1/2"></div>
                  </div>
                ))
              ) : (
                trendingNFTs.map((nft) => (
                  <TrendingNftCard key={nft.id} nft={nft} />
                ))
              )}
            </div>
          </div>
        </section>
      
        {/* Collections Section with Tabs */}
        <section className="py-6 mb-12">
          <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div className="flex border-b border-theme-border">
                <button 
                  className={`px-6 py-3 font-medium text-lg relative ${activeTab === 'trending' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
                  onClick={() => setActiveTab('trending')}
                >
                  Trending
                  {activeTab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
                </button>
                <button 
                  className={`px-6 py-3 font-medium text-lg relative ${activeTab === 'new' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
                  onClick={() => setActiveTab('new')}
                >
                  New
                  {activeTab === 'new' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
                </button>
                <button 
                  className={`px-6 py-3 font-medium text-lg relative ${activeTab === 'popular' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
                  onClick={() => setActiveTab('popular')}
                >
                  Popular
                  {activeTab === 'popular' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
                </button>
              </div>
            </div>
          
            {viewMode === 'collector' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="glass-card flex flex-col rounded-2xl overflow-hidden shadow-lg h-full animate-pulse">
                      <div className="w-full h-36 bg-theme-card-highlight"></div>
                      <div className="flex flex-col items-center p-5 pt-12 relative">
                        <div className="absolute -top-10 w-20 h-20 rounded-xl bg-theme-surface"></div>
                        <div className="w-full mt-2 flex flex-col items-center">
                          <div className="h-6 w-32 bg-theme-card-highlight rounded-md mb-2"></div>
                          <div className="h-4 w-24 bg-theme-card-highlight rounded-md mb-4"></div>
                          <div className="grid grid-cols-3 gap-2 w-full mb-3">
                            <div className="h-12 bg-theme-card-highlight rounded-lg"></div>
                            <div className="h-12 bg-theme-card-highlight rounded-lg"></div>
                            <div className="h-12 bg-theme-card-highlight rounded-lg"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  getSortedCollections().slice(0, 8).map((collection) => (
                    <CollectionCard key={collection.id} {...collection} />
                  ))
                )}
              </div>
            ) : (
              <div className="bg-theme-surface border border-theme-border rounded-lg overflow-hidden">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-theme-card-highlight w-full"></div>
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="h-16 border-b border-theme-border flex items-center px-4">
                        <div className="w-8 h-8 bg-theme-card-highlight rounded-full mr-3"></div>
                        <div className="flex-grow">
                          <div className="h-4 bg-theme-card-highlight rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-theme-card-highlight rounded w-1/6"></div>
                        </div>
                        <div className="h-4 bg-theme-card-highlight rounded w-16 mx-4"></div>
                        <div className="h-4 bg-theme-card-highlight rounded w-16 mx-4"></div>
                        <div className="h-4 bg-theme-card-highlight rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-theme-background">
                      <tr className="border-b border-theme-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Collection</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Floor</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Volume</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedCollections().slice(0, 10).map((collection, index) => (
                        <tr key={collection.id} className="border-b border-theme-border hover:bg-theme-background/50 transition-colors">
                          <td className="px-4 py-3 text-theme-text-secondary">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link href={`/collection/${collection.id}`} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border border-theme-border overflow-hidden bg-theme-card-highlight">
                                {collection.logoUrl && (
                                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${collection.logoUrl})` }} />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-theme-text-primary">{collection.name}</div>
                                <div className="text-xs text-theme-text-secondary">{`${collection.id.substring(0, 6)}...${collection.id.substring(collection.id.length - 4)}`}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-theme-text-primary">
                            {collection.floorPrice ? `${collection.floorPrice} BASED` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right text-theme-text-primary">
                            {collection.volume24h ? `${collection.volume24h} BASED` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right text-theme-text-primary">{collection.items || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-center mt-8">
            <Link 
              href="/collection" 
              className="px-6 py-3 border border-theme-primary text-theme-primary rounded-lg hover:bg-theme-primary/10 transition-colors"
            >
              View All Collections
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
