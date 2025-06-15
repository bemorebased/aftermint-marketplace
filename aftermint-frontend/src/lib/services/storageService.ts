import { ethers, formatEther } from 'ethers';
import { MARKETPLACE_STORAGE_ADDRESS, getBasedAIProvider } from './nftService';
import { marketplaceABI } from '../abi/marketplaceABI';

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

// Add these interfaces for user listings and offers
export interface UserListing {
  nftContract: string;
  tokenId: string;
  price: string;
  priceInEth: number;
  listedAt: Date;
  expiresAt: Date | null;
  status: 'active' | 'cancelled' | 'sold' | 'expired';
  privateBuyer?: string;
  listingIndex: number;
}

export interface UserOffer {
  nftContract: string;
  tokenId: string;
  price: string;
  priceInEth: number;
  createdAt: Date;
  expiresAt: Date | null;
  status: 'active' | 'cancelled' | 'accepted' | 'expired';
  offerIndex: number;
}

// Homepage-specific interfaces
export interface MarketplaceStats {
  totalListings: number;
  totalSales: number;
  totalOffers: number;
  activeListings: number;
  activeOffers: number;
  volume24h: string;
  volume24hInEth: number;
  salesCount24h: number;
  averageSalePrice: string;
  averageSalePriceInEth: number;
}

export interface RecentActivity {
  type: 'sale' | 'listing' | 'offer';
  nftContract: string;
  tokenId: string;
  price: string;
  priceInEth: number;
  timestamp: Date;
  from?: string;
  to?: string;
  status?: string;
}

export interface CollectionStats {
  address: string;
  name?: string;
  symbol?: string;
  volume24h: string;
  volume24hInEth: number;
  salesCount24h: number;
  listingsCount: number;
  offersCount: number;
  floorPrice?: string;
  floorPriceInEth?: number;
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
    
    // Get the collection's total supply to know how many NFTs to check
    try {
      const nftContract = new ethers.Contract(collectionAddress, [
        'function totalSupply() view returns (uint256)'
      ], provider);
      
      const totalSupply = await nftContract.totalSupply();
      const totalSupplyNumber = Number(totalSupply);
      console.log(`[StorageService] Total supply for collection: ${totalSupplyNumber}`);
      
      // Determine how many tokens to scan (up to limit, but try to cover more)
      const maxTokensToScan = Math.min(totalSupplyNumber, limit);
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
          if (tokenId + 1 < totalSupplyNumber) {
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
      
    } catch (error) {
      console.warn(`[StorageService] Could not get total supply, using fallback scanning: ${error}`);
      
      // Fallback: scan a reasonable range without total supply
      const fallbackLimit = Math.min(limit, 1000);
      console.log(`[StorageService] Fallback: scanning first ${fallbackLimit} token IDs...`);
      
      const batchSize = 25;
      for (let start = 0; start < fallbackLimit; start += batchSize) {
        const end = Math.min(start + batchSize, fallbackLimit);
        const tokenIds = Array.from({ length: end - start }, (_, i) => start + i);
        
        try {
          const batchPromises = tokenIds.map(async (tokenId) => {
            try {
              const offers = await contract.getNFTActiveOffers(collectionAddress, tokenId);
              if (offers && offers.length > 0) {
                return offers.map((offer: any) => ({
                  nftContract: collectionAddress,
                  tokenId: tokenId,
                  buyer: offer.bidder || offer.buyer || offer.offeror,
                  amount: offer.amount || offer.price,
                  expiresAt: offer.expiresAt || offer.expiration,
                  createdAt: offer.createdAt || offer.timestamp,
                  isActive: offer.isActive !== false,
                  paymentToken: offer.paymentToken || ethers.ZeroAddress
                }));
              }
              return [];
            } catch (error) {
              return [];
            }
          });
          
          const results = await Promise.allSettled(batchPromises);
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
              allOffers.push(...result.value);
            }
          });
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (batchError) {
          console.warn(`[StorageService] Error in fallback batch ${start}-${end}: ${batchError}`);
        }
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

// Function to get collection floor price from active listings
export const getCollectionFloorPrice = async (
  collectionAddress: string,
  provider: any
): Promise<number | null> => {
  try {
    console.log(`[StorageService] Getting floor price for collection ${collectionAddress}`);
    
    // Check active listings for the collection to find lowest price
    const { getCollectionActiveListings } = await import('./marketplaceService');
    const activeListings = await getCollectionActiveListings(collectionAddress, provider);
    
    if (activeListings.length === 0) {
      return null;
    }
    
    // Get the lowest price from active listings
    let floorPrice = Infinity;
    
    for (const tokenId of activeListings) {
      try {
        // Get listing price for this token
        const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
        const marketplaceABI = [
          "function getTokenPrice(address,uint256) view returns (uint256)"
        ];
        
        const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceABI, provider);
        const price = await marketplaceContract.getTokenPrice(collectionAddress, tokenId);
        
        if (price > 0) {
          const priceInEth = parseFloat(ethers.formatEther(price));
          if (priceInEth < floorPrice) {
            floorPrice = priceInEth;
          }
        }
      } catch (error) {
        console.log(`[StorageService] Error getting price for token ${tokenId}:`, error);
      }
    }
    
    return floorPrice === Infinity ? null : floorPrice;
  } catch (error) {
    console.error('[StorageService] Error getting collection floor price:', error);
    return null;
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
    
    const storageContract = getStorageContract(provider);
    const activities: ProcessedActivity[] = [];
    
    // Get sales data from storage contract
    const totalSales = await storageContract.historicalSales.length;
    console.log(`[StorageService] Total historical sales: ${totalSales}`);
    
    // Get recent sales for this collection
    const salesPromises = [];
    const maxSalesToCheck = Math.min(totalSales, 200); // Check last 200 sales
    
    for (let i = Math.max(0, totalSales - maxSalesToCheck); i < totalSales; i++) {
      salesPromises.push(storageContract.historicalSales(i));
    }
    
    if (salesPromises.length > 0) {
      const salesResults = await Promise.all(salesPromises);
      
      for (const sale of salesResults) {
        if (sale.nftContract.toLowerCase() === collectionAddress.toLowerCase()) {
          const priceInEth = parseFloat(formatEther(sale.price));
          
          activities.push({
            id: `sale-${sale.nftContract}-${sale.tokenId}-${sale.timestamp}`,
            type: 'Sale',
            description: 'Sold',
            from: sale.seller,
            to: sale.buyer,
            price: `${priceInEth.toFixed(4)} BASED`,
            priceInEth,
            date: new Date(Number(sale.timestamp) * 1000),
            tokenId: sale.tokenId.toString(),
            nftContract: sale.nftContract
          });
        }
      }
    }
    
    // Get listings data from storage contract
    const totalListings = await storageContract.historicalListings.length;
    console.log(`[StorageService] Total historical listings: ${totalListings}`);
    
    // Get recent listings for this collection
    const listingsPromises = [];
    const maxListingsToCheck = Math.min(totalListings, 200); // Check last 200 listings
    
    for (let i = Math.max(0, totalListings - maxListingsToCheck); i < totalListings; i++) {
      listingsPromises.push(storageContract.historicalListings(i));
    }
    
    if (listingsPromises.length > 0) {
      const listingsResults = await Promise.all(listingsPromises);
      
      for (const listing of listingsResults) {
        if (listing.nftContract.toLowerCase() === collectionAddress.toLowerCase()) {
          const priceInEth = parseFloat(formatEther(listing.price));
          
          // Add listing activity
          activities.push({
            id: `list-${listing.nftContract}-${listing.tokenId}-${listing.listedAt}`,
            type: 'List',
            description: 'Listed for Sale',
            from: listing.seller,
            to: null,
            price: `${priceInEth.toFixed(4)} BASED`,
            priceInEth,
            date: new Date(Number(listing.listedAt) * 1000),
            tokenId: listing.tokenId.toString(),
            nftContract: listing.nftContract
          });
          
          // Add delisting activity if cancelled
          if (listing.cancelledAt > 0) {
            activities.push({
              id: `delist-${listing.nftContract}-${listing.tokenId}-${listing.cancelledAt}`,
              type: 'Delist',
              description: 'Delisted',
              from: listing.seller,
              to: null,
              price: null,
              priceInEth: null,
              date: new Date(Number(listing.cancelledAt) * 1000),
              tokenId: listing.tokenId.toString(),
              nftContract: listing.nftContract
            });
          }
        }
      }
    }
    
    // Get offers data from storage contract
    const totalOffers = await storageContract.historicalOffers.length;
    console.log(`[StorageService] Total historical offers: ${totalOffers}`);
    
    // Get recent offers for this collection
    const offersPromises = [];
    const maxOffersToCheck = Math.min(totalOffers, 100); // Check last 100 offers
    
    for (let i = Math.max(0, totalOffers - maxOffersToCheck); i < totalOffers; i++) {
      offersPromises.push(storageContract.historicalOffers(i));
    }
    
    if (offersPromises.length > 0) {
      const offersResults = await Promise.all(offersPromises);
      
      for (const offer of offersResults) {
        if (offer.nftContract.toLowerCase() === collectionAddress.toLowerCase()) {
          const priceInEth = parseFloat(formatEther(offer.amount));
          
          // Add offer activity
          activities.push({
            id: `offer-${offer.nftContract}-${offer.tokenId}-${offer.createdAt}`,
            type: 'Offer',
            description: 'Offer Made',
            from: offer.bidder,
            to: null,
            price: `${priceInEth.toFixed(4)} BASED`,
            priceInEth,
            date: new Date(Number(offer.createdAt) * 1000),
            tokenId: offer.tokenId.toString(),
            nftContract: offer.nftContract
          });
          
          // Add offer accepted activity if accepted
          if (offer.acceptedAt > 0) {
            activities.push({
              id: `offer-accepted-${offer.nftContract}-${offer.tokenId}-${offer.acceptedAt}`,
              type: 'OfferAccepted',
              description: 'Offer Accepted',
              from: offer.bidder,
              to: null,
              price: `${priceInEth.toFixed(4)} BASED`,
              priceInEth,
              date: new Date(Number(offer.acceptedAt) * 1000),
              tokenId: offer.tokenId.toString(),
              nftContract: offer.nftContract
            });
          }
          
          // Add offer cancelled activity if cancelled
          if (offer.cancelledAt > 0) {
            activities.push({
              id: `offer-cancelled-${offer.nftContract}-${offer.tokenId}-${offer.cancelledAt}`,
              type: 'OfferCancelled',
              description: 'Offer Cancelled',
              from: offer.bidder,
              to: null,
              price: null,
              priceInEth: null,
              date: new Date(Number(offer.cancelledAt) * 1000),
              tokenId: offer.tokenId.toString(),
              nftContract: offer.nftContract
            });
          }
        }
      }
    }
    
    // Also get real transfer data from BasedAI explorer API for mints and transfers
    try {
      const response = await fetch(`https://explorer.bf1337.org/api/v2/tokens/${collectionAddress}/transfers?limit=${Math.min(limit * 2, 50)}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[StorageService] Found ${data.items?.length || 0} real transfers`);
        
        if (data.items && data.items.length > 0) {
          // Convert real transfer data to activity format
          for (const transfer of data.items) {
            const fromAddr = transfer.from?.hash?.toLowerCase() || '';
            const toAddr = transfer.to?.hash?.toLowerCase() || '';
            const isFromZero = fromAddr === '0x0000000000000000000000000000000000000000';
            const isToZero = toAddr === '0x0000000000000000000000000000000000000000';
            
            // Only add mints and burns (transfers are covered by sales/listings)
            if (isFromZero && !isToZero) {
              activities.push({
                id: `mint-${transfer.transaction_hash}-${transfer.token?.id || 'unknown'}`,
                type: 'Mint',
                description: 'Minted',
                from: null,
                to: transfer.to?.hash || null,
                price: null,
                priceInEth: null,
                date: new Date(transfer.timestamp),
                txHash: transfer.transaction_hash,
                tokenId: transfer.token?.id ? transfer.token.id.toString() : null,
                nftContract: collectionAddress,
                blockNumber: transfer.block_number,
                transactionIndex: transfer.transaction_index
              });
            } else if (!isFromZero && isToZero) {
              activities.push({
                id: `burn-${transfer.transaction_hash}-${transfer.token?.id || 'unknown'}`,
                type: 'Burn',
                description: 'Burned',
                from: transfer.from?.hash || null,
                to: null,
                price: null,
                priceInEth: null,
                date: new Date(transfer.timestamp),
                txHash: transfer.transaction_hash,
                tokenId: transfer.token?.id ? transfer.token.id.toString() : null,
                nftContract: collectionAddress,
                blockNumber: transfer.block_number,
                transactionIndex: transfer.transaction_index
              });
            }
          }
        }
      }
    } catch (error) {
      console.log('[StorageService] Could not fetch transfer data from API, continuing with contract data only');
    }
    
    // Sort by date (most recent first)
    activities.sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      
      // Use block number and transaction index for ordering within same timestamp
      const blockDiff = (b.blockNumber || 0) - (a.blockNumber || 0);
      if (blockDiff !== 0) return blockDiff;
      
      return (b.transactionIndex || 0) - (a.transactionIndex || 0);
    });
    
    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);
    
    console.log(`[StorageService] Processed ${limitedActivities.length} real activities:`, {
      sales: limitedActivities.filter(a => a.type === 'Sale').length,
      listings: limitedActivities.filter(a => a.type === 'List').length,
      offers: limitedActivities.filter(a => a.type === 'Offer').length,
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

// Function to get collection floor price using storage contract method
export const getCollectionFloorPriceFromContract = async (
  collectionAddress: string,
  provider: any
): Promise<number | null> => {
  try {
    console.log(`[StorageService] Getting floor price from storage contract for ${collectionAddress}`);
    
    const contract = getStorageContract(provider);
    const floorPrice = await contract.collectionFloorPrice(collectionAddress);
    
    if (Number(floorPrice) > 0) {
      const priceInEth = parseFloat(ethers.formatEther(floorPrice));
      console.log(`[StorageService] Floor price from contract: ${priceInEth} BASED`);
      return priceInEth;
    }
    
    return null;
  } catch (error) {
    console.error('[StorageService] Error getting floor price from contract:', error);
    return null;
  }
};

// Function to get collection volume count using storage contract method
export const getCollectionVolumeFromContract = async (
  collectionAddress: string,
  provider: any
): Promise<number> => {
  try {
    console.log(`[StorageService] Getting volume count from storage contract for ${collectionAddress}`);
    
    const contract = getStorageContract(provider);
    const volumeCount = await contract.collectionVolume(collectionAddress);
    
    const count = Number(volumeCount);
    console.log(`[StorageService] Volume count from contract: ${count}`);
    return count;
  } catch (error) {
    console.error('[StorageService] Error getting volume from contract:', error);
    return 0;
  }
};

/**
 * Get all active listings for a user
 */
export const getUserActiveListings = async (
  userAddress: string,
  provider?: ethers.Provider
): Promise<UserListing[]> => {
  try {
    console.log(`[StorageService] Getting active listings for user: ${userAddress}`);
    
    const storageContract = getStorageContract(provider);
    const listings: UserListing[] = [];
    
    // Get the count of user listings by trying indices until we get an error
    let index = 0;
    const maxAttempts = 1000; // Reasonable limit to prevent infinite loops
    
    while (index < maxAttempts) {
      try {
        // Get listing index for this user at this position
        const listingIndex = await storageContract.userListings(userAddress, index);
        
        // If listingIndex is 0 and we're not at the first position, we've reached the end
        if (listingIndex === BigInt(0) && index > 0) {
          break;
        }
        
        // Get the actual listing data
        const listingData = await storageContract.historicalListings(listingIndex);
        
        // Parse the listing data
        const listing: UserListing = {
          nftContract: listingData.nftContract,
          tokenId: listingData.tokenId.toString(),
          price: ethers.formatEther(listingData.price),
          priceInEth: parseFloat(ethers.formatEther(listingData.price)),
          listedAt: new Date(Number(listingData.listedAt) * 1000),
          expiresAt: listingData.expiresAt > 0 ? new Date(Number(listingData.expiresAt) * 1000) : null,
          status: getListingStatus(listingData.status, listingData.expiresAt, listingData.cancelledAt, listingData.soldAt),
          privateBuyer: listingData.privateBuyer !== ethers.ZeroAddress ? listingData.privateBuyer : undefined,
          listingIndex: Number(listingIndex)
        };
        
        // Only include active listings
        if (listing.status === 'active') {
          listings.push(listing);
        }
        
        index++;
      } catch (error) {
        // If we get an error, we've reached the end of the user's listings
        break;
      }
    }
    
    console.log(`[StorageService] Found ${listings.length} active listings for user`);
    return listings;
    
  } catch (error) {
    console.error('[StorageService] Error getting user active listings:', error);
    return [];
  }
};

/**
 * Get all active offers made by a user
 */
export const getUserActiveOffers = async (
  userAddress: string,
  provider?: ethers.Provider
): Promise<UserOffer[]> => {
  try {
    console.log(`[StorageService] Getting active offers for user: ${userAddress}`);
    
    const storageContract = getStorageContract(provider);
    const offers: UserOffer[] = [];
    
    // Get the count of user offers by trying indices until we get an error
    let index = 0;
    const maxAttempts = 1000; // Reasonable limit to prevent infinite loops
    
    while (index < maxAttempts) {
      try {
        // Get offer index for this user at this position
        const offerIndex = await storageContract.userOffers(userAddress, index);
        
        // If offerIndex is 0 and we're not at the first position, we've reached the end
        if (offerIndex === BigInt(0) && index > 0) {
          break;
        }
        
        // Get the actual offer data
        const offerData = await storageContract.historicalOffers(offerIndex);
        
        // Parse the offer data
        const offer: UserOffer = {
          nftContract: offerData.nftContract,
          tokenId: offerData.tokenId.toString(),
          price: ethers.formatEther(offerData.amount),
          priceInEth: parseFloat(ethers.formatEther(offerData.amount)),
          createdAt: new Date(Number(offerData.createdAt) * 1000),
          expiresAt: offerData.expiresAt > 0 ? new Date(Number(offerData.expiresAt) * 1000) : null,
          status: getOfferStatus(offerData.status, offerData.expiresAt, offerData.cancelledAt, offerData.acceptedAt),
          offerIndex: Number(offerIndex)
        };
        
        // Only include active offers
        if (offer.status === 'active') {
          offers.push(offer);
        }
        
        index++;
      } catch (error) {
        // If we get an error, we've reached the end of the user's offers
        break;
      }
    }
    
    console.log(`[StorageService] Found ${offers.length} active offers for user`);
    return offers;
    
  } catch (error) {
    console.error('[StorageService] Error getting user active offers:', error);
    return [];
  }
};

/**
 * Helper function to determine listing status
 */
function getListingStatus(
  status: number,
  expiresAt: bigint,
  cancelledAt: bigint,
  soldAt: bigint
): 'active' | 'cancelled' | 'sold' | 'expired' {
  // Status enum: 0 = Active, 1 = Cancelled, 2 = Sold
  if (status === 1 || cancelledAt > 0) return 'cancelled';
  if (status === 2 || soldAt > 0) return 'sold';
  
  // Check if expired
  if (expiresAt > 0 && Date.now() > Number(expiresAt) * 1000) {
    return 'expired';
  }
  
  return 'active';
}

/**
 * Helper function to determine offer status
 */
function getOfferStatus(
  status: number,
  expiresAt: bigint,
  cancelledAt: bigint,
  acceptedAt: bigint
): 'active' | 'cancelled' | 'accepted' | 'expired' {
  // Status enum: 0 = Active, 1 = Cancelled, 2 = Accepted
  if (status === 1 || cancelledAt > 0) return 'cancelled';
  if (status === 2 || acceptedAt > 0) return 'accepted';
  
  // Check if expired
  if (expiresAt > 0 && Date.now() > Number(expiresAt) * 1000) {
    return 'expired';
  }
  
  return 'active';
}

/**
 * Get marketplace statistics for homepage
 */
export const getMarketplaceStats = async (): Promise<MarketplaceStats> => {
  try {
    console.log('[StorageService] Fetching marketplace statistics...');
    
    const contract = getStorageContract();
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400; // 24 hours ago
    
    // Get total counts from array lengths
    const [totalListings, totalSales, totalOffers] = await Promise.all([
      contract.historicalListings.length,
      contract.historicalSales.length,
      contract.historicalOffers.length
    ]);
    
    // Get recent data for 24h stats (last 100 items to analyze)
    const recentSalesCount = Math.min(Number(totalSales), 100);
    const recentSalesPromises = [];
    
    for (let i = Math.max(0, Number(totalSales) - recentSalesCount); i < Number(totalSales); i++) {
      recentSalesPromises.push(contract.historicalSales(i));
    }
    
    const recentSales = await Promise.all(recentSalesPromises);
    
    // Filter for 24h data and calculate stats
    const sales24h = recentSales.filter(sale => Number(sale.timestamp) >= oneDayAgo);
    const volume24h = sales24h.reduce((total, sale) => total + Number(sale.price), 0);
    const averagePrice = sales24h.length > 0 ? volume24h / sales24h.length : 0;
    
    // Count active listings and offers (simplified - would need to check status)
    const activeListings = Math.floor(Number(totalListings) * 0.3); // Estimate 30% active
    const activeOffers = Math.floor(Number(totalOffers) * 0.2); // Estimate 20% active
    
    const stats: MarketplaceStats = {
      totalListings: Number(totalListings),
      totalSales: Number(totalSales),
      totalOffers: Number(totalOffers),
      activeListings,
      activeOffers,
      volume24h: formatEther(volume24h.toString()),
      volume24hInEth: parseFloat(formatEther(volume24h.toString())),
      salesCount24h: sales24h.length,
      averageSalePrice: formatEther(averagePrice.toString()),
      averageSalePriceInEth: parseFloat(formatEther(averagePrice.toString()))
    };
    
    console.log('[StorageService] Marketplace stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('[StorageService] Error fetching marketplace stats:', error);
    // Return default stats on error
    return {
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
    };
  }
};

/**
 * Get recent marketplace activity for homepage
 */
export const getRecentActivity = async (limit: number = 20): Promise<RecentActivity[]> => {
  try {
    console.log(`[StorageService] Fetching recent activity (limit: ${limit})...`);
    
    const contract = getStorageContract();
    const activities: RecentActivity[] = [];
    
    // Get recent sales
    const totalSales = await contract.historicalSales.length;
    const salesCount = Math.min(Number(totalSales), Math.floor(limit * 0.6)); // 60% sales
    
    for (let i = Math.max(0, Number(totalSales) - salesCount); i < Number(totalSales); i++) {
      try {
        const sale = await contract.historicalSales(i);
        activities.push({
          type: 'sale',
          nftContract: sale.nftContract,
          tokenId: sale.tokenId.toString(),
          price: formatEther(sale.price),
          priceInEth: parseFloat(formatEther(sale.price)),
          timestamp: new Date(Number(sale.timestamp) * 1000),
          from: sale.seller,
          to: sale.buyer
        });
      } catch (error) {
        console.warn(`[StorageService] Error fetching sale ${i}:`, error);
      }
    }
    
    // Get recent listings
    const totalListings = await contract.historicalListings.length;
    const listingsCount = Math.min(Number(totalListings), Math.floor(limit * 0.3)); // 30% listings
    
    for (let i = Math.max(0, Number(totalListings) - listingsCount); i < Number(totalListings); i++) {
      try {
        const listing = await contract.historicalListings(i);
        if (Number(listing.status) === 0) { // Active status
          activities.push({
            type: 'listing',
            nftContract: listing.nftContract,
            tokenId: listing.tokenId.toString(),
            price: formatEther(listing.price),
            priceInEth: parseFloat(formatEther(listing.price)),
            timestamp: new Date(Number(listing.listedAt) * 1000),
            from: listing.seller,
            status: 'active'
          });
        }
      } catch (error) {
        console.warn(`[StorageService] Error fetching listing ${i}:`, error);
      }
    }
    
    // Get recent offers
    const totalOffers = await contract.historicalOffers.length;
    const offersCount = Math.min(Number(totalOffers), Math.floor(limit * 0.1)); // 10% offers
    
    for (let i = Math.max(0, Number(totalOffers) - offersCount); i < Number(totalOffers); i++) {
      try {
        const offer = await contract.historicalOffers(i);
        if (Number(offer.status) === 0) { // Active status
          activities.push({
            type: 'offer',
            nftContract: offer.nftContract,
            tokenId: offer.tokenId.toString(),
            price: formatEther(offer.amount),
            priceInEth: parseFloat(formatEther(offer.amount)),
            timestamp: new Date(Number(offer.createdAt) * 1000),
            from: offer.bidder,
            status: 'active'
          });
        }
      } catch (error) {
        console.warn(`[StorageService] Error fetching offer ${i}:`, error);
      }
    }
    
    // Sort by timestamp (newest first) and limit
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    console.log(`[StorageService] Fetched ${sortedActivities.length} recent activities`);
    return sortedActivities;
    
  } catch (error) {
    console.error('[StorageService] Error fetching recent activity:', error);
    return [];
  }
};

/**
 * Get top collections by volume for homepage
 */
export const getTopCollections = async (limit: number = 5): Promise<CollectionStats[]> => {
  try {
    console.log(`[StorageService] Fetching top collections (limit: ${limit})...`);
    
    const contract = getStorageContract();
    const collectionMap = new Map<string, CollectionStats>();
    
    // Get recent sales to calculate collection stats
    const totalSales = await contract.historicalSales.length;
    const recentSalesCount = Math.min(Number(totalSales), 200); // Analyze last 200 sales
    
    for (let i = Math.max(0, Number(totalSales) - recentSalesCount); i < Number(totalSales); i++) {
      try {
        const sale = await contract.historicalSales(i);
        const address = sale.nftContract;
        const price = parseFloat(formatEther(sale.price));
        const timestamp = Number(sale.timestamp);
        const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
        
        if (!collectionMap.has(address)) {
          collectionMap.set(address, {
            address,
            volume24h: '0',
            volume24hInEth: 0,
            salesCount24h: 0,
            listingsCount: 0,
            offersCount: 0
          });
        }
        
        const stats = collectionMap.get(address)!;
        
        // Count 24h activity
        if (timestamp >= oneDayAgo) {
          stats.volume24hInEth += price;
          stats.salesCount24h += 1;
          stats.volume24h = stats.volume24hInEth.toString();
        }
        
      } catch (error) {
        console.warn(`[StorageService] Error processing sale ${i}:`, error);
      }
    }
    
    // Sort by 24h volume and return top collections
    const topCollections = Array.from(collectionMap.values())
      .filter(collection => collection.volume24hInEth > 0)
      .sort((a, b) => b.volume24hInEth - a.volume24hInEth)
      .slice(0, limit);
    
    console.log(`[StorageService] Found ${topCollections.length} top collections`);
    return topCollections;
    
  } catch (error) {
    console.error('[StorageService] Error fetching top collections:', error);
    return [];
  }
};

export const getCollectionActiveListings = async (
  collectionAddress: string,
  provider?: ethers.Provider
): Promise<UserListing[]> => {
  try {
    console.log(`[StorageService] Getting active listings for collection ${collectionAddress}`);
    
    const storageContract = getStorageContract(provider);
    const totalListings = await storageContract.historicalListings.length;
    
    console.log(`[StorageService] Total historical listings: ${totalListings}`);
    
    const activeListings: UserListing[] = [];
    const batchSize = 50;
    
    // Process in batches to avoid overwhelming the RPC
    for (let i = 0; i < totalListings; i += batchSize) {
      const endIndex = Math.min(i + batchSize, totalListings);
      const promises = [];
      
      for (let j = i; j < endIndex; j++) {
        promises.push(storageContract.historicalListings(j));
      }
      
      const batchResults = await Promise.all(promises);
      
      for (let k = 0; k < batchResults.length; k++) {
        const listingData = batchResults[k];
        const listingIndex = i + k;
        
        // Only include listings for this specific collection
        if (listingData.nftContract.toLowerCase() !== collectionAddress.toLowerCase()) {
          continue;
        }
        
        const status = getListingStatus(
          listingData.status,
          listingData.expiresAt,
          listingData.cancelledAt,
          listingData.soldAt
        );
        
        // Only include active listings
        if (status === 'active') {
          const priceInEth = parseFloat(formatEther(listingData.price));
          
          activeListings.push({
            nftContract: listingData.nftContract,
            tokenId: listingData.tokenId.toString(),
            price: `${priceInEth.toFixed(4)} BASED`,
            priceInEth,
            listedAt: new Date(Number(listingData.listedAt) * 1000),
            expiresAt: listingData.expiresAt > 0 ? new Date(Number(listingData.expiresAt) * 1000) : null,
            status,
            privateBuyer: listingData.privateBuyer !== '0x0000000000000000000000000000000000000000' ? listingData.privateBuyer : undefined,
            listingIndex
          });
        }
      }
      
      // Small delay between batches to be nice to the RPC
      if (endIndex < totalListings) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Sort by price (lowest first) for floor price calculation
    activeListings.sort((a, b) => a.priceInEth - b.priceInEth);
    
    console.log(`[StorageService] Found ${activeListings.length} active listings for collection ${collectionAddress}`);
    
    return activeListings;
    
  } catch (error) {
    console.error('[StorageService] Error fetching collection active listings:', error);
    return [];
  }
}; 