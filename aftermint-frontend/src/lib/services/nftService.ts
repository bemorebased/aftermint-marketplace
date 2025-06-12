import { ethers } from 'ethers';
import MockNFTAbi from '../abis/MockNFT.json';

// Add this type definition near the top of the file, before the function
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<any>;
  [key: string]: any; // For any additional properties
}

// Minimal ERC721 ABI for our interactions
const ERC721_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)'
];

// BasedAI deployed contract addresses
export const MARKETPLACE_ADDRESS = '0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc'; // Marketplace proxy
export const MARKETPLACE_IMPLEMENTATION = '0x0bA94EE4F91203471A37C2cC36be04872671C22e'; // Implementation
export const MARKETPLACE_STORAGE_ADDRESS = '0x22456dA8e1CaCB25edBA86403267B4F13900AdF1'; // Storage proxy
export const LIFENODES_NFT_ADDRESS = '0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21'; // LifeNodes NFT
export const MARKETPLACE_OWNER = '0xdeE6158B387604a84e2defA2FDd88aB3acaaAc1c'; // Owner address
export const CURRENT_OWNER = '0xdeE6158B387604a84e2defA2FDd88aB3acaaAc1c'; // Current deployer/owner

// NFT_COLLECTIONS mapping for known BasedAI collections
export const NFT_COLLECTIONS: {[address: string]: {name: string, logo?: string, contract?: string, abi?: any}} = {
  '0x22456da8e1cacb25edba86403267b4f13900adf1': { 
    name: 'BasedLifeNodes', 
    logo: '/placeholder-nft.png',
    contract: '0x22456da8e1cacb25edba86403267b4f13900adf1',
    abi: ERC721_ABI
  },
  '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21': {
    name: 'LifeNodes',
    logo: 'https://i.imgur.com/HKw5cGh.jpg',
    contract: '0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21',
    abi: ERC721_ABI
  }
};

// For testing with real NFTs, let's use the LifeNodes NFT contract
export const MOCK_NFT_ADDRESS = LIFENODES_NFT_ADDRESS;

// BasedAI Chain configuration
export const BASEDAI_CHAIN_ID = 32323;
export const BASEDAI_EXPLORER_API = "https://explorer.bf1337.org/api/v2";

// Enhanced provider function with fallback - prioritizes window.ethereum to avoid CORS
export const getBasedAIProvider = () => {
  try {
    // For browser environments, ALWAYS use the user's wallet provider when available
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('[nftService] ✅ Using window.ethereum BrowserProvider to avoid CORS');
      return new ethers.BrowserProvider(window.ethereum);
    }
    
    // Check if we're in server-side rendering environment
    if (typeof window === 'undefined') {
      console.log('[nftService] 🔄 SSR environment detected, creating JsonRpcProvider for SSR');
      // Return a provider but don't try to connect during SSR
      return new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/', {
        name: 'BasedAI',
        chainId: 32323
      });
    }
    
    // If no wallet available, throw error instead of trying direct RPC
    console.error('[nftService] ❌ No wallet provider available - direct RPC calls blocked by CORS');
    throw new Error('Please connect your wallet to interact with the blockchain. Direct RPC calls are blocked by CORS policy.');
    
  } catch (error) {
    console.error('Error creating provider:', error);
    // If window.ethereum exists but fails, try it again instead of falling back to RPC
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('[nftService] 🔄 Retrying with window.ethereum after error');
      return new ethers.BrowserProvider(window.ethereum);
    }
    
    // Only for SSR - never for browser
    if (typeof window === 'undefined') {
      return new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/', {
        name: 'BasedAI',
        chainId: 32323
      });
    }
    
    throw new Error('Could not create blockchain provider. Please connect your wallet.');
  }
};

// Alternative function to get contract data via Explorer API (CORS-friendly)
export const getContractInfoViaExplorer = async (contractAddress: string) => {
  try {
    const response = await fetch(`${BASEDAI_EXPLORER_API}/addresses/${contractAddress}`);
    if (!response.ok) {
      throw new Error(`Explorer API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Explorer API failed:', error);
    return null;
  }
};

// Get total supply via Explorer API
export const getTotalSupplyViaExplorer = async (contractAddress: string): Promise<number | null> => {
  try {
    const response = await fetch(`${BASEDAI_EXPLORER_API}/tokens/${contractAddress}`);
    if (!response.ok) {
      throw new Error(`Explorer API error: ${response.status}`);
    }
    const data = await response.json();
    return data.total_supply ? parseInt(data.total_supply) : null;
  } catch (error) {
    console.warn('Explorer API total supply failed:', error);
    return null;
  }
};

/**
 * Creates an instance of the NFT contract using the ERC721 interface
 */
export function getNFTContract(
  contractAddress: string,
  provider: ethers.JsonRpcProvider | ethers.AbstractProvider, // Use JsonRpcProvider or AbstractProvider
  signerOrProvider: ethers.Signer | ethers.JsonRpcProvider | ethers.AbstractProvider = provider // Consistent types
) {
  // Determine ABI: use specific ABI if available, otherwise fallback to MockNFTAbi
  const collectionKey = contractAddress.toLowerCase();
  const specificAbi = NFT_COLLECTIONS[collectionKey]?.abi;
  const abiToUse = specificAbi || MockNFTAbi.abi;

  return new ethers.Contract(
    contractAddress,
    abiToUse, 
    signerOrProvider
  );
}

// Update the getNFTMetadata function to handle CORS errors
export async function getNFTMetadata(contractAddress: string, tokenId: string | number): Promise<NFTMetadata> {
  try {
    console.log(`[getNFTMetadata] Fetching metadata for ${contractAddress} #${tokenId}`);
    const contractAddrLower = contractAddress.toLowerCase();
    
    // Try to get collection details first to identify the NFT collection
    const basedCollection = NFT_COLLECTIONS[contractAddrLower];
    
    // If this is a LifeNodes NFT, use appropriate metadata
    if (contractAddrLower === LIFENODES_NFT_ADDRESS.toLowerCase()) {
      const tokenIdNum = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
      
      let imageUrl = '';
      if (tokenIdNum === 446) {
        imageUrl = 'https://i.imgur.com/HKw5cGh.jpg'; // Special image for #446
      } else {
        // Use a deterministic image based on tokenId - NO basedai.art URLs
        imageUrl = `https://picsum.photos/seed/lifenode${tokenIdNum}/500/500`;
        }
      
      // Generate node type and rarity based on token ID
      const nodeTypes = ["Standard", "Premium", "Enterprise", "Validator", "Master"];
      const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
      const nodeType = nodeTypes[tokenIdNum % nodeTypes.length];
      const rarity = rarities[tokenIdNum % rarities.length];
      
      return {
        name: `LifeNodes #${tokenIdNum}`,
        description: "A LifeNodes NFT on the BasedAI network. These nodes are part of the BasedAI ecosystem and provide computing resources to the network.",
        image: imageUrl,
        attributes: [
          {
            trait_type: "Node Type",
            value: nodeType
          },
          {
            trait_type: "Rarity",
            value: rarity
          },
          {
            trait_type: "Power",
            value: 50 + (tokenIdNum * 10)
          }
        ],
        collection: {
          name: basedCollection?.name || 'LifeNodes',
          contract: contractAddress,
          logo: basedCollection?.logo || 'https://i.imgur.com/HKw5cGh.jpg'
        }
      };
    }

    // For known BasedAI collections, use a consistent response format
    if (basedCollection) {
      const tokenIdNum = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
      const collectionName = basedCollection.name;
      
      return {
        name: `${collectionName} #${tokenIdNum}`,
        description: `${collectionName} NFT on BasedAI network. Part of the BasedAI ecosystem.`,
        image: basedCollection.logo || `/placeholder-nft.png`,
        attributes: [],
        collection: {
          name: collectionName,
          contract: contractAddress,
          logo: basedCollection.logo
        }
      };
    }

    // Final fallback for any NFT
    return {
      name: `NFT #${tokenId}`,
      description: 'BasedAI NFT',
      image: '/placeholder-nft.png',
      attributes: [],
      collection: {
        name: 'Unknown Collection',
        contract: contractAddress,
        logo: '/placeholder-nft.png'
      }
    };
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return {
      name: `NFT #${tokenId}`,
      description: 'Error loading metadata',
      image: '/placeholder-nft.png',
      attributes: [],
      collection: {
        name: 'Unknown Collection',
        contract: contractAddress,
        logo: '/placeholder-nft.png'
      }
    };
  }
}

/**
 * Fetches all NFTs owned by a specific address from any known collection
 */
export async function getNFTsForOwner(
  ownerAddress: string,
  wagmiPublicClient: any 
): Promise<Array<{ tokenId: number; contractAddress: string; metadata: any; collection?: any }>> {
  try {
    console.log(`[NFTService] getNFTsForOwner: Starting for owner ${ownerAddress}`);
    
    let ethersProviderForContractInteractions: ethers.JsonRpcProvider | ethers.BrowserProvider = getBasedAIProvider();
    
    if (wagmiPublicClient && typeof wagmiPublicClient.getChainId === 'function') {
      try {
        const currentChainId = await wagmiPublicClient.getChainId();
        console.log(`[NFTService] getNFTsForOwner: Wagmi publicClient is on chain ID: ${currentChainId}`);
        if (currentChainId !== 32323) {
          console.warn(`[NFTService] getNFTsForOwner: Wagmi publicClient is on chain ${currentChainId}, not BasedAI (${32323}). NFT fetching will use direct BasedAI provider regardless.`);
        }
      } catch (e) {
        console.warn("[NFTService] getNFTsForOwner: Could not get chainId from wagmi publicClient.", e);
      }
    } else {
      console.warn("[NFTService] getNFTsForOwner: Wagmi publicClient not provided or doesn't have getChainId.");
    }
    
    const ownedNFTsFromApi = []; // Store NFTs found purely by API here
    const collectionsApiFailedFor = new Set<string>(); // Track collections where API instance fetching failed

    const explorerApiBaseUrl = "https://explorer.bf1337.org/api/v2";

    console.log(`[NFTService] getNFTsForOwner: Attempting to fetch token balances from Explorer API for ${ownerAddress}`);
    try {
      const balancesApiUrl = `${explorerApiBaseUrl}/addresses/${ownerAddress}/token-balances?type=ERC-721`;
      console.log(`[NFTService] getNFTsForOwner: Calling Explorer Balances API: ${balancesApiUrl}`);
      const userTokensResponse = await fetch(balancesApiUrl);
      
      if (!userTokensResponse.ok) {
        console.error(`[NFTService] getNFTsForOwner: Explorer API error fetching token balances: ${userTokensResponse.status} ${userTokensResponse.statusText}. URL: ${balancesApiUrl}`);
        throw new Error('Explorer API token balances fetch failed, proceeding to full fallback.'); 
      }
      const balances = await userTokensResponse.json();
      console.log("[NFTService] getNFTsForOwner: Fetched token balances from explorer:", JSON.stringify(balances, null, 2));

      if (!balances || balances.length === 0) {
        console.log("[NFTService] getNFTsForOwner: Explorer API reported no ERC-721 token balances for this address.");
      }

      for (const balance of balances) {
        const collectionAddress = balance.token?.address?.toLowerCase();
        if (!collectionAddress) {
          console.warn("[NFTService] getNFTsForOwner: Skipping balance entry with no token address:", balance);
          continue;
        }

        const collectionDetailsFromConstant = NFT_COLLECTIONS[collectionAddress];
        const collectionInfo = collectionDetailsFromConstant || {
            name: balance.token?.name || 'Unknown Collection',
            contract: collectionAddress,
            logo: balance.token?.icon_url || `https://picsum.photos/seed/${collectionAddress}/200/200`,
            abi: null
        };

        if (!collectionInfo.contract) {
            console.warn(`[NFTService] getNFTsForOwner: Skipping balance entry with no contract in collectionInfo for address ${collectionAddress}:`, balance);
            continue;
        }
        if (!balance.value || parseInt(balance.value) === 0) {
          console.log(`[NFTService] getNFTsForOwner: Explorer reports zero balance for ${collectionInfo.name} (${collectionAddress}). Skipping.`);
          continue; 
        }

        console.log(`[NFTService] getNFTsForOwner: User has a balance in ${collectionInfo.name} (${collectionAddress}). Value: ${balance.value}. Fetching instances...`);

        try {
            // Corrected API URL: removed invalid holder_address_hash parameter
            const instancesApiUrl = `${explorerApiBaseUrl}/tokens/${collectionAddress}/instances`;
            console.log(`[NFTService] getNFTsForOwner: Calling Explorer Instances API: ${instancesApiUrl}`);
            
            // Implement pagination if needed, for now, assume the default first page is enough or handle it later.
            // The API might return a `next_page_params` object if there are more items.
            const instancesResponse = await fetch(instancesApiUrl);

            if (!instancesResponse.ok) {
                console.error(`[NFTService] getNFTsForOwner: Explorer API error fetching instances for ${collectionAddress}: ${instancesResponse.status} ${instancesResponse.statusText}. URL: ${instancesApiUrl}`);
                collectionsApiFailedFor.add(collectionAddress); // Mark this collection for on-chain fallback
                continue; 
            }
            const instancesData = await instancesResponse.json();
            const tokenInstances = instancesData.items || [];

            console.log(`[NFTService] getNFTsForOwner: Found ${tokenInstances.length} instances for ${collectionInfo.name} via explorer API. Filtering for owner ${ownerAddress}...`);

            for (const instance of tokenInstances) {
                // Client-side filter for owner
                if (!instance.owner || instance.owner.hash?.toLowerCase() !== ownerAddress.toLowerCase()) {
                    // console.log(`[NFTService] getNFTsForOwner: Instance ${instance.id} for ${collectionInfo.name} not owned by ${ownerAddress}. Owner: ${instance.owner?.hash}`);
                    continue;
                }

                if (!instance.id) { // Assuming instance.id is the tokenId string
                  console.warn(`[NFTService] getNFTsForOwner: Skipping instance with no ID for ${collectionInfo.name}:`, instance);
                  continue; 
                }
                const tokenId = parseInt(instance.id, 10); 
                if (isNaN(tokenId)) {
                  console.warn(`[NFTService] getNFTsForOwner: Failed to parse tokenId \'${instance.id}\' for ${collectionInfo.name}. Skipping.`);
                  continue;
                }

                console.log(`[NFTService] getNFTsForOwner: Processing owned instance tokenId ${tokenId} for ${collectionInfo.name} via API`);
                try {
                    const metadata = await getNFTMetadata(collectionAddress, tokenId);
                    if (metadata) {
                        console.log(`[NFTService] getNFTsForOwner: Successfully fetched API metadata for ${collectionInfo.name} #${tokenId}`);
                        ownedNFTsFromApi.push({ 
                            tokenId: tokenId,
                            contractAddress: collectionAddress,
                            metadata: metadata,
                            collection: collectionInfo 
                        });
                    } else {
                        console.warn(`[NFTService] getNFTsForOwner: API Metadata not found for ${collectionInfo.name} #${tokenId}`);
                    }
                } catch (metadataError) {
                    console.error(`[NFTService] getNFTsForOwner: Error fetching API metadata for ${collectionInfo.name} #${tokenId}:`, metadataError);
                }
            }
        } catch (instancesError) {
          console.error(`[NFTService] getNFTsForOwner: Failed to fetch or process instances for ${collectionAddress} from explorer:`, instancesError);
          collectionsApiFailedFor.add(collectionAddress); // Mark for fallback
        }
      }
    } catch (explorerError) {
      console.warn(`[NFTService] getNFTsForOwner: Explorer API strategy failed or had issues. Error: ${explorerError}. All predefined collections will be checked on-chain.`);
      // If balances API fails, all predefined collections become candidates for fallback.
      Object.keys(NFT_COLLECTIONS).forEach(addr => collectionsApiFailedFor.add(addr.toLowerCase()));
    }

    const finalOwnedNFTs = [...ownedNFTsFromApi];
    const processedByFallback = new Set<string>();


    // Fallback logic: Iterate through predefined NFT_COLLECTIONS
    console.log("[NFTService] getNFTsForOwner: Executing fallback for predefined NFT_COLLECTIONS or those that failed API instance fetch.");
    for (const collectionAddrKey of Object.keys(NFT_COLLECTIONS)) {
      const collectionKeyLower = collectionAddrKey.toLowerCase();
      // Only run fallback if it's a known collection that API failed for, or if API failed entirely, or if it wasn't processed by API successfully
      const shouldFallbackForThisCollection = collectionsApiFailedFor.has(collectionKeyLower) || 
                                              !ownedNFTsFromApi.some(nft => nft.contractAddress === collectionKeyLower);

      if (!shouldFallbackForThisCollection && ownedNFTsFromApi.some(nft => nft.contractAddress === collectionKeyLower)) {
        console.log(`[NFTService] Fallback: Skipping ${collectionKeyLower}, already processed by API successfully.`);
        continue;
      }
      
      if (processedByFallback.has(collectionKeyLower)) continue; // Avoid reprocessing if already handled due to broad failure

      const collectionInfo = NFT_COLLECTIONS[collectionKeyLower]; 
      
      if (!collectionInfo || !collectionInfo.contract) {
        console.warn(`[NFTService] Fallback: Skipping invalid collection info for key: ${collectionKeyLower}`);
        continue;
      }
      const collectionAddr = collectionInfo.contract.toLowerCase(); // Ensure consistency

      // If the API failed for this specific collection, or if the balances API failed entirely, try on-chain.
      console.log(`[NFTService] Fallback: Needs on-chain check for ${collectionInfo.name} (${collectionAddr})`);
      processedByFallback.add(collectionAddr);


      try {
        console.log(`[NFTService] Fallback: Checking collection ${collectionInfo.name} (${collectionAddr}) for NFTs owned by ${ownerAddress}`);
        const nftContract = getNFTContract(collectionAddr, ethersProviderForContractInteractions);
        
        console.log(`[NFTService] Fallback: Calling balanceOf for ${collectionInfo.name}`);
        let tokenCount = 0;
        try {
          const balance = await nftContract.balanceOf(ownerAddress);
          tokenCount = Number(balance);
          console.log(`[NFTService] Fallback: Found ${tokenCount} tokens in ${collectionInfo.name} owned by ${ownerAddress}. ABI available: ${!!collectionInfo.abi}`);
        } catch (balanceError) {
          console.warn(`[NFTService] Fallback: Error calling balanceOf for ${collectionInfo.name}:`, balanceError);
          // Continue to next collection if we can't get the balance
          continue;
        }
        
        if (tokenCount === 0) {
          console.log(`[NFTService] Fallback: No tokens found in ${collectionInfo.name} for ${ownerAddress}`);
          continue;
        }

        let ownedTokenIdsInCollection: number[] = [];
        
        const specificAbi = collectionInfo.abi;
        // We use `getNFTContract` which internally resolves the ABI.
        // Re-creating contractToCheck directly was redundant if getNFTContract is robust.
        // const contractToCheck = new ethers.Contract(collectionAddr, specificAbi || MockNFTAbi.abi, ethersProviderForContractInteractions);

        if (specificAbi && typeof (nftContract as any).tokenOfOwnerByIndex === 'function') {
          console.log(`[NFTService] Fallback: Attempting enumeration for ${collectionInfo.name} using tokenOfOwnerByIndex.`);
          for (let i = 0; i < tokenCount; i++) {
            try {
              const tokenIdBigInt = await (nftContract as any).tokenOfOwnerByIndex(ownerAddress, i);
              ownedTokenIdsInCollection.push(Number(tokenIdBigInt));
            } catch (enumSingleError) {
              console.error(`[NFTService] Fallback: Error during tokenOfOwnerByIndex for ${collectionInfo.name}, index ${i}:`, enumSingleError);
            }
          }
          console.log(`[NFTService] Fallback: Enumeration for ${collectionInfo.name} found token IDs: ${ownedTokenIdsInCollection.join(', ')}`);
        } else {
          console.warn(`[NFTService] Fallback: tokenOfOwnerByIndex not available or no specific ABI for ${collectionInfo.name}. Attempting scan.`);
          let checkedTokens = 0;
          let currentTokenId = 0; 
          const MAX_SCAN_ATTEMPTS = Math.min(tokenCount * 5, 100); 
          console.log(`[NFTService] Fallback: Starting scan for ${collectionInfo.name}. Max attempts: ${MAX_SCAN_ATTEMPTS}`);
          
          for (currentTokenId = 0; currentTokenId < MAX_SCAN_ATTEMPTS && ownedTokenIdsInCollection.length < tokenCount; currentTokenId++) {
            try {
              const ownerOfToken = await (nftContract as any).ownerOf(currentTokenId);
              if (ownerOfToken.toLowerCase() === ownerAddress.toLowerCase()) {
                ownedTokenIdsInCollection.push(currentTokenId);
                console.log(`[NFTService] Fallback Scan: Found token ${currentTokenId} for ${collectionInfo.name}`);
              }
            } catch (scanError) {
              // console.debug(`[NFTService] Fallback Scan: Error checking ownerOf token ${currentTokenId} for ${collectionInfo.name} (may be normal):`, scanError);
            }
            checkedTokens++;
            if (checkedTokens >= MAX_SCAN_ATTEMPTS) {
                console.log(`[NFTService] Fallback Scan: Reached MAX_SCAN_ATTEMPTS for ${collectionInfo.name}. Found ${ownedTokenIdsInCollection.length}/${tokenCount} tokens so far.`);
                break;
            }
          }
           if (ownedTokenIdsInCollection.length < tokenCount && tokenCount > 0) { // only warn if we expected tokens
                console.warn(`[NFTService] Fallback Scan: Scan for ${collectionInfo.name} might be incomplete. Found ${ownedTokenIdsInCollection.length} of ${tokenCount} expected tokens after ${checkedTokens} checks.`);
            } else if (tokenCount > 0) {
                console.log(`[NFTService] Fallback Scan: Successfully found all ${tokenCount} tokens for ${collectionInfo.name}.`);
            }
        }

        for (const tokenId of ownedTokenIdsInCollection) {
          // Avoid adding duplicates if API somehow got it but was marked for fallback due to other issues
          if (finalOwnedNFTs.some(nft => nft.contractAddress === collectionAddr && nft.tokenId === tokenId)) {
            console.log(`[NFTService] Fallback: Skipping duplicate token ${collectionInfo.name} #${tokenId} already found by API.`);
            continue;
          }
          try {
            console.log(`[NFTService] Fallback: Fetching metadata for ${collectionInfo.name} #${tokenId}`);
            const metadata = await getNFTMetadata(collectionAddr, tokenId);
            if (metadata) {
              console.log(`[NFTService] Fallback: Successfully fetched metadata for ${collectionInfo.name} #${tokenId}`);
              finalOwnedNFTs.push({ tokenId, contractAddress: collectionAddr, metadata, collection: collectionInfo });
            } else {
              console.warn(`[NFTService] Fallback: Metadata not found for ${collectionInfo.name} #${tokenId}`);
            }
          } catch (metadataError) {
            console.error(`[NFTService] Fallback: Error fetching metadata for ${collectionInfo.name} #${tokenId}:`, metadataError);
          }
        }
      } catch (collectionError) {
        console.error(`[NFTService] Fallback: Error processing collection ${collectionInfo?.name || collectionAddrKey}:`, collectionError);
      }
    }

    // Deduplicate final list (though logic above tries to prevent it earlier)
    const uniqueNFTs = finalOwnedNFTs.filter((nft, index, self) => 
        index === self.findIndex((t) => (
            t.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase() && t.tokenId === nft.tokenId
        ))
    );

    if (uniqueNFTs.length === 0) {
        console.warn(`[NFTService] getNFTsForOwner: No NFTs found for ${ownerAddress} after all strategies.`);
    } else {
        console.log(`[NFTService] getNFTsForOwner: Finished. Returning ${uniqueNFTs.length} unique NFTs for ${ownerAddress}.`, uniqueNFTs);
    }
    return uniqueNFTs;
  } catch (error) {
    console.error(`[NFTService] getNFTsForOwner: CRITICAL ERROR in getNFTsForOwner for ${ownerAddress}:`, error);
    return []; 
  }
}

/**
 * Gets all NFTs, optionally filtered by owner
 * For a real contract with many tokens, this would need to be paginated
 */
export async function getAllNFTs(
  // Changed to accept both provider types as getBasedAIProvider can return either
  provider: ethers.JsonRpcProvider | ethers.BrowserProvider, 
  limit = 20
): Promise<{ tokenId: number; metadata: any }[]> {
  try {
    const nfts = [];
    for (let tokenId = 1; tokenId < limit + 1; tokenId++) {
      try {
        // getNFTContract now expects JsonRpcProvider or AbstractProvider
        const metadata = await getNFTMetadata(MOCK_NFT_ADDRESS, tokenId);
        nfts.push({ tokenId, metadata });
      } catch (error) {
        continue;
      }
    }
    return nfts;
  } catch (error) {
    console.error('Error fetching all NFTs:', error);
    return [];
  }
} 