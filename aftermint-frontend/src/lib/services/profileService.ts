import { ethers } from 'ethers';
import { 
  getUserActiveListings, 
  getUserActiveOffers, 
  UserListing, 
  UserOffer 
} from './storageService';

// Interface for NFT data from profile endpoints
export interface ProfileNFT {
  contract_address: string;
  token_id: number;
  name?: string;
  image?: string;
  metadata?: any;
  collection_name?: string;
  animation_url?: string;
  image_url?: string;
  media_url?: string;
  token_type?: string;
  value?: string;
  price?: number; // For marketplace listings
  seller?: string; // For marketplace listings
  listing?: any; // For marketplace listing data
}

// Interface for collection data from profile endpoints
export interface ProfileCollection {
  contract_address: string;
  name: string;
  symbol?: string;
  logo?: string;
  token_count: number;
}

// Interface for grouped NFT collections (new endpoint)
export interface GroupedNFTCollection {
  amount: string;
  token: {
    address: string;
    name: string;
    symbol: string;
    type: string;
    total_supply: string;
    holders: string;
    icon_url?: string;
  };
  token_instances: ProfileNFT[];
}

// Interface for wallet activity/transactions
export interface WalletTransaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gas_used?: string;
  gas_price?: string;
  status: string;
  method?: string;
  type?: string;
  transaction_fee?: string;
}

// Interface for collection token info
export interface CollectionTokenInfo {
  address: string;
  name: string;
  symbol: string;
  type: string;
  total_supply: string;
  holders: string;
  decimals?: string;
  icon_url?: string;
  circulating_market_cap?: string;
  exchange_rate?: string;
  volume_24h?: string;
}

// Interface for collection activity transactions
export interface CollectionTransaction {
  hash: string;
  block_number: number;
  timestamp: string;
  from: {
    hash: string;
    is_contract?: boolean;
    name?: string;
  };
  to: {
    hash: string;
    is_contract?: boolean;
    name?: string;
  };
  value: string;
  fee: {
    type: string;
    value: string;
  };
  gas_limit: string;
  gas_used: string;
  gas_price: string;
  status: string;
  method?: string;
  type: number;
  token_transfers?: Array<{
    block_number: number;
    from: {
      hash: string;
    };
    to: {
      hash: string;
    };
    token: {
      address: string;
      name: string;
      symbol: string;
      type: string;
    };
    total: {
      decimals: string;
      value: string;
    };
    tx_hash: string;
    type: string;
  }>;
}

/**
 * Get all NFTs owned by a specific address using the BasedAI explorer API
 */
export const getAddressNFTs = async (
  walletAddress: string,
  limit: number = 50
): Promise<ProfileNFT[]> => {
  try {
    console.log(`[ProfileService] Getting NFTs for address ${walletAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(walletAddress);
    
    const response = await fetch(`https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch address NFTs: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((nft: any) => ({
        contract_address: nft.token?.address || nft.contract_address,
        token_id: parseInt(nft.id || nft.token_id),
        name: nft.token?.name || nft.name,
        image: nft.token?.image_url || nft.image,
        metadata: nft.token?.metadata || nft.metadata,
        collection_name: nft.token?.symbol || nft.collection_name
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('[ProfileService] Error getting address NFTs:', error);
    return [];
  }
};

/**
 * Get all collections owned by a specific address using the BasedAI explorer API
 */
export const getAddressNFTCollections = async (
  walletAddress: string
): Promise<ProfileCollection[]> => {
  try {
    console.log(`[ProfileService] Getting NFT collections for address ${walletAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(walletAddress);
    
    const response = await fetch(`https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft/collections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch address collections: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((collection: any) => ({
        contract_address: collection.address || collection.contract_address,
        name: collection.name,
        symbol: collection.symbol,
        logo: collection.icon_url || collection.logo,
        token_count: parseInt(collection.value || collection.token_count || 0)
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('[ProfileService] Error getting address collections:', error);
    return [];
  }
};

/**
 * Get holders for a specific NFT instance
 */
export const getNFTInstanceHolders = async (
  contractAddress: string,
  tokenId: number
): Promise<string[]> => {
  try {
    console.log(`[ProfileService] Getting holders for NFT ${contractAddress}/${tokenId}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(contractAddress);
    
    const response = await fetch(`https://explorer.bf1337.org/api/v2/tokens/${normalizedAddress}/instances/${tokenId}/holders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFT holders: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((holder: any) => holder.address).filter(Boolean);
    }
    
    return [];
    
  } catch (error) {
    console.error('[ProfileService] Error getting NFT holders:', error);
    return [];
  }
};

/**
 * Get collection holders using the improved API endpoint
 */
export const getCollectionHoldersFromAPI = async (
  contractAddress: string,
  limit: number = 100
): Promise<{ address: string; token_count: number }[]> => {
  try {
    console.log(`[ProfileService] Getting collection holders for ${contractAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(contractAddress);
    
    const response = await fetch(`https://explorer.bf1337.org/api/v2/tokens/${normalizedAddress}/holders?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collection holders: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((holder: any) => ({
        address: holder.address,
        token_count: parseInt(holder.value || holder.token_count || 1)
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('[ProfileService] Error getting collection holders:', error);
    return [];
  }
};

/**
 * Get NFT collections grouped by collection for a specific address
 * This uses the new /nft/collections endpoint that groups NFTs by collection
 */
export const getAddressGroupedNFTCollections = async (
  walletAddress: string,
  nftTypes: string = 'ERC-721%2CERC-404%2CERC-1155'
): Promise<GroupedNFTCollection[]> => {
  try {
    console.log(`[ProfileService] 🚨 CRITICAL: Getting ALL grouped NFT collections for address ${walletAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(walletAddress);
    
    let allCollections: GroupedNFTCollection[] = [];
    let currentPage = 1;
    const limit = 50; // API limit per request
    let hasMore = true;
    
    // Fetch ALL pages to get complete collection data
    while (hasMore) {
      console.log(`[ProfileService] 📄 Fetching collections page ${currentPage} (limit: ${limit})`);
      
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft/collections?type=${nftTypes}&limit=${limit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch grouped NFT collections page ${currentPage}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const pageCollections = data.items.map((collection: any) => ({
          amount: collection.amount || '0',
          token: {
            address: collection.token?.address || '',
            name: collection.token?.name || 'Unknown Collection',
            symbol: collection.token?.symbol || '',
            type: collection.token?.type || 'ERC-721',
            total_supply: collection.token?.total_supply || '0',
            holders: collection.token?.holders || '0',
            icon_url: collection.token?.icon_url || null,
          },
          token_instances: (collection.token_instances || []).map((nft: any) => ({
            contract_address: collection.token?.address || '',
            token_id: parseInt(nft.id || '0'),
            name: nft.metadata?.name || `${collection.token?.name} #${nft.id}`,
            image: nft.image_url || nft.metadata?.image,
            image_url: nft.image_url,
            animation_url: nft.animation_url,
            media_url: nft.media_url,
            metadata: nft.metadata,
            collection_name: collection.token?.name,
            token_type: nft.token_type || collection.token?.type,
            value: nft.value || '1',
          })),
        }));
        
        allCollections.push(...pageCollections);
        
        // Check if we have more pages
        hasMore = data.items.length === limit && data.next_page_params;
        
        if (hasMore) {
          currentPage++;
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[ProfileService] ✅ Page ${currentPage - 1}: Got ${data.items.length} collections (Total so far: ${allCollections.length})`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[ProfileService] 🎯 COMPLETE: Fetched ALL ${allCollections.length} collections for address`);
    return allCollections;
    
  } catch (error) {
    console.error('[ProfileService] Error getting grouped NFT collections:', error);
    return [];
  }
};

/**
 * Get wallet transaction activity for a specific address
 */
export const getWalletActivity = async (
  walletAddress: string,
  filter: string = 'to%20%7C%20from',
  limit: number = 50,
  fetchAll: boolean = false
): Promise<WalletTransaction[]> => {
  try {
    console.log(`[ProfileService] Getting ${fetchAll ? 'ALL' : 'limited'} wallet activity for address ${walletAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(walletAddress);
    
    if (!fetchAll) {
      // For UI display, fetch limited results
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/transactions?filter=${filter}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet activity: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((tx: any) => ({
          hash: tx.hash || '',
          block_number: parseInt(tx.block_number || '0'),
          timestamp: tx.timestamp || '',
          from: tx.from?.hash || tx.from || '',
          to: tx.to?.hash || tx.to || '',
          value: tx.value || '0',
          gas_used: tx.gas_used,
          gas_price: tx.gas_price,
          status: tx.status || 'unknown',
          method: tx.method,
          type: tx.type,
          transaction_fee: tx.fee?.value || tx.transaction_fee,
        }));
      }
      
      return [];
    }
    
    // For complete data (when fetchAll = true), implement pagination
    let allTransactions: WalletTransaction[] = [];
    let currentPage = 1;
    const pageLimit = 50; // API limit per request
    let hasMore = true;
    
    // Fetch ALL pages to get complete transaction history
    while (hasMore) {
      console.log(`[ProfileService] 📄 Fetching transactions page ${currentPage} (limit: ${pageLimit})`);
      
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/transactions?filter=${filter}&limit=${pageLimit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet activity page ${currentPage}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const pageTransactions = data.items.map((tx: any) => ({
          hash: tx.hash || '',
          block_number: parseInt(tx.block_number || '0'),
          timestamp: tx.timestamp || '',
          from: tx.from?.hash || tx.from || '',
          to: tx.to?.hash || tx.to || '',
          value: tx.value || '0',
          gas_used: tx.gas_used,
          gas_price: tx.gas_price,
          status: tx.status || 'unknown',
          method: tx.method,
          type: tx.type,
          transaction_fee: tx.fee?.value || tx.transaction_fee,
        }));
        
        allTransactions.push(...pageTransactions);
        
        // Check if we have more pages
        hasMore = data.items.length === pageLimit && data.next_page_params;
        
        if (hasMore) {
          currentPage++;
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[ProfileService] ✅ Page ${currentPage - 1}: Got ${data.items.length} transactions (Total so far: ${allTransactions.length})`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[ProfileService] 🎯 COMPLETE: Fetched ALL ${allTransactions.length} transactions for address`);
    return allTransactions;
    
  } catch (error) {
    console.error('[ProfileService] Error getting wallet activity:', error);
    return [];
  }
};

/**
 * Get detailed information about a specific collection/token
 */
export const getCollectionTokenInfo = async (
  tokenAddress: string
): Promise<CollectionTokenInfo | null> => {
  try {
    console.log(`[ProfileService] Getting collection token info for ${tokenAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(tokenAddress);
    
    const response = await fetch(
      `https://explorer.bf1337.org/api/v2/tokens/${normalizedAddress}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collection token info: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      address: data.address || tokenAddress,
      name: data.name || 'Unknown Collection',
      symbol: data.symbol || '',
      type: data.type || 'ERC-721',
      total_supply: data.total_supply || '0',
      holders: data.holders || '0',
      decimals: data.decimals,
      icon_url: data.icon_url,
      circulating_market_cap: data.circulating_market_cap,
      exchange_rate: data.exchange_rate,
      volume_24h: data.volume_24h,
    };
    
  } catch (error) {
    console.error('[ProfileService] Error getting collection token info:', error);
    return null;
  }
};

/**
 * Enhanced version of getAddressNFTs with better data mapping and type support
 */
export const getAddressNFTsEnhanced = async (
  walletAddress: string,
  nftTypes: string = 'ERC-721%2CERC-404%2CERC-1155',
  fetchAll: boolean = false
): Promise<ProfileNFT[]> => {
  try {
    console.log(`[ProfileService] 🚨 CRITICAL: Getting ${fetchAll ? 'ALL' : 'paginated'} enhanced NFTs for address ${walletAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(walletAddress);
    
    if (!fetchAll) {
      // For UI display, fetch first page only (50 items)
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft?type=${nftTypes}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enhanced address NFTs: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((nft: any) => ({
          contract_address: nft.token?.address || nft.contract_address || '',
          token_id: parseInt(nft.id || nft.token_id || '0'),
          name: nft.metadata?.name || nft.token?.name || `${nft.token?.symbol || 'NFT'} #${nft.id}`,
          image: nft.image_url || nft.metadata?.image,
          image_url: nft.image_url,
          animation_url: nft.animation_url,
          media_url: nft.media_url,
          metadata: nft.metadata,
          collection_name: nft.token?.name || nft.token?.symbol,
          token_type: nft.token_type || nft.token?.type,
          value: nft.value || '1',
        }));
      }
      
      return [];
    }
    
    // For complete data (when fetchAll = true), implement pagination
    let allNFTs: ProfileNFT[] = [];
    let currentPage = 1;
    const limit = 50; // API limit per request
    let hasMore = true;
    
    // Fetch ALL pages to get complete NFT data
    while (hasMore) {
      console.log(`[ProfileService] 📄 Fetching NFTs page ${currentPage} (limit: ${limit})`);
      
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft?type=${nftTypes}&limit=${limit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enhanced address NFTs page ${currentPage}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const pageNFTs = data.items.map((nft: any) => ({
          contract_address: nft.token?.address || nft.contract_address || '',
          token_id: parseInt(nft.id || nft.token_id || '0'),
          name: nft.metadata?.name || nft.token?.name || `${nft.token?.symbol || 'NFT'} #${nft.id}`,
          image: nft.image_url || nft.metadata?.image,
          image_url: nft.image_url,
          animation_url: nft.animation_url,
          media_url: nft.media_url,
          metadata: nft.metadata,
          collection_name: nft.token?.name || nft.token?.symbol,
          token_type: nft.token_type || nft.token?.type,
          value: nft.value || '1',
        }));
        
        allNFTs.push(...pageNFTs);
        
        // Check if we have more pages
        hasMore = data.items.length === limit && data.next_page_params;
        
        if (hasMore) {
          currentPage++;
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[ProfileService] ✅ Page ${currentPage - 1}: Got ${data.items.length} NFTs (Total so far: ${allNFTs.length})`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[ProfileService] 🎯 COMPLETE: Fetched ALL ${allNFTs.length} NFTs for address`);
    return allNFTs;
    
  } catch (error) {
    console.error('[ProfileService] Error getting enhanced address NFTs:', error);
    return [];
  }
};

/**
 * Get user's active NFT listings
 */
export const getUserListings = async (address: string): Promise<UserListing[]> => {
  try {
    console.log(`[ProfileService] Fetching active listings for address: ${address}`);
    
    const listings = await getUserActiveListings(address);
    
    console.log(`[ProfileService] Found ${listings.length} active listings`);
    return listings;
    
  } catch (error) {
    console.error('[ProfileService] Error fetching user listings:', error);
    return [];
  }
};

/**
 * Get user's active offers
 */
export const getUserOffers = async (address: string): Promise<UserOffer[]> => {
  try {
    console.log(`[ProfileService] Fetching active offers for address: ${address}`);
    
    const offers = await getUserActiveOffers(address);
    
    console.log(`[ProfileService] Found ${offers.length} active offers`);
    return offers;
    
  } catch (error) {
    console.error('[ProfileService] Error fetching user offers:', error);
    return [];
  }
};

/**
 * Get collection activity/transactions using the Blockscout API
 */
export const getCollectionActivity = async (
  tokenAddress: string,
  filter: string = 'to%20%7C%20from',
  limit: number = 50,
  fetchAll: boolean = false
): Promise<CollectionTransaction[]> => {
  try {
    console.log(`[ProfileService] Getting ${fetchAll ? 'ALL' : 'limited'} collection activity for ${tokenAddress}`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(tokenAddress);
    
    if (!fetchAll) {
      // For UI display, fetch limited results
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/tokens/${normalizedAddress}/transactions?filter=${filter}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection activity: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((tx: any) => ({
          hash: tx.hash,
          block_number: tx.block_number,
          timestamp: tx.timestamp,
          from: {
            hash: tx.from?.hash || tx.from,
            is_contract: tx.from?.is_contract,
            name: tx.from?.name
          },
          to: {
            hash: tx.to?.hash || tx.to,
            is_contract: tx.to?.is_contract,
            name: tx.to?.name
          },
          value: tx.value || '0',
          fee: {
            type: tx.fee?.type || 'actual',
            value: tx.fee?.value || '0'
          },
          gas_limit: tx.gas_limit || '0',
          gas_used: tx.gas_used || '0',
          gas_price: tx.gas_price || '0',
          status: tx.status || 'unknown',
          method: tx.method,
          type: tx.type || 0,
          token_transfers: tx.token_transfers || []
        }));
      }
      
      return [];
    }
    
    // For complete data (when fetchAll = true), implement pagination
    let allTransactions: CollectionTransaction[] = [];
    let currentPage = 1;
    const pageLimit = 50; // API limit per request
    let hasMore = true;
    
    // Fetch ALL pages to get complete collection activity
    while (hasMore) {
      console.log(`[ProfileService] 📄 Fetching collection activity page ${currentPage} (limit: ${pageLimit})`);
      
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/tokens/${normalizedAddress}/transactions?filter=${filter}&limit=${pageLimit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection activity page ${currentPage}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const pageTransactions = data.items.map((tx: any) => ({
          hash: tx.hash,
          block_number: tx.block_number,
          timestamp: tx.timestamp,
          from: {
            hash: tx.from?.hash || tx.from,
            is_contract: tx.from?.is_contract,
            name: tx.from?.name
          },
          to: {
            hash: tx.to?.hash || tx.to,
            is_contract: tx.to?.is_contract,
            name: tx.to?.name
          },
          value: tx.value || '0',
          fee: {
            type: tx.fee?.type || 'actual',
            value: tx.fee?.value || '0'
          },
          gas_limit: tx.gas_limit || '0',
          gas_used: tx.gas_used || '0',
          gas_price: tx.gas_price || '0',
          status: tx.status || 'unknown',
          method: tx.method,
          type: tx.type || 0,
          token_transfers: tx.token_transfers || []
        }));
        
        allTransactions.push(...pageTransactions);
        
        // Check if we have more pages
        hasMore = data.items.length === pageLimit && data.next_page_params;
        
        if (hasMore) {
          currentPage++;
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[ProfileService] ✅ Page ${currentPage - 1}: Got ${data.items.length} transactions (Total so far: ${allTransactions.length})`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`[ProfileService] 🎯 COMPLETE: Fetched ALL ${allTransactions.length} collection transactions`);
    return allTransactions;
    
  } catch (error) {
    console.error('[ProfileService] Error getting collection activity:', error);
    return [];
  }
};

/**
 * CRITICAL MARKETPLACE FUNCTION: Get ALL NFTs in a collection for accurate floor price calculation
 * This function implements proper pagination to fetch EVERY item in a collection to ensure
 * accurate floor prices, volume calculations, and market data.
 * 
 * WARNING: Never use partial data for marketplace calculations - this could lead to 
 * incorrect floor prices if cheaper items exist in unfetched pages.
 */
export const getAllCollectionNFTsForMarketData = async (
  collectionAddress: string,
  nftTypes: string = 'ERC-721%2CERC-404%2CERC-1155'
): Promise<{
  allNFTs: ProfileNFT[];
  totalSupply: number;
  floorPrice: number | null;
  listedCount: number;
  totalListings: ProfileNFT[];
}> => {
  try {
    console.log(`[ProfileService] 🚨 CRITICAL: Fetching ALL NFTs for collection ${collectionAddress} for accurate market data`);
    
    // Normalize the address
    const normalizedAddress = ethers.getAddress(collectionAddress);
    
    let allNFTs: ProfileNFT[] = [];
    let currentPage = 1;
    const limit = 50; // API limit per request
    let hasMore = true;
    let totalSupply = 0;
    
    // Fetch ALL pages to get complete collection data
    while (hasMore) {
      console.log(`[ProfileService] 📄 Fetching page ${currentPage} (limit: ${limit})`);
      
      const response = await fetch(
        `https://explorer.bf1337.org/api/v2/addresses/${normalizedAddress}/nft?type=${nftTypes}&limit=${limit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection NFTs page ${currentPage}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const pageNFTs = data.items.map((nft: any) => ({
          contract_address: nft.token?.address || normalizedAddress,
          token_id: parseInt(nft.id || '0'),
          name: nft.metadata?.name || `${nft.token?.name || 'NFT'} #${nft.id}`,
          image: nft.image_url || nft.metadata?.image,
          image_url: nft.image_url,
          animation_url: nft.animation_url,
          media_url: nft.media_url,
          metadata: nft.metadata,
          collection_name: nft.token?.name || nft.token?.symbol,
          token_type: nft.token_type || nft.token?.type,
          value: nft.value || '1',
        }));
        
        allNFTs.push(...pageNFTs);
        
        // Check if we have more pages
        hasMore = data.items.length === limit && data.next_page_params;
        
        if (hasMore) {
          currentPage++;
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`[ProfileService] ✅ Page ${currentPage - 1}: Got ${data.items.length} NFTs (Total so far: ${allNFTs.length})`);
      } else {
        hasMore = false;
      }
    }
    
    totalSupply = allNFTs.length;
    console.log(`[ProfileService] 🎯 COMPLETE: Fetched ALL ${totalSupply} NFTs from collection`);
    
    // Now get marketplace data for ALL NFTs to calculate accurate floor price
    console.log(`[ProfileService] 💰 Checking marketplace listings for ALL ${totalSupply} NFTs...`);
    
    const { getListingInfo } = await import('@/lib/services/marketplaceService');
    const { getBasedAIProvider } = await import('@/lib/services/nftService');
    const provider = getBasedAIProvider();
    
    // Check listings in batches to avoid overwhelming the RPC
    const listingBatchSize = 20;
    const allListings: ProfileNFT[] = [];
    
    for (let i = 0; i < allNFTs.length; i += listingBatchSize) {
      const batch = allNFTs.slice(i, i + listingBatchSize);
      
      console.log(`[ProfileService] 📦 Checking listings batch ${Math.floor(i/listingBatchSize) + 1}/${Math.ceil(allNFTs.length/listingBatchSize)}`);
      
      const batchListings = await Promise.all(
        batch.map(async (nft) => {
          try {
            const listingInfo = await getListingInfo(normalizedAddress, nft.token_id, provider);
            if (listingInfo && listingInfo.price && Number(listingInfo.price) > 0) {
              return {
                ...nft,
                price: parseFloat(ethers.formatEther(listingInfo.price)),
                seller: listingInfo.seller,
                listing: listingInfo
              };
            }
          } catch (error) {
            // Silent fail for individual listings
          }
          return null;
        })
      );
      
      // Add valid listings to our collection
      const validListings = batchListings.filter(listing => listing !== null) as ProfileNFT[];
      allListings.push(...validListings);
      
      // Small delay between batches
      if (i + listingBatchSize < allNFTs.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Calculate accurate floor price from ALL listings
    const floorPrice = allListings.length > 0 
      ? Math.min(...allListings.map(nft => parseFloat(nft.price?.toString() || '0')).filter(price => price > 0))
      : null;
    
    console.log(`[ProfileService] 🏆 ACCURATE MARKET DATA CALCULATED:`);
    console.log(`  - Total NFTs in collection: ${totalSupply}`);
    console.log(`  - Total listings found: ${allListings.length}`);
    console.log(`  - Accurate floor price: ${floorPrice} ETH`);
    
    return {
      allNFTs,
      totalSupply,
      floorPrice,
      listedCount: allListings.length,
      totalListings: allListings
    };
    
  } catch (error) {
    console.error('[ProfileService] 🚨 CRITICAL ERROR: Failed to fetch complete collection data:', error);
    throw error;
  }
};

/**
 * Get comprehensive collection statistics with accurate market data
 * This function ensures all marketplace calculations are based on complete data
 */
export const getCollectionMarketStats = async (
  collectionAddress: string
): Promise<{
  floorPrice: number | null;
  listedCount: number;
  totalSupply: number;
  listingRate: number; // Percentage of collection that's listed
  averagePrice: number | null;
  medianPrice: number | null;
  totalVolume: number;
}> => {
  try {
    console.log(`[ProfileService] 📊 Getting comprehensive market stats for ${collectionAddress}`);
    
    const marketData = await getAllCollectionNFTsForMarketData(collectionAddress);
    
    // Calculate additional market metrics
    const listingRate = marketData.totalSupply > 0 
      ? (marketData.listedCount / marketData.totalSupply) * 100 
      : 0;
    
    const prices = marketData.totalListings
      .map(nft => parseFloat(nft.price?.toString() || '0'))
      .filter(price => price > 0)
      .sort((a, b) => a - b);
    
    const averagePrice = prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
      : null;
    
    const medianPrice = prices.length > 0 
      ? prices.length % 2 === 0 
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)]
      : null;
    
    // TODO: Implement total volume calculation from blockchain data
    const totalVolume = 0; // Placeholder - would need to fetch from transaction history
    
    const stats = {
      floorPrice: marketData.floorPrice,
      listedCount: marketData.listedCount,
      totalSupply: marketData.totalSupply,
      listingRate: Math.round(listingRate * 100) / 100, // Round to 2 decimal places
      averagePrice: averagePrice ? Math.round(averagePrice * 10000) / 10000 : null, // Round to 4 decimal places
      medianPrice: medianPrice ? Math.round(medianPrice * 10000) / 10000 : null, // Round to 4 decimal places
      totalVolume
    };
    
    console.log(`[ProfileService] 📈 Complete market stats:`, stats);
    
    return stats;
    
  } catch (error) {
    console.error('[ProfileService] Error getting collection market stats:', error);
    throw error;
  }
}; 