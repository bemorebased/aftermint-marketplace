import { 
  getMarketplaceStats, 
  getRecentActivity, 
  getTopCollections,
  MarketplaceStats,
  RecentActivity,
  CollectionStats
} from './storageService';

export interface HomepageData {
  stats: MarketplaceStats;
  recentActivity: RecentActivity[];
  topCollections: CollectionStats[];
  featuredNFTs: FeaturedNFT[];
}

export interface FeaturedNFT {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
  price?: string;
  priceInEth?: number;
  type: 'high-value' | 'recent-sale' | 'ending-soon';
  timeLeft?: string;
}

/**
 * Get all homepage data in a single call
 */
export const getHomepageData = async (): Promise<HomepageData> => {
  try {
    console.log('[HomepageService] Fetching homepage data...');
    
    // Fetch all data in parallel for better performance
    const [stats, recentActivity, topCollections] = await Promise.all([
      getMarketplaceStats(),
      getRecentActivity(15),
      getTopCollections(6)
    ]);
    
    // Generate featured NFTs from recent activity
    const featuredNFTs = generateFeaturedNFTs(recentActivity);
    
    const homepageData: HomepageData = {
      stats,
      recentActivity,
      topCollections,
      featuredNFTs
    };
    
    console.log('[HomepageService] Homepage data fetched successfully');
    return homepageData;
    
  } catch (error) {
    console.error('[HomepageService] Error fetching homepage data:', error);
    
    // Return empty data on error
    return {
      stats: {
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
      },
      recentActivity: [],
      topCollections: [],
      featuredNFTs: []
    };
  }
};

/**
 * Generate featured NFTs from recent activity
 */
const generateFeaturedNFTs = (activities: RecentActivity[]): FeaturedNFT[] => {
  const featured: FeaturedNFT[] = [];
  
  // High-value recent sales
  const highValueSales = activities
    .filter(activity => activity.type === 'sale' && activity.priceInEth > 1)
    .sort((a, b) => b.priceInEth - a.priceInEth)
    .slice(0, 3);
  
  highValueSales.forEach(sale => {
    featured.push({
      contractAddress: sale.nftContract,
      tokenId: sale.tokenId,
      price: sale.price,
      priceInEth: sale.priceInEth,
      type: 'high-value'
    });
  });
  
  // Recent sales
  const recentSales = activities
    .filter(activity => activity.type === 'sale')
    .slice(0, 2);
  
  recentSales.forEach(sale => {
    if (!featured.some(f => f.contractAddress === sale.nftContract && f.tokenId === sale.tokenId)) {
      featured.push({
        contractAddress: sale.nftContract,
        tokenId: sale.tokenId,
        price: sale.price,
        priceInEth: sale.priceInEth,
        type: 'recent-sale'
      });
    }
  });
  
  // Active listings (ending soon simulation)
  const activeListings = activities
    .filter(activity => activity.type === 'listing' && activity.status === 'active')
    .slice(0, 2);
  
  activeListings.forEach(listing => {
    if (!featured.some(f => f.contractAddress === listing.nftContract && f.tokenId === listing.tokenId)) {
      featured.push({
        contractAddress: listing.nftContract,
        tokenId: listing.tokenId,
        price: listing.price,
        priceInEth: listing.priceInEth,
        type: 'ending-soon',
        timeLeft: '2d 5h' // Simulated time left
      });
    }
  });
  
  return featured.slice(0, 6); // Limit to 6 featured NFTs
};

/**
 * Format large numbers for display
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format time ago for activity display
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}; 