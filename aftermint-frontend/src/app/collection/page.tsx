"use client";

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, TrendingUp, Calendar, Users } from 'lucide-react';
import CollectionCard from '@/components/CollectionCard';
import { ethers } from 'ethers';
import { getBasedAIProvider } from '@/lib/services/nftService';
import { marketplaceABI } from '@/lib/abi/marketplaceABI';
import { MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/constants/contracts';

// Import all collections data (same as in home page)
const allCollections = [
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
    floorPrice: 0.75,
    volume24h: 12.5,
    items: 777,
    owners: 350
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

// Sort types
type SortOption = 'volume' | 'floor' | 'newest' | 'oldest' | 'items';

// Function to fetch real floor price for a collection
const fetchCollectionFloorPrice = async (collectionAddress: string): Promise<number | null> => {
  try {
    const provider = getBasedAIProvider();
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceABI,
      provider
    );

    // Get contract to check total supply
    const nftContract = new ethers.Contract(
      collectionAddress,
      ["function totalSupply() view returns (uint256)"],
      provider
    );

    let totalSupply = 1000; // Default fallback
    try {
      const supply = await nftContract.totalSupply();
      totalSupply = Math.min(parseInt(supply.toString()), 500); // Limit to 500 to avoid spam
    } catch (e) {
      // Use fallback
    }

    let lowestPrice = null;
    
    // Check ALL tokens for listings to find accurate floor price
    const maxTokensToCheck = totalSupply; // CHECK ALL TOKENS - removed artificial limit
    const batchSize = 50;
    
    for (let i = 1; i <= maxTokensToCheck; i += batchSize) {
      const endToken = Math.min(i + batchSize - 1, maxTokensToCheck);
      const promises = [];
      
      for (let tokenId = i; tokenId <= endToken; tokenId++) {
        promises.push(
          marketplaceContract.getListing(collectionAddress, tokenId)
            .then((listing: any) => {
              if (listing && listing.seller !== '0x0000000000000000000000000000000000000000') {
                const priceInEther = parseFloat(ethers.formatEther(listing.price));
                return priceInEther;
              }
              return null;
            })
            .catch(() => null)
        );
      }
      
      const results = await Promise.all(promises);
      const validPrices = results.filter((price): price is number => price !== null && price > 0);
      
      if (validPrices.length > 0) {
        const batchMin = Math.min(...validPrices);
        if (lowestPrice === null || batchMin < lowestPrice) {
          lowestPrice = batchMin;
        }
      }
      
      // Small delay to avoid overwhelming RPC
      if (i + batchSize <= maxTokensToCheck) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return lowestPrice;
  } catch (error) {
    console.warn(`Failed to fetch floor price for ${collectionAddress}:`, error);
    return null;
  }
};

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState(allCollections);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for real floor prices - now lazy loaded
  const [collectionFloorPrices, setCollectionFloorPrices] = useState<{[key: string]: number | null}>({});
  const [floorPricesLoading, setFloorPricesLoading] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  
  // Cache for additional hover data
  const [collectionHoverData, setCollectionHoverData] = useState<{[key: string]: {
    recentSales: number;
    activeListings: number;
    volume24h: number;
    lastActivity?: Date;
  }}>({});

  // Lazy load floor price for a specific collection
  const loadFloorPrice = async (collectionAddress: string) => {
    if (collectionFloorPrices[collectionAddress] !== undefined) {
      return; // Already loaded or loading
    }

    // Set loading state
    setCollectionFloorPrices(prev => ({ ...prev, [collectionAddress]: null }));

    try {
      const floorPrice = await fetchCollectionFloorPrice(collectionAddress);
      setCollectionFloorPrices(prev => ({ ...prev, [collectionAddress]: floorPrice }));
    } catch (error) {
      console.warn(`Failed to fetch floor price for ${collectionAddress}:`, error);
      setCollectionFloorPrices(prev => ({ ...prev, [collectionAddress]: 0 }));
    }
  };

  // Load additional hover data from storage contract
  const loadHoverData = async (collectionAddress: string) => {
    if (collectionHoverData[collectionAddress]) {
      return; // Already loaded
    }

    try {
      // Import storage service functions dynamically to avoid loading issues
      const { getRecentActivity, getMarketplaceStats } = await import('@/lib/services/storageService');
      
      // Get recent activity for this collection
      const recentActivity = await getRecentActivity(50);
      const collectionActivity = recentActivity.filter(
        activity => activity.nftContract.toLowerCase() === collectionAddress.toLowerCase()
      );

      // Calculate stats
      const recentSales = collectionActivity.filter(a => a.type === 'sale').length;
      const activeListings = collectionActivity.filter(a => a.type === 'listing').length;
      const volume24h = collectionActivity
        .filter(a => a.type === 'sale' && a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .reduce((sum, a) => sum + a.priceInEth, 0);
      
      const lastActivity = collectionActivity.length > 0 
        ? new Date(Math.max(...collectionActivity.map(a => a.timestamp.getTime())))
        : undefined;

      setCollectionHoverData(prev => ({
        ...prev,
        [collectionAddress]: {
          recentSales,
          activeListings,
          volume24h,
          lastActivity
        }
      }));
    } catch (error) {
      console.warn(`Failed to fetch hover data for ${collectionAddress}:`, error);
    }
  };

  // Handle collection hover
  const handleCollectionHover = (collectionAddress: string) => {
    setHoveredCollection(collectionAddress);
    loadFloorPrice(collectionAddress);
    loadHoverData(collectionAddress);
  };

  // Enhanced filtering and sorting with real floor prices
  useEffect(() => {
    let filtered = allCollections.filter(collection =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply sorting with real floor price data
    filtered.sort((a, b) => {
      const aFloor = collectionFloorPrices[a.contract] ?? a.floorPrice ?? 0;
      const bFloor = collectionFloorPrices[b.contract] ?? b.floorPrice ?? 0;

    switch (sortBy) {
      case 'volume':
          return (b.volume24h || 0) - (a.volume24h || 0);
      case 'floor':
          // Sort by real floor prices, with null values at the end
          if (aFloor === 0 && bFloor === 0) return 0;
          if (aFloor === 0) return 1;
          if (bFloor === 0) return -1;
          return aFloor - bFloor;
      case 'items':
          return (b.items || 0) - (a.items || 0);
      default:
          return 0;
      }
    });

    setFilteredCollections(filtered);
  }, [searchQuery, sortBy, collectionFloorPrices]);
  
  return (
    <div className="container mx-auto px-4 py-8">   
      {/* Search and filter controls */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search collections"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-theme-border bg-theme-surface"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-theme-border bg-theme-surface hover:bg-theme-card-highlight"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} className="text-theme-text-secondary" />
                <span className="text-theme-text-primary text-sm">Sort by:</span>
                <span className="text-theme-primary text-sm font-medium capitalize">
                  {sortBy === 'volume' ? 'Volume' : 
                   sortBy === 'floor' ? 'Floor' : 
                   sortBy === 'newest' ? 'Newest' : 
                   sortBy === 'oldest' ? 'Oldest' : 'Items'}
                </span>
                {showFilters ? 
                  <ChevronUp size={16} className="text-theme-text-secondary" /> : 
                  <ChevronDown size={16} className="text-theme-text-secondary" />
                }
              </button>
              
              {showFilters && (
                <div className="absolute top-full left-0 mt-1 w-48 p-2 rounded-lg border border-theme-border bg-theme-surface shadow-lg z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-theme-text-secondary">Sort By</span>
                      <span className="text-xs text-theme-text-secondary">Click to sort</span>
                    </div>
                  <div className="space-y-1">
                    <button 
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-theme-card-highlight ${sortBy === 'volume' ? 'bg-theme-card-highlight text-theme-primary' : 'text-theme-text-primary'}`}
                      onClick={() => {
                        setSortBy('volume');
                        setShowFilters(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} /> Volume
                      </div>
                    </button>
                    <button 
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-theme-card-highlight ${sortBy === 'floor' ? 'bg-theme-card-highlight text-theme-primary' : 'text-theme-text-primary'}`}
                      onClick={() => {
                        setSortBy('floor');
                        setShowFilters(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} /> Floor
                      </div>
                    </button>
                    <button 
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-theme-card-highlight ${sortBy === 'items' ? 'bg-theme-card-highlight text-theme-primary' : 'text-theme-text-primary'}`}
                      onClick={() => {
                        setSortBy('items');
                        setShowFilters(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={14} /> Items
                      </div>
                    </button>
                    </div>
                    
                    <div className="text-center py-2">
                      <div className="text-xs text-theme-text-secondary">
                        Hover over collections to load real-time data
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-theme-border hover:bg-theme-card-highlight transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        
        {/* Advanced filters panel */}
        {showFilters && (
          <div className="glass-card p-4 rounded-xl border border-theme-border mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">Floor Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-surface"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-surface"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">Categories</label>
                <select className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-surface">
                  <option value="all">All Categories</option>
                  <option value="art">Art</option>
                  <option value="pfp">Profile Pictures</option>
                  <option value="gaming">Gaming</option>
                  <option value="memes">Memes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">Status</label>
                <select className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-surface">
                  <option value="all">All Collections</option>
                  <option value="verified">Verified Only</option>
                  <option value="new">New Arrivals</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3 rounded-lg border border-theme-border">
            <div className="flex items-center gap-2 text-theme-text-secondary mb-1">
              <TrendingUp size={14} />
              <span className="text-sm">Total Volume</span>
            </div>
            <div className="text-lg font-bold text-theme-text-primary">42,500 BASED</div>
          </div>
          <div className="glass-card p-3 rounded-lg border border-theme-border">
            <div className="flex items-center gap-2 text-theme-text-secondary mb-1">
              <Calendar size={14} />
              <span className="text-sm">24h Volume</span>
            </div>
            <div className="text-lg font-bold text-theme-text-primary">1,280 BASED</div>
          </div>
          <div className="glass-card p-3 rounded-lg border border-theme-border">
            <div className="flex items-center gap-2 text-theme-text-secondary mb-1">
              <Users size={14} />
              <span className="text-sm">Total Users</span>
            </div>
            <div className="text-lg font-bold text-theme-text-primary">3,850</div>
          </div>
          <div className="glass-card p-3 rounded-lg border border-theme-border">
            <div className="flex items-center gap-2 text-theme-text-secondary mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span className="text-sm">Total Collections</span>
            </div>
            <div className="text-lg font-bold text-theme-text-primary">{allCollections.length}</div>
          </div>
        </div>
      </div>
      
      {/* Collections grid */}
      <div>
        {filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-theme-text-secondary mb-4">No collections found</p>
            <p className="text-theme-text-secondary">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <CollectionCard 
                key={collection.contract} 
                {...collection} 
                onHover={handleCollectionHover}
                isHovered={hoveredCollection === collection.contract}
                floorPriceLoading={collectionFloorPrices[collection.contract] === null}
                realFloorPrice={collectionFloorPrices[collection.contract]}
                hoverData={collectionHoverData[collection.contract]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 