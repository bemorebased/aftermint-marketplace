/**
 * Utility functions for fetching and processing NFT data from BasedAI network
 */

import { ethers } from 'ethers';
import { basedCollections } from '@/data/collections';

// Define constants
// Use BasedAI mainnet as default, fall back to local Hardhat if available
const DEFAULT_RPC_URL = 'https://mainnet.basedaibridge.com/rpc/';

// ERC721 ABI - minimum needed for our interactions
const ERC721_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'
];

// Marketplace ABI
const MARKETPLACE_ABI = [
  'function getListing(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, uint64 listedAt, uint64 expiresAt, address privateBuyer, address paymentToken))'
];

// Helper function to create a resilient provider
function createProvider(rpcUrl = DEFAULT_RPC_URL) {
  // In browser environment, prefer wallet provider to avoid CORS
  if (typeof window !== 'undefined' && window.ethereum) {
    console.log('[NFTUtils] 🔗 Using wallet provider to avoid CORS issues');
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  // Only use RPC for SSR or when no wallet is available
  if (typeof window === 'undefined') {
    console.log('[NFTUtils] 🔄 SSR environment - using RPC provider');
    return new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
  }
  
  // Browser environment without wallet - this will cause CORS issues
  console.warn('[NFTUtils] ⚠️ No wallet detected - RPC calls may fail due to CORS');
  return new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
}

// Helper function to check tokens manually by querying ownerOf for each ID
async function checkTokensManually(contract: ethers.Contract, maxTokens: number = 10): Promise<number> {
  let count = 0;
  
  // Try to find tokens by checking a range of tokenIDs
  for (let i = 0; i < maxTokens; i++) {
    try {
      await contract.ownerOf(i);
      count++;
    } catch (e) {
      // Token doesn't exist or other error
    }
  }
  
  return count;
}

// Define NFT data types
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<any>;
  tokenId: number;
  owner: string;
  displayOwner: string;
  isListed: boolean;
  collection: {
    contract: string;
  };
  price?: string;
  listing?: {
    seller: string;
    price: string;
    listedAt: number;
    expiresAt: number;
    privateBuyer: string;
    paymentToken: string;
  };
}

// Helper function to get collection details from basedCollections
export function getBasedCollectionDetails(contractAddress: string) {
  return basedCollections.find(c => c.id.toLowerCase() === contractAddress.toLowerCase());
}

// NEW: Helper function to generate a usable NFT image URL based on collection and token ID
function generateNFTImageUrl(contractAddress: string, tokenId: number | string): string {
  // Use predefined patterns for known collections
  const basedCollection = getBasedCollectionDetails(contractAddress);
  if (basedCollection) {
    // Collections with pattern-based image URLs
    const patternCollections: Record<string, string> = {
      // Use placeholder pattern for LifeNodes since real IPFS URLs not available
      '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21': `https://picsum.photos/seed/lifenodes${tokenId}/500/500`, // Fixed: removed broken IPFS
      '0x22af27d00c53c0fba14446958864db7e3fe0852c': `https://ipfs.io/ipfs/bafybeiecuuonjpvsne7wucnzuhgqogmnouwy6jxqvs47zmbvbzsjdecfue/${tokenId}.png`,
      '0x40b6184b901334c0a88f528c1a0a1de7a77490f1': `https://ipfs.io/ipfs/QmcrTQeaYG8uEF9nJaT3PRZWvX9PL4u1DPpDRF1zDxMbq4/${tokenId}.png`,
      '0xd36199215717f858809b0e62441c1f81adbf3d2c': `https://nftstorage.link/ipfs/bafybeica65gmb6uisvbbbm36ssfklbbecbfnfdh57j5ypvrxrkhirzxlaa/${tokenId}.jpg`,
      '0xd4b1516eea9ccd966629c2972dab8683069ed7bc': `https://nftstorage.link/ipfs/bafybeihcqtasjwu6v7jlfvobifnxdszvsvqhtj4v7k2rq4kr55aohvf3f4/${tokenId}.jpg`,
      '0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f': `https://nftstorage.link/ipfs/bafybeialrzzwu4s44c5xzqnzocczj3ugnptc6z7a5vb2wpz5uh5nkw22ta/${tokenId}.jpg`,
      '0xd819b90f7a7f8e85639671d2951285573bbf8771': `https://ipfs.io/ipfs/bafybeid5d55umogmdjvmfrtyf6mzfmn2ntgu7vbcvz7nq5qiwpsvzyvhu4/${tokenId}.png`,
      '0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81': `https://www.fancyfrogfamily.com/images/frogs/frog${tokenId}.png`
    };

    // If we have a specific pattern for this collection, use it
    if (patternCollections[contractAddress.toLowerCase()]) {
      return patternCollections[contractAddress.toLowerCase()];
    }
    
    // For other collections, generate token-specific images, not collection logos
    return `https://picsum.photos/seed/${contractAddress.slice(-8)}${tokenId}/500/500`;
  }
  
  // Fallback to placeholder
  return `https://picsum.photos/seed/${contractAddress}${tokenId}/500/500`;
}

// NEW: Helper function to sanitize image URLs and remove broken basedai.art links
function sanitizeImageUrl(imageUrl: string | undefined, contractAddress: string, tokenId: number | string): string {
  // If no image URL or empty, use fallback
  if (!imageUrl || imageUrl.trim() === '') {
    return generateNFTImageUrl(contractAddress, tokenId);
  }
  
  // Only block basedai.art domain specifically (not storage.googleapis.com or other valid domains)
  if (imageUrl.includes('basedai.art') && !imageUrl.includes('storage.googleapis.com')) {
    console.log(`🚫 Blocked basedai.art image URL for ${contractAddress}#${tokenId}, using fallback`);
    return generateNFTImageUrl(contractAddress, tokenId);
  }
  
  // If image URL starts with ipfs://, convert to HTTP gateway
  if (imageUrl.startsWith('ipfs://')) {
    return imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  // Return the URL as-is if it's valid
  return imageUrl;
}

/**
 * Fetches collection data
 * @param contractAddress The NFT contract address
 * @param rpcUrl Optional RPC URL (defaults to local Hardhat in development)
 * @returns Basic collection info
 */
export async function fetchCollectionInfo(
  contractAddress: string,
  rpcUrl: string = DEFAULT_RPC_URL
) {
  try {
    console.log(`Fetching collection info for ${contractAddress} using RPC: ${rpcUrl}`);
    
    const provider = createProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Get static details if available (name, logo, etc.)
    const staticDetails = getBasedCollectionDetails(contractAddress);
    
    let name = staticDetails?.name || contractAddress.substring(0, 6) + "...";
    let symbol = staticDetails?.name?.substring(0, 3)?.toUpperCase() || "NFT";
    let logo = staticDetails?.logoUrl || `https://picsum.photos/seed/${contractAddress}/200/200`;
    let description = staticDetails ? `Collection of ${staticDetails.name} NFTs on the BasedAI blockchain.` : `Collection of NFTs on the blockchain.`;

    let totalSupplyValue = 0;

    try {
      const timeout = 5000; // 5 seconds
      
      // Fetch dynamic on-chain data: name, symbol (if not in static), and totalSupply
      // If staticDetails provides a name, we can prefer it.
      const namePromise = staticDetails?.name ? Promise.resolve(staticDetails.name) : Promise.race([
        contract.name().catch(e => {
          console.warn(`Name call failed for ${contractAddress}: ${e.message}. Using default.`);
          return contractAddress.substring(0, 6) + "...";
        }),
        new Promise(resolve => setTimeout(() => resolve(contractAddress.substring(0, 6) + "..."), timeout))
      ]);
      
      // Similar for symbol, prefer static if available and makes sense, otherwise fetch
      const symbolPromise = staticDetails?.name ? Promise.resolve(staticDetails.name.substring(0,3).toUpperCase()) :Promise.race([ // Example: derive symbol if static name exists
        contract.symbol().catch(e => {
          console.warn(`Symbol call failed for ${contractAddress}: ${e.message}. Using default.`);
          return "NFT";
        }),
        new Promise(resolve => setTimeout(() => resolve("NFT"), timeout))
      ]);
      
      const totalSupplyPromise = Promise.race([
        contract.totalSupply().then(supply => Number(supply)).catch(e => { // Ensure conversion to Number
          console.warn(`TotalSupply call failed for ${contractAddress}: ${e.message}. Trying manual check.`);
          return checkTokensManually(contract, 10); // checkTokensManually already returns a number
        }),
        new Promise(resolve => setTimeout(() => resolve(0), timeout)) // Timeout returns 0
      ]);

      const [nameResult, symbolResult, totalSupplyResult] = await Promise.all([
        namePromise, symbolPromise, totalSupplyPromise
      ]);
      
      name = nameResult as string; // Type assertion
      symbol = symbolResult as string; // Type assertion
      totalSupplyValue = totalSupplyResult as number; // Type assertion
      
      console.log(`Successfully fetched/resolved collection info: ${name} (${symbol}) with ${totalSupplyValue} items`);

    } catch (e) {
       console.error(`Error fetching dynamic collection details for ${contractAddress}: ${e}`);
       // Defaults for name, symbol, totalSupplyValue will be used
    }
    
    return {
      name,
      symbol,
      contract: contractAddress,
      totalSupply: totalSupplyValue,
      items: totalSupplyValue, 
      description,
      logo, // Use logo from static details if available, else placeholder
      chainId: 32323 // Assuming BasedAI mainnet or fetched dynamically if possible
    };

  } catch (error: any) {
    console.error(`Outer error in fetchCollectionInfo for ${contractAddress}: ${error}`);
    // Fallback for complete failure
    const staticDetails = getBasedCollectionDetails(contractAddress);
    return {
      name: staticDetails?.name || undefined, // Don't fallback to contract address as name
      symbol: staticDetails?.name?.substring(0,3)?.toUpperCase() || undefined,
      contract: contractAddress,
      totalSupply: 0,
      items: 0,
      description: staticDetails ? `Collection of ${staticDetails.name} NFTs on the BasedAI blockchain.` : undefined,
      logo: staticDetails?.logoUrl || undefined,
      chainId: 32323
    };
  }
}

/**
 * Fetches NFT metadata including on-chain data and URI content
 * @param contractAddress The NFT contract address
 * @param tokenId Token ID to fetch
 * @param rpcUrl Optional RPC URL (defaults to local Hardhat)
 * @returns NFT metadata object or null if failed
 */
export async function fetchNFTMetadata(
  contractAddress: string,
  tokenId: number | string,
  rpcUrl: string = DEFAULT_RPC_URL
) {
  try {
    console.log(`[fetchNFTMetadata] Fetching metadata for ${contractAddress} token ${tokenId}`);
    
    // Check if it's a known collection from basedCollections
    const basedCollection = getBasedCollectionDetails(contractAddress);
    
    // Only use mock data for test collections (e.g., Hardhat, MockNFT)
    const isTestCollection = contractAddress.toLowerCase() === "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Add more if needed
    if (isTestCollection && basedCollection) {
      console.log(`Using static data for collection ${basedCollection.name}`);
      // Generate mock data for this token
      return {
        name: `${basedCollection.name} #${tokenId}`,
        description: `${basedCollection.name} NFT #${tokenId}`,
        image: `https://picsum.photos/seed/${contractAddress}${tokenId}/500/500`,
        tokenId: Number(tokenId),
        owner: '0x0000000000000000000000000000000000000000',
        displayOwner: '0x000...0000',
        isListed: Math.random() > 0.7, // 30% chance of being listed
        price: Math.random() > 0.7 ? (0.1 + Math.random() * 2).toFixed(2) : undefined,
        attributes: [
          { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Yellow', 'Purple'][Number(tokenId) % 5] },
          { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Number(tokenId) % 5] }
        ],
        collection: {
          name: basedCollection.name,
          contract: contractAddress,
          logo: basedCollection.logoUrl
        }
      };
    }

    // Create provider with BasedAI RPC
    const provider = new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/');
    
    // Create contract instances
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Use the correct marketplace address for BasedAI
    const marketplaceAddress = '0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc'; 
    const marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
    
    // Fetch on-chain data with better error handling
    let tokenURI = '';
    let owner = '';
    let listing = null;
    
    // Try to get owner - this is crucial for proper NFT display
    try {
      console.log(`[fetchNFTMetadata] Fetching owner for token ${tokenId}...`);
      owner = await nftContract.ownerOf(tokenId);
      console.log(`[fetchNFTMetadata] ✅ Owner found for token ${tokenId}: ${owner}`);
    } catch (e: any) {
      console.error(`[fetchNFTMetadata] ❌ Owner call failed for token ${tokenId}:`, e.message);
      // For LifeNodes specifically, this might indicate the token doesn't exist
      if (contractAddress.toLowerCase() === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21') {
        console.warn(`[fetchNFTMetadata] LifeNodes token ${tokenId} may not exist on-chain`);
        return null; // Return null instead of fake data for non-existent tokens
      }
      owner = '0x0000000000000000000000000000000000000000'; // Zero address as fallback for other collections
    }
    
    try {
      console.log(`[fetchNFTMetadata] Fetching tokenURI for token ${tokenId}...`);
      tokenURI = await nftContract.tokenURI(tokenId);
      console.log(`[fetchNFTMetadata] ✅ TokenURI found for token ${tokenId}: ${tokenURI.substring(0, 100)}...`);
    } catch (e: any) {
      console.warn(`[fetchNFTMetadata] TokenURI call failed for token ${tokenId}:`, e.message);
      tokenURI = ''; // Empty string as fallback
    }
    
    // Try to get listing info
    try {
      listing = await marketplaceContract.getListing(contractAddress, tokenId);
      if (listing && BigInt(listing.price) > BigInt(0)) {
        console.log(`[fetchNFTMetadata] ✅ Listing found for token ${tokenId}: ${ethers.formatEther(listing.price)} BASED`);
      }
    } catch (e) {
      // Silently fail - listings may not exist for every token
      listing = null;
    }
    
    // If owner is zero address and this is not a test, return null
    if (owner === '0x0000000000000000000000000000000000000000' && !isTestCollection) {
      console.warn(`[fetchNFTMetadata] Token ${tokenId} has zero address owner, likely doesn't exist`);
      return null;
    }
    
    // First, try to get a collection-based image URL
    let imageUrl = generateNFTImageUrl(contractAddress, tokenId);
    let name = basedCollection ? `${basedCollection.name} #${tokenId}` : `${contractAddress.substring(0, 6)}... #${tokenId}`;
    let description = basedCollection ? `${basedCollection.name} NFT #${tokenId}` : '';
    let attributes = [];
    
    // Process metadata from tokenURI if available
    let metadata = {
      name: name,
      description: description,
      image: imageUrl,
      attributes: []
    };
    
    if (tokenURI) {
      // Convert IPFS URLs to HTTP gateway URLs
      if (tokenURI.startsWith('ipfs://')) {
        tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      try {
        console.log(`[fetchNFTMetadata] Fetching metadata from URI for token ${tokenId}...`);
        const response = await fetch(tokenURI);
        const data = await response.json();
        
        // Use data from tokenURI but keep our generated image as fallback
        metadata = { 
          ...metadata, 
          ...data,
          // Sanitize the image URL to block basedai.art and handle IPFS
          image: sanitizeImageUrl(data.image, contractAddress, tokenId)
        };
        console.log(`[fetchNFTMetadata] ✅ Metadata fetched from URI for token ${tokenId}`);
      } catch (e) {
        console.warn(`[fetchNFTMetadata] Failed to fetch or parse metadata from ${tokenURI}: ${e}`);
        // Keep fallback metadata
      }
    }
    
    // Final sanitization of the image URL before creating final NFT data
    metadata.image = sanitizeImageUrl(metadata.image, contractAddress, tokenId);
    
    // Add contract and token info to the metadata, structured for NftCard
    const finalNftData = {
      ...metadata, // Spread original metadata (name, image, attributes etc.)
      tokenId: Number(tokenId),
      owner: owner,
      displayOwner: `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`,
      isListed: !!listing && BigInt(listing.price) > BigInt(0),
      collection: {
        contract: contractAddress,
      }
    };
    
    // Add listing info if available
    if (listing && BigInt(listing.price) > BigInt(0)) {
      (finalNftData as any).price = ethers.formatEther(listing.price);
      (finalNftData as any).listing = {
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        listedAt: Number(listing.listedAt),
        expiresAt: Number(listing.expiresAt),
        privateBuyer: listing.privateBuyer,
        paymentToken: listing.paymentToken,
      };
    }
    
    console.log(`[fetchNFTMetadata] ✅ Successfully fetched complete metadata for token ${tokenId}`);
    return finalNftData;
  } catch (error: any) {
    console.error(`[fetchNFTMetadata] ❌ Error fetching NFT metadata for token ${tokenId}:`, error.message);
    return null;
  }
}

/**
 * Fetches metadata for multiple NFTs
 * @param contractAddress The NFT contract address
 * @param tokenIds Array of token IDs to fetch
 * @param rpcUrl Optional RPC URL
 * @returns Array of NFT metadata objects (only includes successful fetches, null for non-existent tokens)
 */
export async function fetchMultipleNFTMetadata(
  contractAddress: string,
  tokenIds: Array<number | string>,
  rpcUrl: string = DEFAULT_RPC_URL
) {
  // Only use mock data for test collections
  const isTestCollection = contractAddress.toLowerCase() === "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Add more if needed
  let basedCollection: ReturnType<typeof getBasedCollectionDetails> | undefined = undefined;
  if (isTestCollection) {
    basedCollection = getBasedCollectionDetails(contractAddress);
    if (!basedCollection) {
      return null;
    } else {
      const { name, logoUrl } = basedCollection;
      console.log(`Using static data for collection ${name} - generating mock NFTs`);
      // Generate mock data for all tokens
      const mockNfts = tokenIds.map(tokenId => ({
        name: `${name} #${tokenId}`,
        description: `${name} NFT #${tokenId}`,
        image: `https://picsum.photos/seed/${contractAddress}${tokenId}/500/500`,
        tokenId: Number(tokenId),
        owner: '0x0000000000000000000000000000000000000000',
        displayOwner: '0x000...0000',
        isListed: Math.random() > 0.7, // 30% chance of being listed
        price: Math.random() > 0.7 ? (0.1 + Math.random() * 2).toFixed(2) : undefined,
        attributes: [
          { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Yellow', 'Purple'][Number(tokenId) % 5] },
          { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Number(tokenId) % 5] }
        ],
        collection: {
          name: name,
          contract: contractAddress,
          logo: logoUrl
        }
      }));
      return mockNfts;
    }
  }
  
  // Get collection metadata
  basedCollection = getBasedCollectionDetails(contractAddress);
  
  // Create promises for each token
  const promises = tokenIds.map(id => 
    fetchNFTMetadata(contractAddress, id, rpcUrl)
      .catch(() => null) // Catch errors per token
  );
  
  try {
    // Wait for all promises to settle
    const results = await Promise.allSettled(promises);
    
    // Process results - keep null for failed/non-existent tokens
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        return result.value;
      }
      // Return null for failed tokens (indicates non-existence)
      console.log(`[fetchMultipleNFTMetadata] Token ${tokenIds[index]} failed to fetch or doesn't exist`);
      return null;
    });
    
    return processedResults;
  } catch (error) {
    console.error(`Error in fetchMultipleNFTMetadata: ${error}`);
    // Return array of nulls if the overall operation fails
    return tokenIds.map(() => null);
  }
}

/**
 * Calculate a rarity score for an NFT based on its traits
 * A higher score means the NFT is more rare
 * 
 * @param traits Array of trait objects with trait_type, value and rarity percentage
 * @returns Rarity score number
 */
export function calculateRarityScore(traits: any[]): number {
  if (!traits || traits.length === 0) return 0;
  
  // For each trait, the rarer it is, the higher its contribution to the score
  // Formula: Sum of (1 / traitRarityPercentage) for each trait
  let score = 0;
  
  traits.forEach(trait => {
    // Get the trait rarity percentage (how many NFTs have this trait)
    const rarityPercentage = trait.rarity || 0;
    
    // Avoid division by zero
    if (rarityPercentage > 0) {
      // The rarer the trait (lower percentage), the higher its contribution
      score += 100 / rarityPercentage;
    }
  });
  
  return parseFloat(score.toFixed(2));
}

/**
 * Fetch NFTs with pagination and listing status
 */
export async function fetchNFTsWithPagination(
  collectionAddress: string,
  page: number = 1,
  itemsPerPage: number = 20,
  provider?: any
): Promise<{
  nfts: any[];
  totalItems: number;
  hasMore: boolean;
}> {
  try {
    console.log(`[NFTUtils] Fetching NFTs for collection ${collectionAddress}, page ${page}`);
    
    // First, get the total supply to know how many NFTs exist
    const contractABI = ['function totalSupply() view returns (uint256)'];
    const nftContract = new (await import('ethers')).ethers.Contract(collectionAddress, contractABI, provider);
    
    let totalSupply: number;
    try {
      const totalSupplyBN = await nftContract.totalSupply();
      totalSupply = Number(totalSupplyBN);
      console.log(`[NFTUtils] Total supply: ${totalSupply}`);
    } catch (error) {
      console.warn('[NFTUtils] Could not get total supply, using fallback');
      totalSupply = 1000; // Fallback estimate
    }
    
    // Calculate which token IDs to fetch for this page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalSupply);
    
    if (startIndex >= totalSupply) {
      return {
        nfts: [],
        totalItems: totalSupply,
        hasMore: false
      };
    }
    
    // Try different token ID patterns based on what we know about the collection
    let tokenIds: number[] = [];
    
    // Pattern 1: Sequential from 1 (most common)
    if (startIndex === 0) {
      tokenIds = Array.from({ length: endIndex - startIndex }, (_, i) => i + 1);
    } else {
      tokenIds = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i + 1);
    }
    
    console.log(`[NFTUtils] Fetching token IDs: ${tokenIds[0]} to ${tokenIds[tokenIds.length - 1]}`);
    
    // Fetch NFT metadata
    const nftsData = await fetchMultipleNFTMetadata(collectionAddress, tokenIds);
    
    // Check if nftsData is null or empty
    if (!nftsData || nftsData.length === 0) {
      return {
        nfts: [],
        totalItems: totalSupply,
        hasMore: false
      };
    }
    
    // Get listing information for these NFTs
    const { getListingInfo } = await import('../lib/services/marketplaceService');
    
    // Process NFTs with listing information
    const processedNFTs = await Promise.all(
      nftsData.map(async (nft, index) => {
        if (!nft) return null;
        
        const tokenId = tokenIds[index];
        let listingInfo = null;
        let isListed = false;
        let price = undefined;
        
        // Try to get listing info from marketplace
        try {
          if (provider) {
            listingInfo = await getListingInfo(collectionAddress, tokenId, provider);
            if (listingInfo && listingInfo.price && Number(listingInfo.price) > 0) {
              isListed = true;
              price = parseFloat((await import('ethers')).ethers.formatEther(listingInfo.price));
            }
          }
        } catch (error) {
          console.log(`[NFTUtils] No listing info for token ${tokenId}`);
        }
        
        // Also check if the NFT data itself contains listing info
        if (!isListed && nft.isListed && 'price' in nft && nft.price) {
          isListed = true;
          price = typeof nft.price === 'string' ? parseFloat(nft.price) : nft.price;
        }
        
        return {
          id: tokenId,
          tokenId,
          name: nft.name || `#${tokenId}`,
          image: nft.image || `https://picsum.photos/seed/${collectionAddress}${tokenId}/500/500`,
          owner: nft.owner || '0x0000000000000000000000000000000000000000',
          isListed,
          price,
          seller: listingInfo?.seller || ('seller' in nft ? nft.seller : undefined),
          collection: {
            name: 'Collection', // This should be set by the caller
            contract: collectionAddress
          }
        };
      })
    );
    
    // Filter out null entries
    const validNFTs = processedNFTs.filter(nft => nft !== null);
    
    return {
      nfts: validNFTs,
      totalItems: totalSupply,
      hasMore: endIndex < totalSupply
    };
    
  } catch (error) {
    console.error('[NFTUtils] Error fetching NFTs with pagination:', error);
    return {
      nfts: [],
      totalItems: 0,
      hasMore: false
    };
  }
} 