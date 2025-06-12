import { ethers } from 'ethers';

// Interface for NFT data from profile endpoints
export interface ProfileNFT {
  contract_address: string;
  token_id: number;
  name?: string;
  image?: string;
  metadata?: any;
  collection_name?: string;
}

// Interface for collection data from profile endpoints
export interface ProfileCollection {
  contract_address: string;
  name: string;
  symbol?: string;
  logo?: string;
  token_count: number;
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