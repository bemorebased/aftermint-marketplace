import { ethers } from 'ethers';

// Minimal ERC721 ABI
const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)'
];

// Simple ABI just to check token listings
const MARKETPLACE_ABI = [
  'function getListing(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, uint64 listedAt, uint64 expiresAt, address privateBuyer, address paymentToken))'
];

export interface NFTData {
  id: number;
  name: string;
  image: string;
  description?: string;
  owner: string;
  displayOwner: string;
  tokenURI: string;
  isListed: boolean;
  price?: string;
  listing?: {
    seller: string;
    price: string;
    listedAt: number;
    expiresAt: number;
    privateBuyer: string;
    paymentToken: string;
  };
  tokenId: number;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection: {
    name: string;
    contract: string;
    logo?: string;
  };
}

export interface CollectionData {
  name: string;
  symbol: string;
  totalSupply?: number;
  contract: string;
  description?: string;
  logo?: string;
}

// Create a more fault-tolerant BrowserProvider that handles provider conflicts
function createBrowserProvider() {
  return new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/');
}

export async function loadCollectionData(contractAddress: string): Promise<CollectionData | null> {
  try {
    // Use our safer provider creation function
    const provider = createBrowserProvider();
    
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Use Promise.allSettled to handle potential failures for each call
    const [nameResult, symbolResult, totalSupplyResult] = await Promise.allSettled([
      nftContract.name?.() || Promise.resolve("Unknown Collection"),
      nftContract.symbol?.() || Promise.resolve("NFT"),
      nftContract.totalSupply?.() || Promise.resolve(0)
    ]);
    
    // Extract results or fallbacks for each promise
    const name = nameResult.status === "fulfilled" ? nameResult.value : "Unknown Collection";
    const symbol = symbolResult.status === "fulfilled" ? symbolResult.value : "NFT";
    const totalSupply = totalSupplyResult.status === "fulfilled" ? 
      typeof totalSupplyResult.value === 'bigint' ? 
        Number(totalSupplyResult.value) : totalSupplyResult.value : 0;
    
    return {
      name,
      symbol,
      totalSupply,
      contract: contractAddress,
      // These fields would come from external metadata sources
      description: `Collection of NFTs on the blockchain.`,
      logo: `https://picsum.photos/seed/${contractAddress}/200/200`, // Placeholder
    };
  } catch (error) {
    console.error(`Error loading collection data for ${contractAddress}:`, error);
    // Return fallback data even on error
    return {
      name: "Unnamed Collection",
      symbol: "NFT",
      contract: contractAddress,
      description: "A collection of NFTs.",
      logo: `https://picsum.photos/seed/${contractAddress}/200/200`, // Placeholder
    };
  }
}

export async function loadNFTData(contractAddress: string, tokenId: number): Promise<NFTData | null> {
  try {
    const provider = createBrowserProvider();
    
    const nftContract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
    
    // Marketplace contract (would need to be populated with your actual marketplace address)
    const marketplaceAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'; // Example
    const marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
    
    // Fetch token data
    let tokenURI = '';
    let owner = '';
    let listing = null;
    
    try {
      tokenURI = await nftContract.tokenURI(tokenId);
      owner = await nftContract.ownerOf(tokenId);
    } catch (err) {
      console.warn(`Failed to fetch basic NFT data for token ${tokenId}:`, err);
      // Set fallback values
      tokenURI = '';
      owner = '0x0000000000000000000000000000000000000000';
    }
    
    // Try to get the listing info, but don't fail if it doesn't exist
    try {
      listing = await marketplaceContract.getListing(contractAddress, tokenId);
    } catch (err) {
      // Not listed, or error getting listing
      listing = null;
    }
    
    // Process the tokenURI
    let metadata = {
      name: `NFT #${tokenId}`,
      image: `https://picsum.photos/seed/${contractAddress}${tokenId}/500/500`, // Placeholder
      description: '',
      attributes: []
    };
    
    if (tokenURI) {
      if (tokenURI.startsWith('ipfs://')) {
        tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      try {
        const response = await fetch(tokenURI);
        const data = await response.json();
        metadata = { ...metadata, ...data };
        
        // Normalize image URI
        if (metadata.image && metadata.image.startsWith('ipfs://')) {
          metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
      } catch (err) {
        console.warn(`Error fetching metadata from ${tokenURI}:`, err);
        // Use fallback metadata already created
      }
    }
    
    // Create the NFTData object
    const nftData: NFTData = {
      id: tokenId,
      tokenId: tokenId,
      name: metadata.name,
      image: metadata.image,
      description: metadata.description,
      owner: owner,
      displayOwner: `${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`,
      tokenURI: tokenURI,
      isListed: !!listing && listing.price > BigInt(0),
      attributes: metadata.attributes,
      collection: {
        name: "Collection", // Would need to fetch from elsewhere
        contract: contractAddress,
        logo: `https://picsum.photos/seed/${contractAddress}/200/200`, // Placeholder
      }
    };
    
    // Add listing info if available
    if (listing && listing.price > BigInt(0)) {
      nftData.price = ethers.formatEther(listing.price);
      nftData.listing = {
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        listedAt: Number(listing.listedAt),
        expiresAt: Number(listing.expiresAt),
        privateBuyer: listing.privateBuyer,
        paymentToken: listing.paymentToken,
      };
    }
    
    return nftData;
  } catch (error) {
    console.error(`Error loading NFT data for ${contractAddress} ${tokenId}:`, error);
    
    // Return null so the caller knows to handle the error
    return null;
  }
}

export async function loadMultipleNFTs(contractAddress: string, tokenIds: number[]): Promise<NFTData[]> {
  const promises = tokenIds.map(id => loadNFTData(contractAddress, id));
  const results = await Promise.allSettled(promises);
  
  // Filter for successful results and non-null values
  return results
    .filter((result): result is PromiseFulfilledResult<NFTData> => 
      result.status === 'fulfilled' && result.value !== null)
    .map(result => result.value);
}

// Get collection info and a specific number of NFTs for display
export async function fetchCollectionWithNFTs(contractAddress: string, count: number = 20): Promise<{
  collection: CollectionData | null;
  nfts: NFTData[];
}> {
  try {
    const collection = await loadCollectionData(contractAddress);
    
    if (!collection) {
      throw new Error(`Collection ${contractAddress} not found`);
    }
    
    // Generate a range of token IDs to fetch
    const tokenIds = Array.from({ length: Math.min(count, collection.totalSupply || count) }, (_, i) => i);
    
    // Fetch NFTs
    const nfts = await loadMultipleNFTs(contractAddress, tokenIds);
    
    return {
      collection,
      nfts
    };
  } catch (error) {
    console.error("Error fetching collection with NFTs:", error);
    
    // Return a minimal valid object even on error
    return {
      collection: null,
      nfts: []
    };
  }
} 