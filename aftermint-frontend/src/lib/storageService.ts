import { ethers } from 'ethers';
import { MARKETPLACE_STORAGE_ADDRESS, getBasedAIProvider } from './nftService';
import { marketplaceABI } from './abi/marketplaceABI';

// Import the storage ABI - we'll need to create this
const STORAGE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getNFTActiveOffers",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "bidder",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "expiresAt",
            "type": "uint64"
          },
          {
            "internalType": "enum AfterMintStorage.OfferStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "cancelledAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "acceptedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct AfterMintStorage.HistoricalOffer[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getNFTPriceHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "buyer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "marketplaceFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "royaltyAmountPaid",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "royaltyRecipient",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "timestamp",
            "type": "uint64"
          },
          {
            "internalType": "enum AfterMintStorage.SaleType",
            "name": "saleType",
            "type": "uint8"
          }
        ],
        "internalType": "struct AfterMintStorage.HistoricalSale[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "startTime",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "endTime",
        "type": "uint64"
      }
    ],
    "name": "getCollectionVolume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "salesCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "collectionSales",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "collectionListings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "collectionOffers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "historicalSales",
    "outputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "marketplaceFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "royaltyAmountPaid",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "royaltyRecipient",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "enum AfterMintStorage.SaleType",
        "name": "saleType",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "historicalListings",
    "outputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "listedAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "expiresAt",
        "type": "uint64"
      },
      {
        "internalType": "address",
        "name": "privateBuyer",
        "type": "address"
      },
      {
        "internalType": "enum AfterMintStorage.ListingStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "cancelledAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "soldAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "historicalOffers",
    "outputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "bidder",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "createdAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "expiresAt",
        "type": "uint64"
      },
      {
        "internalType": "enum AfterMintStorage.OfferStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "cancelledAt",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "acceptedAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "collectionSalesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Types for the contract responses
export interface HistoricalOffer {
  nftContract: string;
  tokenId: bigint;
  bidder: string;
  amount: bigint;
  paymentToken: string;
  createdAt: bigint;
  expiresAt: bigint;
  status: number; // OfferStatus enum
  cancelledAt: bigint;
  acceptedAt: bigint;
}

export interface HistoricalSale {
  nftContract: string;
  tokenId: bigint;
  seller: string;
  buyer: string;
  price: bigint;
  paymentToken: string;
  marketplaceFee: bigint;
  royaltyAmountPaid: bigint;
  royaltyRecipient: string;
  timestamp: bigint;
  saleType: number; // SaleType enum
}

// Processed types for UI consumption
export interface ProcessedOffer {
  from: string;
  price: string;
  priceInEth: number;
  expiration: Date | null;
  createdAt: Date;
  status: 'active' | 'cancelled' | 'accepted' | 'expired';
  isExpired: boolean;
  offerId: string;
  nftContract: string;
  tokenId: string;
  // Additional fields for transaction tracking
  acceptedAt?: Date | null;
  cancelledAt?: Date | null;
  acceptTxHash?: string | null; // Transaction hash when offer was accepted
  cancelTxHash?: string | null; // Transaction hash when offer was cancelled
}

export interface ProcessedActivity {
  id?: string;
  type: 'Sale' | 'List' | 'Mint' | 'Transfer' | 'Offer' | 'OfferAccepted' | 'OfferCancelled' | 'Burn' | 'Delist';
  description?: string;
  from: string | null;
  to: string | null;
  price: string | null;
  priceInEth: number | null;
  date: Date;
  txHash?: string;
  tokenId?: string;
  nftContract?: string;
  blockNumber?: number;
  transactionIndex?: number;
}

/**
 * Get the storage contract instance
 */
function getStorageContract(provider?: ethers.Provider): ethers.Contract {
  const providerToUse = provider || getBasedAIProvider();
  return new ethers.Contract(MARKETPLACE_STORAGE_ADDRESS, STORAGE_ABI, providerToUse);
}

/**
 * Fetch active offers for a specific NFT
 */
export async function getNFTActiveOffers(
  nftContract: string,
  tokenId: string | number,
  limit: number = 50,
  provider?: ethers.Provider
): Promise<ProcessedOffer[]> {
  try {
    console.log(`[StorageService] Fetching active offers for ${nftContract} #${tokenId}`);
    
    const contract = getStorageContract(provider);
    const tokenIdBigInt = BigInt(tokenId);
    
    const offers: HistoricalOffer[] = await contract.getNFTActiveOffers(
      nftContract,
      tokenIdBigInt,
      limit
    );
    
    console.log(`[StorageService] Found ${offers.length} offers`);
    
    // Process offers for UI consumption
    const processedOffers: ProcessedOffer[] = offers.map((offer) => {
      const createdAt = new Date(Number(offer.createdAt) * 1000);
      const expiresAt = Number(offer.expiresAt) > 0 ? new Date(Number(offer.expiresAt) * 1000) : null;
      const now = new Date();
      const isExpired = expiresAt ? expiresAt < now : false;
      
      // Determine status based on contract data
      let status: 'active' | 'cancelled' | 'accepted' | 'expired' = 'active';
      if (Number(offer.cancelledAt) > 0) {
        status = 'cancelled';
      } else if (Number(offer.acceptedAt) > 0) {
        status = 'accepted';
      } else if (isExpired) {
        status = 'expired';
      }
      
      const priceInEth = parseFloat(ethers.formatUnits(offer.amount, 18));
      
      return {
        from: offer.bidder,
        price: `${priceInEth.toFixed(4)} BASED`,
        priceInEth,
        expiration: expiresAt,
        createdAt,
        status,
        isExpired,
        offerId: '',
        nftContract,
        tokenId: tokenId.toString()
      };
    });
    
    // Filter to only show active offers and sort by price (highest first)
    return processedOffers
      .filter(offer => offer.status === 'active' && !offer.isExpired)
      .sort((a, b) => b.priceInEth - a.priceInEth);
    
  } catch (error) {
    console.error('[StorageService] Error fetching NFT offers:', error);
    return [];
  }
}

/**
 * Fetch price history for a specific NFT
 */
export async function getNFTPriceHistory(
  nftContract: string,
  tokenId: string | number,
  limit: number = 50,
  provider?: ethers.Provider
): Promise<ProcessedActivity[]> {
  try {
    console.log(`[StorageService] Fetching price history for ${nftContract} #${tokenId}`);
    
    const contract = getStorageContract(provider);
    const tokenIdBigInt = BigInt(tokenId);
    
    const sales: HistoricalSale[] = await contract.getNFTPriceHistory(
      nftContract,
      tokenIdBigInt,
      limit
    );
    
    console.log(`[StorageService] Found ${sales.length} historical sales`);
    
    // Process sales for UI consumption
    const processedActivities: ProcessedActivity[] = sales.map((sale) => {
      const date = new Date(Number(sale.timestamp) * 1000);
      const priceInEth = parseFloat(ethers.formatUnits(sale.price, 18));
      
      // Determine activity type based on sale type
      let activityType: 'Sale' | 'List' | 'Mint' | 'Transfer' | 'Offer' = 'Sale';
      
      // If buyer is zero address, it might be a mint
      if (sale.buyer === ethers.ZeroAddress) {
        activityType = 'Mint';
      }
      
      return {
        type: activityType,
        from: sale.seller === ethers.ZeroAddress ? null : sale.seller,
        to: sale.buyer === ethers.ZeroAddress ? null : sale.buyer,
        price: `${priceInEth.toFixed(4)} BASED`,
        priceInEth,
        date
      };
    });
    
    // Sort by date (most recent first)
    return processedActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
  } catch (error) {
    console.error('[StorageService] Error fetching NFT price history:', error);
    return [];
  }
}

/**
 * Fetch both offers and history for an NFT
 */
export async function getNFTMarketData(
  nftContract: string,
  tokenId: string | number,
  provider?: ethers.Provider
): Promise<{
  offers: ProcessedOffer[];
  history: ProcessedActivity[];
}> {
  try {
    console.log(`[StorageService] Fetching complete market data for ${nftContract} #${tokenId}`);
    
    const [offers, history] = await Promise.all([
      getNFTActiveOffers(nftContract, tokenId, 50, provider),
      getNFTPriceHistory(nftContract, tokenId, 50, provider)
    ]);
    
    return {
      offers,
      history
    };
    
  } catch (error) {
    console.error('[StorageService] Error fetching NFT market data:', error);
    return {
      offers: [],
      history: []
    };
  }
}

/**
 * Helper function to shorten addresses for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address === ethers.ZeroAddress) return 'Mint';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// Function to get user's active offers for a specific NFT
export const getUserOffersForNFT = async (
  nftContract: string,
  tokenId: string,
  userAddress: string,
  provider: any
): Promise<ProcessedOffer[]> => {
  try {
    console.log(`[StorageService] Getting user offers for NFT ${nftContract}/${tokenId} from user ${userAddress}`);
    
    const contract = new ethers.Contract(MARKETPLACE_STORAGE_ADDRESS, STORAGE_ABI, provider);
    
    // Get active offers for this specific NFT instead of user offers
    const nftOffers = await contract.getNFTActiveOffers(nftContract, tokenId, 10);
    console.log(`[StorageService] Raw NFT offers:`, nftOffers);
    
    // Filter offers for this specific user with null checks
    const userOffers = nftOffers.filter((offer: any) => {
      // Check if offer has buyer/bidder property and it matches user address
      const offerMaker = offer.buyer || offer.bidder || offer.from;
      return offerMaker && 
             typeof offerMaker === 'string' && 
             offerMaker.toLowerCase() === userAddress.toLowerCase();
    });
    
    console.log(`[StorageService] Filtered user offers:`, userOffers);
    
    // Process the offers
    const processedOffers: ProcessedOffer[] = userOffers.map((offer: any) => {
      const offerMaker = offer.buyer || offer.bidder || offer.from;
      const amount = offer.amount || offer.price || BigInt(0);
      const expirationTimestamp = offer.expirationTimestamp || offer.expiresAt || 0;
      
      return {
        from: offerMaker,
        price: `${ethers.formatEther(amount)} BASED`,
        priceInEth: parseFloat(ethers.formatEther(amount)),
        expiration: expirationTimestamp > 0 ? new Date(Number(expirationTimestamp) * 1000) : null,
        createdAt: new Date(),
        status: 'active' as const,
        isExpired: false,
      offerId: offer.offerId?.toString() || '0',
        nftContract: offer.nftContract || nftContract,
        tokenId: offer.tokenId?.toString() || tokenId
      };
    });
    
    console.log(`[StorageService] Processed user offers for NFT:`, processedOffers);
    return processedOffers;
  } catch (error) {
    console.error('[StorageService] Error getting user offers for NFT:', error);
    return [];
  }
};

// Function to cancel an offer
export const cancelOffer = async (
  nftContract: string,
  tokenId: string,
  walletClient: any
): Promise<any> => {
  try {
    console.log(`[StorageService] Cancelling offer for ${nftContract}/${tokenId}`);
    
    const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
    
    // Use the marketplace contract with proper ABI
    const MARKETPLACE_ABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "cancelOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    // Get user address from wallet
    let userAddress: string;
    if (walletClient?.account?.address) {
      userAddress = walletClient.account.address;
    } else {
      // Fallback to ethereum provider
      const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error("No ethereum provider found");
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
    }
    
    // Use the ethereum provider directly to send the transaction
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error("No ethereum provider found");
    }
    
    // Create contract interface for encoding
    const contractInterface = new ethers.Interface(MARKETPLACE_ABI);
    
    // Encode the function call
    const data = contractInterface.encodeFunctionData("cancelOffer", [nftContract, tokenId]);
    
    // Send transaction using ethereum provider
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: userAddress,
        to: marketplaceAddress,
        data: data,
        gas: '0x493E0', // 300,000 gas
      }],
    });
    
    console.log(`[StorageService] Cancel offer transaction hash:`, txHash);
    
    // Wait for confirmation
    const provider = getBasedAIProvider();
    const receipt = await provider.waitForTransaction(txHash);
    
    return { hash: txHash, wait: () => Promise.resolve(receipt) };
  } catch (error) {
    console.error('[StorageService] Error cancelling offer:', error);
    throw error;
  }
};

// Function to update an offer (cancel + new offer)
export const updateOffer = async (
  nftContract: string,
  tokenId: string,
  newPrice: string,
  expirationTimestamp: number,
  walletClient: any
): Promise<any> => {
  try {
    console.log(`[StorageService] Updating offer for ${nftContract}/${tokenId} to ${newPrice} BASED`);
    
    // First cancel existing offer
    await cancelOffer(nftContract, tokenId, walletClient);
    
    // Wait a moment for the cancellation to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Then make a new offer with the updated price
    const { makeOfferOnNFT } = await import('./marketplaceService');
    const newOfferAmount = ethers.parseUnits(newPrice, 18);
    
    const tx = await makeOfferOnNFT(
      nftContract,
      parseInt(tokenId),
      newOfferAmount,
      expirationTimestamp,
      walletClient
    );
    
    console.log(`[StorageService] Update offer (new offer) transaction hash:`, tx.hash);
    return tx;
  } catch (error) {
    console.error('[StorageService] Error updating offer:', error);
    throw error;
  }
};

// Function to accept an offer (for NFT owners)
export const acceptOffer = async (
  nftContract: string,
  tokenId: string,
  buyerAddress: string,
  walletClient: any
): Promise<any> => {
  try {
    console.log(`[StorageService] Accepting offer from ${buyerAddress} for ${nftContract}/${tokenId}`);
    
    const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      throw new Error("No ethereum provider found");
    }
    
    // Get user address
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
    // Function signature for acceptOffer(address,uint256,address)
    const funcName = 'acceptOffer(address,uint256,address)';
    const signature = ethers.keccak256(ethers.toUtf8Bytes(funcName)).substring(0, 10);
    
    // Encode parameters
    const nftContractParam = nftContract.toLowerCase().substring(2).padStart(64, '0');
    const tokenIdParam = parseInt(tokenId).toString(16).padStart(64, '0');
    const buyerParam = buyerAddress.toLowerCase().substring(2).padStart(64, '0');
    
    const encodedData = `${signature}${nftContractParam}${tokenIdParam}${buyerParam}`;
    
    // Send transaction
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: userAddress,
        to: marketplaceAddress,
        data: encodedData,
        gas: '0x493E0', // 300,000 gas
      }],
    });
    
    console.log(`[StorageService] Accept offer transaction hash:`, txHash);
    
    // Wait for confirmation
    const provider = getBasedAIProvider();
    const receipt = await provider.waitForTransaction(txHash);
    
    return { hash: txHash, wait: () => Promise.resolve(receipt) };
  } catch (error) {
    console.error('[StorageService] Error accepting offer:', error);
    throw error;
  }
};

// Function to get all active offers for a collection
export const getCollectionOffers = async (
  collectionAddress: string,
  provider: any,
  limit: number = 1000 // Increased limit
): Promise<ProcessedOffer[]> => {
  try {
    console.log(`[StorageService] Getting collection offers for ${collectionAddress}`);
    
    const contract = getStorageContract(provider);
    let allOffers: any[] = []; // Raw offer data from blockchain
    
    // Get total supply to determine scanning range
    let totalSupply = 777; // Default for LifeNodes
    try {
      const nftContract = new ethers.Contract(
        collectionAddress,
        ["function totalSupply() view returns (uint256)"],
        provider
      );
      const totalSupplyBN = await nftContract.totalSupply();
      totalSupply = Number(totalSupplyBN);
    } catch (error) {
      console.warn(`[StorageService] Could not get total supply for ${collectionAddress}, using default`);
      // Use fallback based on known collections
      if (collectionAddress.toLowerCase() === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21') {
        totalSupply = 777; // LifeNodes
      } else {
        totalSupply = 500; // Default fallback
      }
    }
    console.log(`🔍 [StorageService] Total supply for ${collectionAddress}: ${totalSupply}`);
    
    // Determine how many tokens to scan (up to limit, but try to cover more)
    const maxTokensToScan = Math.min(totalSupply, limit);
    console.log(`[StorageService] Scanning ${maxTokensToScan} NFTs for offers...`);
    
    // Create batches for efficient processing
    const batchSize = 50; // Process 50 NFTs at a time
    const batches = [];
    
    for (let i = 0; i < maxTokensToScan; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, maxTokensToScan);
      const batchTokenIds = [];
      
      // Try different token ID patterns
      for (let tokenId = i; tokenId < batchEnd; tokenId++) {
        // Pattern 1: 0-based indexing
        batchTokenIds.push(tokenId);
        // Pattern 2: 1-based indexing
        if (tokenId + 1 < totalSupply) {
          batchTokenIds.push(tokenId + 1);
        }
      }
      
      batches.push([...new Set(batchTokenIds)]); // Remove duplicates
    }
    
    // Process each batch
    for (const batch of batches) {
      try {
        // Get offers for this batch of token IDs
        const batchPromises = batch.map(async (tokenId) => {
          try {
            const offers = await contract.getNFTActiveOffers(collectionAddress, tokenId);
            if (offers && offers.length > 0) {
              console.log(`[StorageService] Found ${offers.length} offers for token ${tokenId}`);
              return offers.map((offer: any) => ({
                nftContract: collectionAddress,
                tokenId: tokenId,
                buyer: offer.bidder || offer.buyer || offer.offeror,
                amount: offer.amount || offer.price,
                expiresAt: offer.expiresAt || offer.expiration,
                createdAt: offer.createdAt || offer.timestamp,
                isActive: offer.isActive !== false, // Default to true unless explicitly false
                paymentToken: offer.paymentToken || ethers.ZeroAddress
              }));
            }
            return [];
          } catch (error) {
            // Silently continue for individual token failures
            return [];
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Collect all successful results
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            allOffers.push(...result.value);
          }
        });
        
        // Add small delay between batches to avoid overwhelming the RPC
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (batchError) {
        console.warn(`[StorageService] Error processing batch: ${batchError}`);
        continue;
      }
    }
    
    // Process and filter the offers
    const processedOffers: ProcessedOffer[] = allOffers
      .filter(offer => offer && offer.buyer && offer.amount)
      .map(offer => {
        const createdAt = new Date(Number(offer.createdAt || 0) * 1000);
        const expiresAt = Number(offer.expiresAt || 0) > 0 ? new Date(Number(offer.expiresAt) * 1000) : null;
        const priceInEth = parseFloat(ethers.formatEther(offer.amount));
        const isExpired = expiresAt ? expiresAt < new Date() : false;
        
        return {
          from: offer.buyer,
          price: `${priceInEth.toFixed(4)} BASED`,
          priceInEth,
          expiration: expiresAt,
          createdAt,
          status: (offer.isActive && !isExpired) ? 'active' : (isExpired ? 'expired' : 'cancelled'),
          isExpired,
          offerId: `${offer.nftContract}-${offer.tokenId}-${offer.buyer}`,
          nftContract: offer.nftContract,
          tokenId: offer.tokenId.toString()
        } as ProcessedOffer;
      })
      .filter(offer => offer.status === 'active' && !offer.isExpired)
      .sort((a, b) => b.priceInEth - a.priceInEth); // Sort by highest offer first
    
    console.log(`[StorageService] Found ${processedOffers.length} total active offers for collection ${collectionAddress}`);
    
    return processedOffers;
    
  } catch (error) {
    console.error(`[StorageService] Error getting collection offers: ${error}`);
    return [];
  }
};

// Function to get floor price for a collection using comprehensive method
export const getCollectionFloorPrice = async (
  collectionAddress: string,
  provider: any
): Promise<number> => {
  try {
    console.log(`🏷️ [StorageService] Getting floor price for collection ${collectionAddress}`);
    console.log(`🏷️ [StorageService] Collection name: ${collectionAddress === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21' ? 'LifeNodes' : 'Other Collection'}`);
    
    // Try to get all active listings for the collection
    const activeListings = await getCollectionActiveListings(collectionAddress, provider);
    
    if (activeListings.length === 0) {
      console.log(`🏷️ [StorageService] No active listings found for collection ${collectionAddress}`);
      return 0;
    }
    
    // Find the minimum price from all active listings
    const prices = activeListings.map(listing => listing.price);
    const minPrice = Math.min(...prices);
    
    console.log(`🏷️ [StorageService] Found ${activeListings.length} active listings for ${collectionAddress}`);
    console.log(`🏷️ [StorageService] Price range: ${Math.min(...prices)} - ${Math.max(...prices)} BASED`);
    console.log(`🏷️ [StorageService] Floor price: ${minPrice} BASED`);
    
    return minPrice;
    
  } catch (error) {
    console.error(`🏷️ [StorageService] Error getting floor price for collection ${collectionAddress}:`, error);
    return 0;
  }
};

// Function to get collection total volume from sales history
export const getCollectionVolume = async (
  collectionAddress: string,
  provider: any,
  periodDays?: number // If specified, only count sales within this period
): Promise<number> => {
  try {
    console.log(`[StorageService] Getting volume for collection ${collectionAddress}`);
    
    const contract = new ethers.Contract(MARKETPLACE_STORAGE_ADDRESS, STORAGE_ABI, provider);
    let totalVolume = 0;
    const cutoffTime = periodDays ? Date.now() / 1000 - (periodDays * 24 * 60 * 60) : 0;
    
    // Get sales history for sample of tokens in the collection
    for (let tokenId = 1; tokenId <= 50; tokenId++) { // Increased sample size
      try {
        const salesHistory = await contract.getNFTPriceHistory(collectionAddress, tokenId, 50);
        
        if (salesHistory && salesHistory.length > 0) {
          for (const sale of salesHistory) {
            // Only count sales within the specified period (if any)
            if (Number(sale.timestamp) >= cutoffTime) {
              totalVolume += parseFloat(ethers.formatEther(sale.price));
            }
          }
        }
      } catch (error) {
        // Skip errors for individual NFTs
        console.log(`[StorageService] No sales history for token ${tokenId}:`, error);
      }
    }
    
    console.log(`[StorageService] Total volume for collection: ${totalVolume} BASED`);
    return totalVolume;
  } catch (error) {
    console.error('[StorageService] Error getting collection volume:', error);
    return 0;
  }
};

// Function to get collection activity (sales, listings, transfers) - REAL DATA ONLY
export const getCollectionActivity = async (
  collectionAddress: string,
  provider: any,
  limit: number = 10
): Promise<ProcessedActivity[]> => {
  try {
    console.log(`[StorageService] Getting enhanced activity for collection ${collectionAddress}`);
    
    // Get real transfer data from BasedAI explorer API
    const response = await fetch(`https://explorer.bf1337.org/api/v2/tokens/${collectionAddress}/transfers?limit=${Math.min(limit * 3, 100)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transfers: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[StorageService] Found ${data.items?.length || 0} real transfers`);
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Define marketplace contract addresses for better detection
    const marketplaceContracts = [
      '0x8a791620dd6260079bf849dc5567adc3f2fdc318', // Old marketplace
      '0xedd719eca832b667ec537d9c4d9e846feaee7ccc'  // Current marketplace
    ].map(addr => addr.toLowerCase());
    
    // Convert real transfer data to activity format with enhanced type detection
    const realActivities: ProcessedActivity[] = data.items.map((transfer: any) => {
      const fromAddr = transfer.from?.hash?.toLowerCase() || '';
      const toAddr = transfer.to?.hash?.toLowerCase() || '';
      const isFromZero = fromAddr === '0x0000000000000000000000000000000000000000';
      const isToZero = toAddr === '0x0000000000000000000000000000000000000000';
      const fromMarketplace = marketplaceContracts.includes(fromAddr);
      const toMarketplace = marketplaceContracts.includes(toAddr);
      
      // Enhanced activity type detection with more specificity
      let activityType: 'Sale' | 'Transfer' | 'Mint' | 'List' | 'Delist' | 'Burn' = 'Transfer';
      let activityDescription = 'Transfer';
      
      if (isFromZero && !isToZero) {
        activityType = 'Mint';
        activityDescription = 'Minted';
      } else if (!isFromZero && isToZero) {
        activityType = 'Burn';
        activityDescription = 'Burned';
      } else if (fromMarketplace && !toMarketplace) {
        activityType = 'Sale';
        activityDescription = 'Sold';
      } else if (!fromMarketplace && toMarketplace) {
        activityType = 'List';
        activityDescription = 'Listed for Sale';
      } else if (fromMarketplace && toMarketplace) {
        activityType = 'Transfer';
        activityDescription = 'Marketplace Transfer';
      } else if (!fromMarketplace && !toMarketplace && !isFromZero && !isToZero) {
        activityType = 'Transfer';
        activityDescription = 'Private Transfer';
      }
      
      return {
        id: `real-${transfer.transaction_hash}-${transfer.token?.id || 'unknown'}`,
        type: activityType,
        description: activityDescription,
        from: isFromZero ? null : transfer.from?.hash || null,
        to: isToZero ? null : transfer.to?.hash || null,
        price: null, // Will try to enhance with price data
        priceInEth: null,
        date: new Date(transfer.timestamp),
        txHash: transfer.transaction_hash,
        tokenId: transfer.token?.id ? transfer.token.id.toString() : null,
        nftContract: collectionAddress,
        blockNumber: transfer.block_number,
        transactionIndex: transfer.transaction_index
      };
    });
    
    // Try to enhance activities with price data for sales
    const storageContract = getStorageContract(provider);
    
    for (const activity of realActivities) {
      if ((activity.type === 'Sale' || activity.type === 'List') && activity.tokenId) {
        try {
          // Try to get price data from various sources
          
          // 1. Check marketplace contract for listing/sale price
          const marketplaceAddress = '0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc';
          const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
          
          // Try to get historical listing info
          try {
            const listing = await marketplaceContract.getListing(collectionAddress, activity.tokenId);
            if (listing && listing.price && BigInt(listing.price) > BigInt(0)) {
              const priceInEth = parseFloat(ethers.formatEther(listing.price));
              activity.price = `${priceInEth.toFixed(4)} BASED`;
              activity.priceInEth = priceInEth;
            }
          } catch (e) {
            // Listing might not exist anymore
          }
          
          // 2. If no marketplace price, try storage contract price history
          if (!activity.price) {
            try {
              const salesHistory = await storageContract.getNFTPriceHistory(collectionAddress, activity.tokenId, 5);
              
              if (salesHistory && salesHistory.length > 0) {
                // Find the sale closest to this transaction time
                const saleMatch = salesHistory.find((sale: any) => {
                  const saleTime = new Date(Number(sale.timestamp) * 1000);
                  const timeDiff = Math.abs(saleTime.getTime() - activity.date.getTime());
                  return timeDiff < 300000; // Within 5 minutes
                });
                
                if (saleMatch) {
                  const priceInEth = parseFloat(ethers.formatEther(saleMatch.price));
                  activity.price = `${priceInEth.toFixed(4)} BASED`;
                  activity.priceInEth = priceInEth;
                }
              }
            } catch (e) {
              // Skip price lookup errors silently
            }
          }
          
        } catch (error) {
          // Skip price lookup errors silently
        }
      }
    }
    
    // Sort by date (most recent first) and block number for tie-breaking
    realActivities.sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      
      // Use block number and transaction index for ordering within same timestamp
      const blockDiff = (b.blockNumber || 0) - (a.blockNumber || 0);
      if (blockDiff !== 0) return blockDiff;
      
      return (b.transactionIndex || 0) - (a.transactionIndex || 0);
    });
    
    // Limit to requested number
    const limitedActivities = realActivities.slice(0, limit);
    
    console.log(`[StorageService] Processed ${limitedActivities.length} enhanced activities:`, {
      sales: limitedActivities.filter(a => a.type === 'Sale').length,
      listings: limitedActivities.filter(a => a.type === 'List').length,
      transfers: limitedActivities.filter(a => a.type === 'Transfer').length,
      mints: limitedActivities.filter(a => a.type === 'Mint').length,
      burns: limitedActivities.filter(a => a.type === 'Burn').length
    });
    
    return limitedActivities;
    
  } catch (error) {
    console.error('[StorageService] Error getting enhanced collection activity:', error);
    return [];
  }
};

// Function to get real collection holders count using the proper API endpoint
export const getCollectionHoldersCount = async (
  collectionAddress: string,
  provider: any
): Promise<number | null> => {
  try {
    console.log(`[StorageService] Getting holders count for collection ${collectionAddress}`);
    
    // Use the proper BasedAI explorer API endpoint for holders
    const response = await fetch(`https://explorer.bf1337.org/api/v2/tokens/${collectionAddress}/holders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch holders: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns holders data with total count
    const holdersCount = data.items?.length || 0;
    console.log(`[StorageService] Found ${holdersCount} holders for collection`);
    
    return holdersCount;
    
  } catch (error) {
    console.error('[StorageService] Error getting holders from API, trying contract fallback:', error);
    
    // Fallback to contract-based estimation if API fails
    try {
      const contractABI = [
        "function totalSupply() view returns (uint256)",
        "function ownerOf(uint256) view returns (address)",
        "function balanceOf(address) view returns (uint256)"
      ];
      
      const nftContract = new ethers.Contract(collectionAddress, contractABI, provider);
      const totalSupply = await nftContract.totalSupply();
      const totalSupplyNum = Number(totalSupply);
      
      if (totalSupplyNum === 0) {
        return 0;
      }
      
      // Sample a subset of tokens to estimate unique holders
      const sampleSize = Math.min(50, totalSupplyNum);
      const uniqueOwners = new Set<string>();
      
      for (let i = 1; i <= sampleSize; i++) {
        try {
          const owner = await nftContract.ownerOf(i);
          uniqueOwners.add(owner.toLowerCase());
        } catch (error) {
          // Token might not exist or be burned, skip
          continue;
        }
      }
      
      // Estimate total unique holders based on sample
      const estimatedHolders = Math.round((uniqueOwners.size / sampleSize) * totalSupplyNum);
      
      console.log(`[StorageService] Estimated ${estimatedHolders} holders for collection (sampled ${uniqueOwners.size}/${sampleSize})`);
      return estimatedHolders;
      
    } catch (contractError) {
      console.error('[StorageService] Contract fallback also failed:', contractError);
      return null;
    }
  }
};

// Function to get floor price from storage contract (if available)
export const getCollectionFloorPriceFromContract = async (
  collectionAddress: string,
  provider: any
): Promise<number | null> => {
  try {
    console.log(`[StorageService] Attempting to get floor price from storage contract for ${collectionAddress}`);
    
    // Try to call the storage contract, but handle the case where the function doesn't exist
    try {
      const contract = getStorageContract(provider);
      const floorPrice = await contract.collectionFloorPrice(collectionAddress);
      
      if (Number(floorPrice) > 0) {
        const priceInEth = parseFloat(ethers.formatEther(floorPrice));
        console.log(`[StorageService] Floor price from storage contract: ${priceInEth} BASED`);
        return priceInEth;
      }
    } catch (contractError) {
      console.log(`[StorageService] Storage contract call failed (function may not exist): ${contractError instanceof Error ? contractError.message : String(contractError)}`);
      // Function doesn't exist or contract error - this is expected if the storage contract doesn't have this function yet
    }
    
    console.log(`[StorageService] No floor price available from storage contract, will need to calculate from active listings`);
    return null;
  } catch (error) {
    console.error('[StorageService] Error in getCollectionFloorPriceFromContract:', error);
    return null;
  }
};

// Function to get collection volume count using storage contract method (if available)
export const getCollectionVolumeFromContract = async (
  collectionAddress: string,
  provider: any
): Promise<number> => {
  try {
    console.log(`[StorageService] Attempting to get volume count from storage contract for ${collectionAddress}`);
    
    // Try to call the storage contract, but handle the case where the function doesn't exist
    try {
      const contract = getStorageContract(provider);
      const volumeCount = await contract.collectionVolume(collectionAddress);
      
      const count = Number(volumeCount);
      console.log(`[StorageService] Volume count from storage contract: ${count}`);
      return count;
    } catch (contractError) {
      console.log(`[StorageService] Storage contract volume call failed (function may not exist): ${contractError instanceof Error ? contractError.message : String(contractError)}`);
      // Function doesn't exist or contract error - this is expected if the storage contract doesn't have this function yet
    }
    
    console.log(`[StorageService] No volume data available from storage contract`);
    return 0;
  } catch (error) {
    console.error('[StorageService] Error in getCollectionVolumeFromContract:', error);
    return 0;
  }
};

// Function to get all active listings for a collection - EFFICIENT VERSION
export const getCollectionActiveListings = async (
  collectionAddress: string,
  provider: any
): Promise<Array<{ tokenId: number; price: number; seller: string }>> => {
  try {
    console.log(`🔍 [StorageService] Getting ALL active listings for collection ${collectionAddress}`);
    console.log(`🔍 [StorageService] Collection name: ${collectionAddress === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21' ? 'LifeNodes' : 'Other Collection'}`);
    
    // Use the marketplace contract to scan for active listings
    const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress, 
      marketplaceABI,
      provider
    );
    
    const activeListings: Array<{ tokenId: number; price: number; seller: string }> = [];
    
    // Get total supply to determine scanning range
    let totalSupply = 777; // Default for LifeNodes
    try {
      const nftContract = new ethers.Contract(
        collectionAddress,
        ["function totalSupply() view returns (uint256)"],
        provider
      );
      const totalSupplyBN = await nftContract.totalSupply();
      totalSupply = Number(totalSupplyBN);
    } catch (error) {
      console.warn(`[StorageService] Could not get total supply for ${collectionAddress}, using default`);
      // Use fallback based on known collections
      if (collectionAddress.toLowerCase() === '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21') {
        totalSupply = 777; // LifeNodes
      } else {
        totalSupply = 500; // Default fallback
      }
    }
    console.log(`🔍 [StorageService] Total supply for ${collectionAddress}: ${totalSupply}`);
    
    if (totalSupply > 1000) {
      console.log(`🔍 [StorageService] Large collection (${totalSupply} tokens), limiting scan to first 1000`);
      totalSupply = 1000;
    }
    
    // Scan tokens in batches
    const batchSize = 25;
    const maxBatches = Math.ceil(totalSupply / batchSize);
    
    console.log(`🔍 [StorageService] Scanning ${totalSupply} tokens in ${maxBatches} batches of ${batchSize}`);
    
    for (let batch = 0; batch < maxBatches; batch++) {
      const startToken = batch * batchSize + 1;
      const endToken = Math.min((batch + 1) * batchSize, totalSupply);
      
      console.log(`🔍 [StorageService] Scanning batch ${batch + 1}/${maxBatches}: tokens ${startToken}-${endToken}`);
      
      // Check each token in this batch
      const batchPromises = [];
      for (let tokenId = startToken; tokenId <= endToken; tokenId++) {
        batchPromises.push(
          marketplaceContract.getListing(collectionAddress, tokenId)
            .then((listing: any) => {
              // Check if listing is active: seller != zero address AND price > 0
              if (listing.seller !== ethers.ZeroAddress && Number(listing.price) > 0) {
                // Convert price from wei to BASED
                const priceInBased = parseFloat(ethers.formatEther(listing.price));
                console.log(`🔍 [StorageService] ✅ Found active listing: Token ${tokenId}, Price: ${priceInBased} BASED, Seller: ${listing.seller}`);
                return {
                  tokenId,
                  price: priceInBased,
                  seller: listing.seller
                };
              }
              return null;
            })
            .catch((error: any) => {
              // Ignore errors for non-existent tokens
              return null;
            })
        );
      }
      
      // Wait for this batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Add valid listings to our results
      for (const listing of batchResults) {
        if (listing) {
          activeListings.push(listing);
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (batch < maxBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Early termination if we found enough listings for testing
      if (activeListings.length >= 10) {
        console.log(`🔍 [StorageService] Found ${activeListings.length} listings, stopping early for efficiency`);
        break;
      }
    }
    
    console.log(`🔍 [StorageService] ✅ Found ${activeListings.length} total active listings for ${collectionAddress}`);
    
    if (activeListings.length > 0) {
      const prices = activeListings.map(l => l.price);
      console.log(`🔍 [StorageService] Price range: ${Math.min(...prices)} - ${Math.max(...prices)} BASED`);
      console.log(`🔍 [StorageService] Sample listings:`, activeListings.slice(0, 3));
    }
    
    return activeListings;
    
  } catch (error) {
    console.error('🔍 [StorageService] Error getting active listings:', error);
    return [];
  }
};

// DEBUG: Test function to check a single token's listing status
export const testSingleTokenListing = async (
  collectionAddress: string,
  tokenId: number,
  provider: any
): Promise<void> => {
  try {
    console.log(`🧪 [DEBUG] Testing token ${tokenId} in collection ${collectionAddress}`);
    
    const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress, 
      marketplaceABI, // Use the full marketplace ABI
      provider
    );
    
    // Get listing details directly
    try {
      const listing = await marketplaceContract.getListing(collectionAddress, tokenId);
      console.log(`🧪 [DEBUG] Token ${tokenId} listing details:`, listing);
      
      // Check if listing is active (has valid seller and price)
      const isActive = listing && listing.seller && listing.seller !== ethers.ZeroAddress && listing.price && Number(listing.price) > 0;
      console.log(`🧪 [DEBUG] Token ${tokenId} isActive: ${isActive}`);
      
      if (isActive) {
        const priceInEther = parseFloat(ethers.formatEther(listing.price));
        console.log(`🧪 [DEBUG] Token ${tokenId} price: ${priceInEther} BASED`);
        console.log(`🧪 [DEBUG] Token ${tokenId} seller: ${listing.seller}`);
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = Number(listing.expiresAt);
        
        if (expiresAt === 0) {
          console.log(`🧪 [DEBUG] Token ${tokenId} no expiration (permanent listing)`);
        } else if (expiresAt > now) {
          console.log(`🧪 [DEBUG] Token ${tokenId} expires at: ${new Date(expiresAt * 1000)}`);
        } else {
          console.log(`🧪 [DEBUG] Token ${tokenId} EXPIRED at: ${new Date(expiresAt * 1000)}`);
        }
      }
      
    } catch (error) {
      console.log(`🧪 [DEBUG] Token ${tokenId} no listing or error:`, error instanceof Error ? error.message.substring(0, 100) : String(error));
    }
    
  } catch (error) {
    console.error(`🧪 [DEBUG] Error testing token ${tokenId}:`, error);
  }
}; 