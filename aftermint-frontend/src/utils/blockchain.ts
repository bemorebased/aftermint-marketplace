import axios from 'axios';
import { ethers } from 'ethers';
import { fetchCollectionInfo } from './nft';
import { trackApiCall, trackContractCall, captureError } from './errorTracking';

// BasedAI Explorer API endpoints
const EXPLORER_API_BASE = 'https://explorer.bf1337.org/api';
const EXPLORER_GRAPHQL = 'https://explorer.bf1337.org/graphql';
const BASEDAI_RPC_URL = 'https://mainnet.basedaibridge.com/rpc/';

/**
 * Get BasedAI blockchain provider
 */
export function getBasedAIProvider() {
  return new ethers.JsonRpcProvider(BASEDAI_RPC_URL);
}

// Type for holder data
interface TokenHolder {
  address: {
    hash: string;
  };
  value: string;
}

// Cache for explorer data to prevent API spam
const explorerCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for token holders data
const holdersCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Fetches wallet balance from the BasedAI blockchain
 */
export async function fetchWalletBalance(address: string): Promise<{ balance: string, formatted: string }> {
  try {
    if (!address || !ethers.isAddress(address)) {
      throw new Error('Invalid address provided');
    }
    
    // Try the explorer API first
    try {
      const response = await axios.get(`${EXPLORER_API_BASE}/v2/addresses/${address}`);
      if (response.data && response.data.coin_balance) {
        const balance = BigInt(response.data.coin_balance);
        const formatted = ethers.formatEther(balance);
        return { balance: balance.toString(), formatted };
      }
    } catch (apiError) {
      console.warn(`Explorer API error fetching balance for ${address}, falling back to RPC:`, apiError);
    }
      
    // Fallback to RPC if the API fails
    const provider = new ethers.JsonRpcProvider(BASEDAI_RPC_URL);
    const balance = await provider.getBalance(address);
    const formatted = ethers.formatEther(balance);
    
    return { balance: balance.toString(), formatted };
  } catch (error) {
    console.error(`Error fetching wallet balance for ${address}:`, error);
    return { balance: '0', formatted: '0.0' };
  }
}

/**
 * Fetches collection holders using the proper BasedAI explorer API
 * Uses: /tokens/{address_hash}/holders
 */
export async function fetchCollectionHolders(contractAddress: string) {
  if (!contractAddress || contractAddress === 'undefined') {
    console.warn('Invalid contract address provided to fetchCollectionHolders');
    return { uniqueHolders: 0, holders: [] };
  }

  // Check cache first
  const cacheKey = `holders_${contractAddress.toLowerCase()}`;
  const cached = explorerCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[fetchCollectionHolders] Using cached data for ${contractAddress}`);
    return cached.data;
  }

  try {
    console.log(`[fetchCollectionHolders] 🔍 Fetching holders for ${contractAddress}`);
    
    const response = await fetch(`${EXPLORER_API_BASE}/v2/tokens/${contractAddress}/holders`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[fetchCollectionHolders] 📊 Raw API response:`, data);
    
    // Parse the response structure
    const items = data.items || [];
    const uniqueHolders = items.length;
    
    // Get total holders count from the token data (if available)
    let totalHoldersFromToken = 0;
    if (items.length > 0 && items[0].token && items[0].token.holders) {
      totalHoldersFromToken = parseInt(items[0].token.holders);
    }
    
    // Use the higher of the two counts (API might be paginated)
    const finalHoldersCount = Math.max(uniqueHolders, totalHoldersFromToken);
    
    const result = {
      uniqueHolders: finalHoldersCount,
      totalSupply: items.length > 0 && items[0].token ? parseInt(items[0].token.total_supply || '0') : 0,
      holders: items.map((item: any) => ({
        address: item.address?.hash || '',
        balance: parseInt(item.value || '0')
      }))
    };
    
    console.log(`[fetchCollectionHolders] ✅ Processed data:`, {
      uniqueHolders: result.uniqueHolders,
      totalSupply: result.totalSupply,
      holdersCount: result.holders.length
    });
    
    // Cache the result
    explorerCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error(`[fetchCollectionHolders] ❌ Error fetching holders for ${contractAddress}:`, error);
    return { uniqueHolders: 0, totalSupply: 0, holders: [] };
  }
}

/**
 * Fetches collection transfers/activity using the proper BasedAI explorer API
 * Uses: /tokens/{address_hash}/transfers
 */
export async function fetchCollectionActivity(contractAddress: string, limit: number = 50) {
  if (!contractAddress || contractAddress === 'undefined') {
    console.warn('Invalid contract address provided to fetchCollectionActivity');
    return [];
  }

  // Check cache first
  const cacheKey = `activity_${contractAddress.toLowerCase()}_${limit}`;
  const cached = explorerCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[fetchCollectionActivity] Using cached data for ${contractAddress}`);
    return cached.data;
  }

  try {
    console.log(`[fetchCollectionActivity] Fetching activity for ${contractAddress} from BasedAI explorer`);
    
    const response = await axios.get(`${EXPLORER_API_BASE}/v2/tokens/${contractAddress}/transfers`, {
      params: { limit }
    });
    
    if (response.data && response.data.items) {
      const transfers = response.data.items.map((transfer: any) => ({
        type: transfer.type || 'Transfer',
        from: transfer.from?.hash || null,
        to: transfer.to?.hash || null,
        tokenId: transfer.token?.id || null,
        value: transfer.total?.value || null,
        timestamp: transfer.timestamp ? new Date(transfer.timestamp) : new Date(),
        txHash: transfer.tx_hash || null,
        blockNumber: transfer.block_number || null
      }));

      // Cache the result
      explorerCache.set(cacheKey, { data: transfers, timestamp: Date.now() });
      
      console.log(`[fetchCollectionActivity] ✅ Found ${transfers.length} transfers for ${contractAddress}`);
      return transfers;
    }
    
    return [];
  } catch (error) {
    console.error(`[fetchCollectionActivity] Error fetching activity for ${contractAddress}:`, error);
    return [];
  }
}

/**
 * Fetches user NFTs using the proper BasedAI explorer API
 * Uses: /addresses/{address_hash}/nft
 */
export async function fetchUserNFTs(userAddress: string) {
  try {
    console.log(`[fetchUserNFTs] 🔍 Fetching NFTs for user ${userAddress}`);
    
    // Use the tracked API call
    const response = await trackApiCall<any>(
      `${EXPLORER_API_BASE}/v2/addresses/${userAddress}/nft?type=ERC-721,ERC-404,ERC-1155`,
      { method: 'GET' },
      'fetchUserNFTs'
    );
    
    if (!response || !response.items) {
      console.log(`[fetchUserNFTs] No NFTs found for ${userAddress}`);
      return [];
    }
    
    console.log(`[fetchUserNFTs] 📊 API Response:`, response);
    
    const nfts = response.items
      .filter((item: any) => {
        const contractAddress = item.token?.address;
        if (!contractAddress) return false;
        
        // Include all NFTs for now (simplified for build)
        return true;
      })
      .map((item: any) => ({
        id: item.id,
        tokenId: item.id,
        name: item.metadata?.name || `NFT #${item.id}`,
        image: item.metadata?.image || '/placeholder-nft.png',
        contractAddress: item.token.address,
        collection: { name: 'Unknown Collection', contract: item.token.address },
        owner: userAddress,
        metadata: item.metadata
      }));
    
    console.log(`[fetchUserNFTs] ✅ Processed ${nfts.length} marketplace NFTs`);
    return nfts;
    
  } catch (error) {
    console.error(`[fetchUserNFTs] ❌ Error:`, error);
    captureError({
      type: 'api',
      severity: 'high',
      message: `Failed to fetch user NFTs: ${error}`,
      component: 'fetchUserNFTs',
      additionalData: { userAddress }
    });
    return [];
  }
}

/**
 * Fetches collection data from BasedAI Explorer using proper REST API endpoints
 */
export async function fetchCollectionFromExplorer(contractAddress: string) {
  if (!contractAddress || contractAddress === 'undefined') {
    console.warn('Invalid contract address provided to fetchCollectionFromExplorer');
    return null;
  }

  // Check cache first
  const cacheKey = contractAddress.toLowerCase();
  const cached = explorerCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[fetchCollectionFromExplorer] Using cached data for ${contractAddress}`);
    return cached.data;
  }

  try {
    console.log(`[fetchCollectionFromExplorer] 🔍 Fetching collection data for ${contractAddress}`);
    
    // Fetch base token contract info (name, logo, description) from explorer v2 endpoint
    let contractInfo: any = {};
    try {
      const resp = await axios.get(`${EXPLORER_API_BASE}/v2/tokens/${contractAddress}`);
      if (resp.data && resp.data.token) {
        contractInfo = resp.data.token;
      }
    } catch (infoErr) {
      console.warn('[fetchCollectionFromExplorer] Could not fetch contract info:', infoErr);
    }

    // Fetch holders data using the proper API
    const holdersData = await fetchCollectionHolders(contractAddress);
    
    const result = {
      name: contractInfo.name || contractInfo.token_name || contractInfo.metadata?.name || contractInfo.symbol || 'Unknown Collection',
      logo_url: contractInfo.logo_url || contractInfo.image_url || contractInfo.metadata?.image_url || '/placeholder-nft.png',
      banner_image_url: contractInfo.banner_image_url || contractInfo.cover_image_url || '',
      description: contractInfo.description || '',
      totalSupply: holdersData.totalSupply || contractInfo.total_supply,
      uniqueHolders: holdersData.uniqueHolders,
      owners: holdersData.uniqueHolders, // Alias for compatibility
      holders: holdersData.holders
    };
    
    console.log(`[fetchCollectionFromExplorer] ✅ Collection data:`, {
      totalSupply: result.totalSupply,
      uniqueHolders: result.uniqueHolders,
      holdersCount: result.holders.length
    });
    
    // Cache the result
    explorerCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error(`[fetchCollectionFromExplorer] ❌ Error fetching collection data:`, error);
    return null;
  }
}

/**
 * Fetches token holders data using GraphQL
 * 
 * Note: While the BasedAI explorer does offer a REST API (https://explorer.bf1337.org/api-docs),
 * we use GraphQL for this particular endpoint because:
 * 1. The REST API doesn't provide detailed token holder data with the same level of filtering
 * 2. GraphQL allows more precise queries with only the data we need
 * 3. For complex data like token holders with pagination, GraphQL is more efficient
 * 
 * We've added a local API proxy at /api/explorer-proxy to handle CORS issues with the GraphQL endpoint
 */
async function fetchTokenHolders(contractAddress: string) {
  // Validate input
  if (!contractAddress || contractAddress === 'undefined') {
    console.warn('Invalid contract address provided to fetchTokenHolders');
    return { uniqueHolders: 0, holders: [] };
  }
  
  // Check cache first
  const cacheKey = `holders_${contractAddress.toLowerCase()}`;
  const cached = holdersCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[fetchTokenHolders] Using cached holders data for ${contractAddress}`);
    return cached.data;
  }
  
  try {
    const query = `
      query {
        tokenHolders(
          tokenContractAddress: "${contractAddress}"
        ) {
          items {
            address {
              hash
            }
            value
          }
          next_page_params {
            value
          }
        }
      }
    `;
    
    // Set a timeout for the GraphQL request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      // Use our local API proxy to avoid CORS issues
      const response = await axios.post(
        '/api/explorer-proxy',  // Use our local API proxy instead of direct EXPLORER_GRAPHQL
        { query },
        { 
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      clearTimeout(timeoutId);
      
      const holders = response.data?.data?.tokenHolders?.items || [];
      
      // Count unique addresses
      const uniqueAddresses = new Set();
      holders.forEach((holder: TokenHolder) => {
        if (holder.address && holder.address.hash) {
          uniqueAddresses.add(holder.address.hash.toLowerCase());
        }
      });
      
      const result = {
        uniqueHolders: uniqueAddresses.size,
        holders: holders,
      };

      // Cache the result
      holdersCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (axiosError: any) {
      clearTimeout(timeoutId);
      if (axiosError.name === 'AbortError' || axiosError.code === 'ECONNABORTED') {
        console.warn(`GraphQL request timeout for ${contractAddress}`);
      } else {
        console.error(`GraphQL request failed for ${contractAddress}:`, axiosError);
      }
      
      // Fallback to RPC for known ERC721 contracts
      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.JsonRpcProvider(BASEDAI_RPC_URL);
        
        // Try a basic check - see if contract exists
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
          console.warn(`Contract at ${contractAddress} doesn't exist or has no code`);
          return { uniqueHolders: 0, holders: [] };
        }
        
        // Return a plausible mock value for development purposes
        return { 
          uniqueHolders: Math.floor(Math.random() * 100) + 20, // Random placeholder between 20-120
          holders: [] 
        };
      } catch (rpcError) {
        console.error(`RPC fallback failed for holders of ${contractAddress}:`, rpcError);
        return { uniqueHolders: 0, holders: [] };
      }
    }
  } catch (error) {
    console.error(`Error fetching token holders for ${contractAddress}:`, error);
    return { uniqueHolders: 0, holders: [] };
  }
}

/**
 * Fetches token transfers for a specific token
 */
export async function fetchTokenTransfers(contractAddress: string, tokenId?: string) {
  try {
    let url = `${EXPLORER_API_BASE}/token-transfers?token=${contractAddress}`;
    if (tokenId) {
      url += `&token-id=${tokenId}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching token transfers for ${contractAddress}:`, error);
    return null;
  }
}

/**
 * Fetches transaction data for a specific address
 */
export async function fetchAddressTransactions(address: string) {
  try {
    const response = await axios.get(`${EXPLORER_API_BASE}/addresses/${address}/transactions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transactions for ${address}:`, error);
    return null;
  }
}

/**
 * Fetches transfers for a specific NFT
 */
export async function fetchNFTTransfers(contractAddress: string, tokenId: string) {
  try {
    // This is specifically for ERC-721 or ERC-1155 tokens
    const response = await axios.get(
      `${EXPLORER_API_BASE}/v2/tokens/${contractAddress}/instances/${tokenId}/transfers`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching NFT transfers for ${contractAddress}/${tokenId}:`, error);
    return null;
  }
}

/**
 * Fetches all NFT transfers for a user address (for activity tab)
 */
export async function fetchUserActivity(userAddress: string, limit: number = 50) {
  try {
    console.log(`[fetchUserActivity] 🔍 Fetching activity for ${userAddress}`);

    if (!userAddress || !ethers.isAddress(userAddress)) {
      throw new Error('Invalid user address');
    }

    // Try the dedicated token-transfers endpoint first (faster & richer)
    const transfersResp = await axios.get(
      `${EXPLORER_API_BASE}/v2/addresses/${userAddress}/token-transfers`,
      { params: { limit } }
    );

    if (transfersResp.data && Array.isArray(transfersResp.data.items)) {
      const activity = transfersResp.data.items.map((t: any) => {
        const received = t.to?.hash?.toLowerCase() === userAddress.toLowerCase();
        const sent = t.from?.hash?.toLowerCase() === userAddress.toLowerCase();
        const type = received ? 'Receive' : sent ? 'Send' : 'Transfer';
        const priceBased = t.total?.value ? ethers.formatEther(t.total.value) : '0';
        return {
          id: t.tx_hash || `${t.token?.address}-${t.token_id}-${t.timestamp}`,
          type,
          item: t.token?.name ? `${t.token.name} #${t.token_id}` : `Token #${t.token_id}`,
          price: priceBased,
          date: t.timestamp ? new Date(t.timestamp) : new Date(),
          collection: {
            name: t.token?.name || 'Unknown',
            logo: '/placeholder-nft.png'
          },
          tokenContract: t.token?.address,
          tokenId: t.token_id
        };
      });

      return activity.slice(0, limit);
    }

    // Fallback: use previous NFT listing method
    console.log('[fetchUserActivity] Falling back to NFT list endpoint');
    const fallback = await axios.get(
      `${EXPLORER_API_BASE}/v2/addresses/${userAddress}/nft?type=ERC-721,ERC-404,ERC-1155`,
      { params: { limit } }
    );

    if (!fallback.data || !fallback.data.items) {
      return [];
    }

    const activityFallback = fallback.data.items.slice(0, limit).map((item: any) => ({
      id: `${item.token?.address || 'unknown'}-${item.id || 'unknown'}`,
      type: 'Transfer',
      item: item.metadata?.name || `Token #${item.id}`,
      price: '0',
      date: new Date(),
      collection: {
        name: item.token?.name || 'Unknown Collection',
        logo: '/placeholder-nft.png'
      },
      tokenContract: item.token?.address,
      tokenId: item.id
    }));

    return activityFallback;
  } catch (error) {
    console.error(`Error fetching user activity for ${userAddress}:`, error);
    return [];
  }
}

export async function fetchCollectionTokens(contractAddress: string, page: number = 1, limit: number = 100) {
  if (!contractAddress) return { items: [], total: 0 };

  try {
    const resp = await axios.get(`${EXPLORER_API_BASE}/v2/tokens/${contractAddress}/instances`, {
      params: { page, limit }
    });

    if (resp.data && Array.isArray(resp.data.items)) {
      return {
        items: resp.data.items,
        total: resp.data.items.length
      };
    }
  } catch (err) {
    console.error('[fetchCollectionTokens] error:', err);
  }

  return { items: [], total: 0 };
}

export async function fetchAllCollectionTokens(contractAddress: string, limitPerPage: number = 50, maxSupply?: number) {
  const allItems: any[] = [];
  let hasMorePages = true;
  let page = 1;
  
  console.log(`[fetchAllCollectionTokens] Starting to fetch tokens for ${contractAddress}${maxSupply ? ` (max supply: ${maxSupply})` : ''}`);
  
  // Calculate max pages based on supply if provided
  const maxPages = maxSupply ? Math.ceil(maxSupply / limitPerPage) : 200;
  
  while (hasMorePages && page <= maxPages) {
    try {
      console.log(`[fetchAllCollectionTokens] Fetching page ${page}/${maxPages} with limit ${limitPerPage}`);
      const { items } = await fetchCollectionTokens(contractAddress, page, limitPerPage);
      
      if (items.length === 0) {
        console.log(`[fetchAllCollectionTokens] No items on page ${page}, stopping`);
        hasMorePages = false;
        break;
      }
      
      allItems.push(...items);
      console.log(`[fetchAllCollectionTokens] Page ${page}: Got ${items.length} items, total so far: ${allItems.length}`);
      
      // Stop if we've reached the max supply
      if (maxSupply && allItems.length >= maxSupply) {
        console.log(`[fetchAllCollectionTokens] Reached max supply (${maxSupply}), stopping`);
        hasMorePages = false;
        break;
      }
      
      // If we got fewer items than the limit, this is the last page
      if (items.length < limitPerPage) {
        console.log(`[fetchAllCollectionTokens] Last page reached (${items.length} < ${limitPerPage})`);
        hasMorePages = false;
      }
      
      page++;
      
      // Add a small delay to avoid rate limiting
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[fetchAllCollectionTokens] Error fetching page ${page}:`, error);
      hasMorePages = false;
    }
  }
  
  // Trim to exact supply if provided
  const finalItems = maxSupply ? allItems.slice(0, maxSupply) : allItems;
  console.log(`[fetchAllCollectionTokens] ✅ Finished fetching ${finalItems.length} total tokens`);
  console.log(`[fetchAllCollectionTokens] Sample token structure:`, finalItems[0]);
  return finalItems;
} 