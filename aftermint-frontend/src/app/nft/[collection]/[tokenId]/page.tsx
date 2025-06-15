"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Copy, 
  ShieldCheck, 
  X as XMarkIcon, 
  Pencil as PencilIcon, 
  XCircle, 
  Tag as TagIcon,
  ChevronRight,
  ExternalLink,
  Check,
  User
} from 'lucide-react';

import ListNftModal from '@/components/ListNftModal'; // <<< ADD IMPORT
import { basedCollections } from '@/data/collections';
import { 
  getListingInfo, 
  cancelNFTListing, 
  approveNFTTransfer,
  checkMarketplaceSetup,
  checkMarketplaceContracts,
  checkMarketplaceStorageConfig,
  configureMarketplaceStorage,
  configureStorageMarketplace,
  getContractLinkageStatus,
  fixAllMarketplaceConfiguration,
  updateListingPrice,
  listNFTForSale,
  buyNFT,
  makeOfferOnNFT
} from '@/lib/services/marketplaceService';
import type { NFTListing } from '@/lib/services/marketplaceService';
import { 
  getNFTContract, 
  getNFTMetadata, 
  getBasedAIProvider,
  MARKETPLACE_ADDRESS,
  MARKETPLACE_STORAGE_ADDRESS,
  MOCK_NFT_ADDRESS
} from '@/lib/services/nftService';
import { 
  getNFTMarketData,
  ProcessedOffer,
  ProcessedActivity,
  shortenAddress as shortenAddressFromStorage,
  getUserOffersForNFT,
  cancelOffer,
  acceptOffer,
  updateOffer
} from '@/lib/services/storageService';
import { 
  fetchCollectionInfo, 
  getBasedCollectionDetails,
  fetchNFTMetadata,
  calculateRarityScore
} from '@/utils/nft';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Convert basedCollections to the format expected by this page
const collections = basedCollections.reduce((acc, collection) => {
  acc[collection.id] = {
    name: collection.name,
    contract: collection.id,
    logo: collection.logoUrl,
    banner: collection.bannerUrl || "",
    website: collection.website || "",
    twitter: collection.twitter || "",
    telegram: collection.telegram || "",
    description: `A collection of ${collection.name} NFTs on the BasedAI blockchain.`,
    floorPrice: 0.1 + Math.random() * 0.9, // Mock floor price
    volume24h: 5 + Math.random() * 20,
    volume7d: 35 + Math.random() * 100,
    items: 1000, // Mock item count
    owners: 200 + Math.floor(Math.random() * 800),
    chainId: 32323 // BasedAI chain ID
  };
  return acc;
}, {} as Record<string, any>);

// Add MockNFT for local testing
collections["0x5FbDB2315678afecb367f032d93F642f64180aa3"] = {
  name: "MockNFT",
  contract: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  logo: "https://picsum.photos/id/237/200/200", // Random dog image
  banner: "https://picsum.photos/id/1/1500/500", // Random banner
  website: "",
  twitter: "",
  telegram: "",
  description: "A collection of mock NFTs for testing the BasedAI marketplace",
  floorPrice: 0.1,
  volume24h: 5,
  volume7d: 35,
  items: 100,
  owners: 20,
  chainId: 31337 // Hardhat local chain
};

/**
 * Note on API Usage:
 * While BasedAI explorer offers a REST API (https://explorer.bf1337.org/api-docs),
 * we use GraphQL for specific endpoints like token holders because:
 * 1. GraphQL allows more precise filtering of token holders data
 * 2. It enables more efficient queries with only the data we need
 * 3. For complex data with pagination, GraphQL provides better performance
 * 4. It's easier to retrieve related data in a single request
 * 
 * For simpler queries, we still use the REST API endpoints where appropriate.
 */

// Function to generate a mock NFT with detailed data
const generateMockNFT = (collection: string, tokenId: string) => {
  const collectionData = collections[collection as keyof typeof collections];
  if (!collectionData) return null;
  
  const id = parseInt(tokenId);
  const now = new Date();
  
  // Generate full owner address and display version
  const fullOwnerAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
  const displayOwnerAddress = `${fullOwnerAddress.substring(0, 10)}...${fullOwnerAddress.substring(38)}`;
  
  // Generate mock traits
  const traits = [
    {
      trait_type: "Background",
      value: ["Cosmic", "Neon", "Plain", "Gradient", "Starfield"][Math.floor(Math.random() * 5)],
      rarity: Math.max(1, Math.min(35, Math.floor(Math.random() * 35) + 1))
    },
    {
      trait_type: "Base",
      value: ["Gold", "Silver", "Bronze", "Diamond", "Platinum"][Math.floor(Math.random() * 5)],
      rarity: Math.max(1, Math.min(35, Math.floor(Math.random() * 35) + 1))
    },
    {
      trait_type: "Eyes",
      value: ["Blue", "Red", "Green", "Yellow", "Purple"][Math.floor(Math.random() * 5)],
      rarity: Math.max(1, Math.min(35, Math.floor(Math.random() * 35) + 1))
    },
    {
      trait_type: "Mouth",
      value: ["Smile", "Frown", "Grin", "Open", "Neutral"][Math.floor(Math.random() * 5)],
      rarity: Math.max(1, Math.min(35, Math.floor(Math.random() * 35) + 1))
    },
    {
      trait_type: "Accessory",
      value: ["Hat", "Glasses", "Necklace", "None", "Earrings"][Math.floor(Math.random() * 5)],
      rarity: Math.max(1, Math.min(35, Math.floor(Math.random() * 35) + 1))
    }
  ];
  
  // Calculate rarity score
  const rarityScore = calculateRarityScore(traits);
  
  // Estimate rank based on rarity score
  const estimatedRank = Math.max(1, Math.floor((1000 / (rarityScore || 1)) * Math.random() * 100));
  
  // Generate mock activities/history
  const activities = [
    {
      type: "Mint",
      from: "0x0000000000000000000000000000000000000000",
      to: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      price: collectionData.floorPrice * 0.8,
      date: new Date(now.getTime() - Math.floor(Math.random() * 10000000000))
    },
    {
      type: "List",
      from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      to: null,
      price: collectionData.floorPrice * 1.2,
      date: new Date(now.getTime() - Math.floor(Math.random() * 5000000000))
    },
    {
      type: "Sale",
      from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      to: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      price: collectionData.floorPrice * 1.2,
      date: new Date(now.getTime() - Math.floor(Math.random() * 1000000000))
    },
    {
      type: "List",
      from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      to: null,
      price: collectionData.floorPrice * 1.5,
      date: new Date(now.getTime() - Math.floor(Math.random() * 100000000))
    }
  ];
  
  // Sort activities by date (most recent first)
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Generate mock offers
  const offers = [
    {
      from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      price: collectionData.floorPrice * 0.9,
      expiration: new Date(now.getTime() + 86400000 * 2) // 2 days
    },
    {
      from: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      price: collectionData.floorPrice * 0.85,
      expiration: new Date(now.getTime() + 86400000 * 3) // 3 days
    }
  ];
  
  return {
    id,
    name: `${collectionData.name} #${id}`,
    image: `https://picsum.photos/seed/${collection}${id}/800/800`, // Random placeholder image
    price: parseFloat((Math.random() * 2 + collectionData.floorPrice).toFixed(2)),
    lastSale: parseFloat((Math.random() * 1 + collectionData.floorPrice).toFixed(2)),
    owner: displayOwnerAddress,
    ownerAvatar: `https://picsum.photos/seed/avatar${Math.floor(Math.random() * 100)}/100/100`,
    rarity: Math.floor(Math.random() * 100) + 1,
    rarityRank: estimatedRank,
    tokenId: id,
    collection: collectionData,
    traits,
    activities,
    offers,
    likeCount: Math.floor(Math.random() * 50),
    viewCount: Math.floor(Math.random() * 500) + 50,
    fullOwnerAddress: fullOwnerAddress
  };
};

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'traits', label: 'Traits' },
  { id: 'activity', label: 'Activity' }, // Renamed from 'history' to 'activity'
  { id: 'offers', label: 'Offers' },
  { id: 'details', label: 'Details' },
];

// Add this function near the top of the component
const verifyMarketplaceContract = async (contractAddress: string) => {
  try {
    console.log(`[NFTDetailPage] Verifying marketplace contract at ${contractAddress}`);
    const provider = getBasedAIProvider();
    
    // First check if the contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x' || code === '') {
      console.error(`[NFTDetailPage] No contract code found at ${contractAddress}`);
      return {
        success: false,
        error: 'No contract code found at specified address'
      };
    }
    
    console.log(`[NFTDetailPage] Contract code length: ${code.length}`);
    
    // Create a minimal interface with functions we need to check
    const minInterface = new ethers.Interface([
      // Functions we're trying to use
      "function buyNFTNative(address nftContract, uint256 tokenId) payable",
      "function buyNFT(address nftContract, uint256 tokenId) payable",
      "function makeOffer(address nftContract, uint256 tokenId, uint256 expirationTimestamp) payable",
      "function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice)",
      
      // Query functions
      "function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price, address paymentToken, uint256 listedAt, uint256 expiresAt, address privateBuyer, uint256 historicalListingIndex))",
      "function afterMintStorage() view returns (address)"
    ]);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, minInterface, provider);
    
    // Test each function to see if it exists
    const result: any = {
      contractCode: 'Valid',
      functions: {}
    };
    
    // Check for buyNFTNative function selector
    try {
      const funcSig = 'buyNFTNative(address,uint256)';
      const selector = ethers.keccak256(ethers.toUtf8Bytes(funcSig)).substring(0, 10);
      result.functions.buyNFTNative = { 
        selector,
        exists: code.includes(selector.substring(2)) 
      };
    } catch (e) {
      console.error('Error checking buyNFTNative:', e);
      result.functions.buyNFTNative = { exists: false, error: e };
    }
    
    // Check for buyNFT function selector
    try {
      const funcSig = 'buyNFT(address,uint256)';
      const selector = ethers.keccak256(ethers.toUtf8Bytes(funcSig)).substring(0, 10);
      result.functions.buyNFT = { 
        selector,
        exists: code.includes(selector.substring(2)) 
      };
    } catch (e) {
      console.error('Error checking buyNFT:', e);
      result.functions.buyNFT = { exists: false, error: e };
    }
    
    // Check for makeOffer function selector
    try {
      const funcSig = 'makeOffer(address,uint256,uint256)';
      const selector = ethers.keccak256(ethers.toUtf8Bytes(funcSig)).substring(0, 10);
      result.functions.makeOffer = { 
        selector,
        exists: code.includes(selector.substring(2)) 
      };
    } catch (e) {
      console.error('Error checking makeOffer:', e);
      result.functions.makeOffer = { exists: false, error: e };
    }
    
    // Try to get storage address
    try {
      const storageAddress = await contract.afterMintStorage();
      result.storageAddress = storageAddress;
    } catch (e) {
      console.error('Error getting storage address:', e);
      result.storageAddress = null;
    }
    
    console.log('[NFTDetailPage] Contract verification result:', result);
    return {
      success: true,
      result
    };
  } catch (e) {
    console.error('[NFTDetailPage] Error verifying contract:', e);
    return {
      success: false,
      error: e
    };
  }
};

// Add the extractRevertReason function after the verifyMarketplaceContract function
const extractRevertReason = async (provider: any, txHash: string, receipt: any) => {
  try {
    const tx = await provider.getTransaction(txHash);
    // Try to replay the transaction at the block it was mined in
    const code = await provider.call(
      {
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value
      },
      receipt.blockNumber
    );
    // If no revert, return generic
    return "Transaction failed (no revert reason)";
  } catch (error: any) {
    // Try to parse error data for a revert reason
    if (error && error.data) {
      try {
        // Standard Solidity Error(string)
        const reason = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + error.data.substring(138));
        return reason[0];
      } catch (decodeErr) {
        // Not a standard error
        return error.data;
      }
    }
    // Log the full error for debugging
    console.error("[extractRevertReason] Full error object:", error);
    return error && error.message ? error.message : "Transaction failed on the blockchain";
  }
};

// Add this helper function near the top
const checkMarketplaceApproval = async (
  nftContractAddress: string,
  tokenId: number,
  ownerAddress: string,
  marketplaceAddress: string,
  provider: any
) => {
  const nftAbi = [
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)"
  ];
  const nftContract = new ethers.Contract(nftContractAddress, nftAbi, provider);
  const approved = await nftContract.getApproved(tokenId);
  const isAll = await nftContract.isApprovedForAll(ownerAddress, marketplaceAddress);
  console.log('NFT approval:', { approved, isAll, marketplaceAddress });
  return { approved, isAll };
};

export default function NFTDetailPage({ params }: { params: Promise<{ collection: string; tokenId: string }> }) {
  const [nft, setNft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [similarNFTs, setSimilarNFTs] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Real blockchain data states
  const [realOffers, setRealOffers] = useState<ProcessedOffer[]>([]);
  const [realHistory, setRealHistory] = useState<ProcessedActivity[]>([]);
  const [marketDataLoading, setMarketDataLoading] = useState(false);

  // Collection-wide data states
  const [collectionOffers, setCollectionOffers] = useState<ProcessedOffer[]>([]);
  const [collectionSales, setCollectionSales] = useState<ProcessedActivity[]>([]);
  const [collectionDataLoading, setCollectionDataLoading] = useState(false);

  // User's offers on this NFT
  const [userOffers, setUserOffers] = useState<ProcessedOffer[]>([]);
  const [userOffersLoading, setUserOffersLoading] = useState(false);
  
  // Offer management states
  const [isCancellingOffer, setIsCancellingOffer] = useState(false);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState<string | null>(null); // Store buyer address being accepted

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentListing, setCurrentListing] = useState<NFTListing | null>(null);
  const [isFetchingOwnerOrListing, setIsFetchingOwnerOrListing] = useState<boolean>(false);

  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [detailedConfig, setDetailedConfig] = useState<any>(null);
  const [isFixingConfig, setIsFixingConfig] = useState(false);
  
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(false);
  const [testMarketplaceAddr, setTestMarketplaceAddr] = useState("");
  const [testMarketplaceResult, setTestMarketplaceResult] = useState<any>(null);
  
  // States for modals
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState(''); // Used by update price modal
  const [showOfferModal, setShowOfferModal] = useState(false); // For renderOfferModal
  const [isCancellingListing, setIsCancellingListing] = useState(false); // For cancel button state
  const [isMakingOffer, setIsMakingOffer] = useState(false); // For offer modal
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false); // For update price modal
  const [isBuying, setIsBuying] = useState(false); // For buy button state
  const [isListingNFT, setIsListingNFT] = useState(false); // For list button state
  
  // Offer modal states (moved from renderOfferModal to fix React hooks violation)
  const [selectedExpiration, setSelectedExpiration] = useState<number | null>(168); // Default 7 days
  const [customExpiration, setCustomExpiration] = useState<string>('');
  const [useCustomExpiration, setUseCustomExpiration] = useState(false);
  
  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  
  // Resolve params Promise
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setCollectionAddress(resolved.collection);
      setTokenId(resolved.tokenId);
    }
    resolveParams();
  }, [params]);
  const { address: connectedAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const router = useRouter();

  const isWalletConnected = isConnected;

  const isNFTListed = useMemo(() => {
    if (!currentListing) return false;
    return Number(currentListing.price) > 0;
  }, [currentListing]);

  // Helper function for offer expiration calculation
  const calculateExpirationDate = () => {
    if (useCustomExpiration && customExpiration) {
      return new Date(customExpiration);
    }
    if (selectedExpiration === null) {
      return undefined; // No expiration
    }
    const now = new Date();
    return new Date(now.getTime() + selectedExpiration * 60 * 60 * 1000);
  };

  // Add this array of possible marketplace addresses
  const possibleMarketplaceAddresses = [
    {
      address: "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc",
      description: "Current Proxy (configured in app)"
    },
    {
      address: "0x22C36b769cef9E54051765F20E81ECDe121f3ee2",
      description: "Alternative Address 1"
    },
    {
      address: "0x0bA94EE4F91203471A37C2cC36be04872671C22e",
      description: "Implementation Address (configured in app)"
    }
  ];
  
  // Add state for testing addresses
  const [testedAddresses, setTestedAddresses] = useState<{[address: string]: boolean}>({});
  
  // Add function to test a specific marketplace address
  const testMarketplaceAddress = async (address: string) => {
    if (!address || !ethers.isAddress(address)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    try {
      const provider = getBasedAIProvider();
      const minAbi = ["function afterMintStorage() view returns (address)"];
      const contract = new ethers.Contract(address, minAbi, provider);
      
      const storageAddress = await contract.afterMintStorage();
      
      setTestMarketplaceResult({
        address,
        storageAddress,
        hasStorageSet: storageAddress !== ethers.ZeroAddress
      });
    } catch (error) {
      console.error("Error testing marketplace address:", error);
      setTestMarketplaceResult({
        address,
        error: "Could not call afterMintStorage function"
      });
    }
  };
  
  // Main useEffect to fetch all necessary data
  useEffect(() => {
    let isActive = true; // Flag to prevent state updates after unmount
    setLoading(true);
    setIsFetchingOwnerOrListing(true);
    
    const fetchNFTData = async () => {
      // Handle undefined collection address
      if (collectionAddress === 'undefined' || collectionAddress === undefined) {
        console.error('Collection address is undefined');
        toast.error('Invalid NFT URL. The collection address is missing.');
        if (isActive) {
        setNft(null);
        setLoading(false);
          setIsFetchingOwnerOrListing(false);
        }
        return;
      }
      
      if (!collectionAddress || !tokenId) {
        if (isActive) {
        setNft(null);
        setLoading(false);
          setIsFetchingOwnerOrListing(false);
        }
        return;
      }
      
      try {
        console.log(`[NFTDetailPage] Fetching metadata for ${collectionAddress}/${tokenId}`);
        const metadata = await fetchNFTMetadata(collectionAddress, tokenId);
        console.log(`[NFTDetailPage] Metadata fetched for ${collectionAddress}/${tokenId}:`, metadata);

        if (!metadata) {
          toast.error(`Failed to fetch metadata for NFT ${tokenId}.`);
          if (isActive) {
          setNft(null);
          setLoading(false);
            setIsFetchingOwnerOrListing(false);
          }
          return;
        }
        
        // Determine if it's a known collection or needs on-chain fetching for collection details
        let currentCollectionDetails = getBasedCollectionDetails(collectionAddress);

        if (!currentCollectionDetails) {
          console.log(`[NFTDetailPage] Collection ${collectionAddress} not in local data, fetching from chain.`);
          // Attempt to fetch basic collection info if not locally defined
          const onChainCollectionInfo = await fetchCollectionInfo(collectionAddress, 'https://mainnet.basedaibridge.com/rpc/');
          if (onChainCollectionInfo) {
            currentCollectionDetails = {
              id: collectionAddress,
              name: onChainCollectionInfo.name || 'Unknown Collection',
              logoUrl: '',
              bannerUrl: '',
              website: '',
              twitter: ''
            };
            console.log(`[NFTDetailPage] Fetched on-chain collection info for ${collectionAddress}:`, currentCollectionDetails);
          } else {
            console.warn(`[NFTDetailPage] Could not fetch on-chain info for collection ${collectionAddress}. Using placeholder.`);
             currentCollectionDetails = {
              id: collectionAddress,
              name: 'Unknown Collection',
              logoUrl: '', bannerUrl: '', website: '', twitter: ''
            };
        }
        }
        
        const nftData = {
          ...metadata,
          collection: {
            ...currentCollectionDetails,
            contract: collectionAddress  // Add the contract field
          },
          owner: metadata.owner || null,
          isBased: true,
          listings: [],
          tokenId: parseInt(tokenId),
        };
        
        if (isActive) {
          setNft(nftData);
          console.log("[NFTDetailPage] nft state set:", nftData);
        }
        
        // Fetch listing information
        if (currentCollectionDetails && nftData.tokenId) {
          console.log(`[NFTDetailPage] Fetching listing info for ${collectionAddress}/${nftData.tokenId}`);
          try {
            const listingInfo = await getListingInfo(collectionAddress, nftData.tokenId, publicClient);
            console.log(`[NFTDetailPage] Listing info raw result for ${collectionAddress}/${nftData.tokenId}:`, listingInfo);
            
            if (listingInfo) {
              setCurrentListing(listingInfo);
              console.log("[NFTDetailPage] currentListing state set:", listingInfo);
            
              // Also add listing info to the nft object so it's accessible in other parts of the UI
              if (isActive) {
                setNft((prevNft: any) => ({
                  ...prevNft,
                  listing: listingInfo,
                  isListed: true,
                  price: ethers.formatUnits(listingInfo.price, 18)
                }));
              }
            } else {
              setCurrentListing(null);
              console.log("[NFTDetailPage] currentListing state set to null (no listing found).");
              
              // Make sure nft object reflects the not-listed state
              if (isActive) {
                setNft((prevNft: any) => ({
                  ...prevNft,
                  listing: null,
                  isListed: false,
                  price: undefined
                }));
              }
            }
          } catch (listingError) {
            console.error("[NFTDetailPage] Error fetching listing info:", listingError);
            if (isActive) {
              setCurrentListing(null);
            }
          }
        } else {
          console.warn("[NFTDetailPage] Missing contract or tokenId for fetching listing info", nftData);
          if (isActive) {
            setCurrentListing(null);
          }
        }

        // Check ownership
        if (connectedAddress && nftData.owner) {
          if (isActive) {
            setIsOwner(ethers.getAddress(nftData.owner) === ethers.getAddress(connectedAddress));
          }
        } else {
          if (isActive) {
            setIsOwner(false);
          }
        }
        console.log("[NFTDetailPage] isOwner state set:", isOwner);
        
        // Fetch similar NFTs after main data is set
        fetchSimilarNFTs();
        
        // Fetch real market data (offers and history) from blockchain
        if (isActive) {
          fetchMarketData();
          fetchCollectionData(); // Also fetch collection-wide data
        }
      } catch (error: any) {
        console.error('[NFTDetailPage] Error fetching NFT data:', error);
        toast.error(`Error fetching NFT data: ${error.message}`);
        if (isActive) {
        setNft(null);
        }
      } finally {
        if (isActive) {
        setLoading(false);
        setIsFetchingOwnerOrListing(false);
        }
      }
    };
    
    // Only fetch data if we have both collectionAddress and tokenId resolved
    if (collectionAddress && tokenId) {
      fetchNFTData();
    } else if (collectionAddress === '' && tokenId === '') {
      // Still waiting for params to resolve, don't show error yet
      console.log('[NFTDetailPage] Waiting for params to resolve...');
    } else {
      console.error('[NFTDetailPage] Collection or TokenID missing in resolved params:', { collectionAddress, tokenId });
      toast.error('Invalid NFT URL.');
      setNft(null);
      setLoading(false);
      setIsFetchingOwnerOrListing(false);
    }

    // Add diagnostic log when data is loaded
    return () => {
      isActive = false;
    };
  }, [collectionAddress, tokenId, connectedAddress, publicClient]);
  
  // Add a diagnostic logger that runs once we have NFT data loaded
  useEffect(() => {
    if (nft && currentListing) {
      // Log comprehensive diagnostic data about NFT and listing
      console.log(`
=== NFT DIAGNOSTIC DATA ===
NFT Contract: ${nft.collection?.id}
NFT Token ID: ${nft.tokenId}
NFT Owner: ${nft.owner}
Connected Address: ${connectedAddress}
Is Owner: ${isOwner}

Listing Status: ${isNFTListed ? 'Listed' : 'Not Listed'}
Listing Price: ${currentListing ? ethers.formatUnits(currentListing.price, 18) : 'N/A'} BASED
Listing Price (wei): ${currentListing?.price.toString() || 'N/A'}
Listing Expiration: ${currentListing?.expiresAt ? new Date(Number(currentListing.expiresAt) * 1000).toISOString() : 'None'}
Private Buyer: ${currentListing?.privateBuyer}
Is Private: ${currentListing?.privateBuyer !== ethers.ZeroAddress}
`);
    }
  }, [nft, currentListing, connectedAddress, isOwner, isNFTListed]);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime(); // FIXED: Changed to show time until expiration, not time elapsed
    
    // If already expired
    if (diff < 0) {
      const timePast = Math.abs(diff);
      if (timePast < 86400000) {
        const hours = Math.floor(timePast / 3600000);
        if (hours < 1) return 'Expired less than an hour ago';
        return `Expired ${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      const days = Math.floor(timePast / 86400000);
      return `Expired ${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Time until expiration
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    }
    
    return `Expires ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
  };
  
  const fetchSimilarNFTs = async () => {
    if (!nft || !collectionAddress) return;
    
    try {
      const randomTokenIds = Array.from({ length: 10 }, () => {
        const randomId = Math.floor(Math.random() * (nft.collection.items || 1000)) + 1;
        return randomId === parseInt(tokenId) ? randomId + 1 : randomId;
      }).slice(0, 7);
      
      setSimilarNFTs(randomTokenIds.map(id => ({
        id,
        tokenId: id,
        name: `${nft.collection.name} #${id}`,
        image: `https://picsum.photos/seed/${collectionAddress}${id}/500/500`,
        price: parseFloat((Math.random() * 2 + (nft.collection.floorPrice || 0.1)).toFixed(2)),
        isLoading: true
      })));
      
      const fetchedNFTs = await Promise.all(
        randomTokenIds.map(async (id) => {
          try {
            const metadata = await fetchNFTMetadata(collectionAddress, id);
            if (metadata) {
              return {
                id,
                tokenId: id,
                name: metadata.name || `${nft.collection.name} #${id}`,
                image: metadata.image || `https://picsum.photos/seed/${collectionAddress}${id}/500/500`,
                price: parseFloat((Math.random() * 2 + (nft.collection.floorPrice || 0.1)).toFixed(2)),
                isLoading: false
              };
            }
          } catch (error) {
            console.error(`Error fetching NFT #${id}:`, error);
          }
          return {
            id,
            tokenId: id,
            name: `${nft.collection.name} #${id}`,
            image: `https://picsum.photos/seed/${collectionAddress}${id}/500/500`,
            price: parseFloat((Math.random() * 2 + (nft.collection.floorPrice || 0.1)).toFixed(2)),
            isLoading: false
          };
        })
      );
      
      setSimilarNFTs(fetchedNFTs.filter(Boolean));
    } catch (error) {
      console.error("Error fetching similar NFTs:", error);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  
  const shortenAddress = (addr: string, chars = 4) => {
    if (!addr) return "";
    return `${addr.substring(0, chars + 2)}...${addr.substring(addr.length - chars)}`;
  };
  
  // Handle confirm list NFT
  const handleConfirmListNft = async (listingDetails: {
    price: string;
    expirationDate?: Date;
    privateBuyerAddress?: string;
  }) => {
    if (!nft || !isConnected) {
      toast.error('Please connect your wallet and ensure NFT data is loaded.');
      return;
    }

    // Earlier we checked for walletClient, but with different wallet types,
    // we should only check for connection status
    setIsListingNFT(true);
    toast.loading('Preparing listing...', { id: 'list-nft' });

    try {
      // 1. Approve the marketplace contract to transfer this specific NFT
      console.log(`[NFTDetailPage] Listing NFT ${nft.collection.contract} #${nft.tokenId} for ${listingDetails.price} BASED`);
      console.log(`[NFTDetailPage] Wallet client type:`, walletClient ? (typeof walletClient) : 'not available');
      
      // 2. List the NFT - Pass either walletClient or the connected address if walletClient not available
      const tx = await listNFTForSale(
        nft.collection.contract,
        nft.tokenId,
        listingDetails.price,
        walletClient || { address: connectedAddress },
        listingDetails.expirationDate,
        listingDetails.privateBuyerAddress
      );

      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'list-nft' });
      console.log(`[NFTDetailPage] Listing transaction:`, tx);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`[NFTDetailPage] Listing confirmed:`, receipt);

      toast.success('NFT successfully listed for sale!', { id: 'list-nft' });

      // Close the modal and refresh
      setIsListModalOpen(false);
      setTimeout(() => {
        window.location.reload(); // Use window.location.reload() instead of router.refresh()
      }, 2000);
    } catch (error: any) {
      console.error('[NFTDetailPage] Error listing NFT:', error);
      
      // Handle specific error messages more clearly
      let errorMessage = 'Error listing NFT';
      
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled in your wallet';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees';
        } else if (error.message.includes('window.ethereum')) { 
          errorMessage = 'Wallet connection error. Try reconnecting your wallet';
        } else if (error.message.includes('getAddress is not a function')) {
          errorMessage = 'Wallet compatibility issue. Try a different wallet or reconnect';
      } else {
          errorMessage = error.message.substring(0, 100); // Limit length of generic errors
        }
      }
      
      toast.error(errorMessage, { id: 'list-nft' });
    } finally {
      setIsListingNFT(false);
    }
  };

  // Add this validation function
  const validateListingBeforeBuy = async (
    nftContract: string,
    tokenId: number,
    expectedPrice: bigint
  ) => {
    try {
      console.log(`[NFTDetailPage] Validating listing for ${nftContract}/${tokenId} before buy`);
      const provider = getBasedAIProvider();
      
      // Create a contract instance for the marketplace
      const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
      const abi = [
        "function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price, address paymentToken, uint256 listedAt, uint256 expiresAt, address privateBuyer, uint256 historicalListingIndex))"
      ];
      
      const contract = new ethers.Contract(marketplaceAddress, abi, provider);
      
      // Call getListing to get current listing data
      const listing = await contract.getListing(nftContract, tokenId);
      console.log(`[NFTDetailPage] Current on-chain listing:`, {
        price: listing.price.toString(),
        expectedPrice: expectedPrice.toString(),
        seller: listing.seller,
        privateBuyer: listing.privateBuyer,
        expiresAt: listing.expiresAt.toString()
      });
      
      // IMPROVED: More tolerant price comparison
      // Convert to BigInt for accurate comparison
      const onChainPrice = BigInt(listing.price.toString());
      const expectedPriceBigInt = BigInt(expectedPrice.toString());
      
      console.log(`[NFTDetailPage] Price comparison:`, {
        onChainPrice: onChainPrice.toString(),
        expectedPrice: expectedPriceBigInt.toString(),
        isEqual: onChainPrice === expectedPriceBigInt,
      });
        
      // Instead of exact comparison, we'll use a more tolerant approach for price
      // Allow the transaction if the interface price is at least the required contract price
      if (expectedPriceBigInt < onChainPrice) {
        // If price in UI is less than actual price, that's a problem
        return {
          valid: false,
          reason: 'price_changed',
          currentPrice: onChainPrice.toString(),
          message: `The price is higher than displayed. Current price: ${ethers.formatEther(onChainPrice)} BASED`
        };
      }

      // If price in UI is higher than actual price, that's fine (user is paying more than needed)
      // But if it's significantly higher (>5%), warn them
      if (expectedPriceBigInt > onChainPrice) {
        const difference = Number(ethers.formatEther(expectedPriceBigInt - onChainPrice));
        const percentDifference = (difference / Number(ethers.formatEther(onChainPrice))) * 100;
        
        if (percentDifference > 5) {
          console.warn(`[NFTDetailPage] UI price is ${percentDifference.toFixed(2)}% higher than chain price`);
        }
      }
      
      // Check if not listed (price zero)
      if (listing.price.toString() === '0') {
        return {
          valid: false,
          reason: 'not_listed',
          message: 'This NFT is no longer listed for sale'
        };
      }
      
      // Check if listing expired
      if (listing.expiresAt.toString() !== '0') {
        const now = Math.floor(Date.now() / 1000);
        if (Number(listing.expiresAt) < now) {
          return {
            valid: false,
            reason: 'expired',
            message: 'This listing has expired'
          };
    }
      }
      
      // Check if it's a private listing for someone else
      if (listing.privateBuyer !== ethers.ZeroAddress) {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          const userAddress = accounts[0];
          if (ethers.getAddress(listing.privateBuyer) !== ethers.getAddress(userAddress)) {
            return {
              valid: false,
              reason: 'private_listing',
              message: 'This is a private listing for another wallet'
            };
          }
        } else {
          return {
            valid: false,
            reason: 'no_wallet',
            message: 'No wallet found for private listing check'
          };
        }
      }
      
      // All checks passed
      return {
        valid: true,
        currentListing: listing
      };
      } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('[NFTDetailPage] Error validating listing:', (error as any).message);
        } else {
        console.error('[NFTDetailPage] Error validating listing:', error);
      }
      return {
        valid: false,
        reason: 'error',
        message: 'Error validating listing status'
      };
      }
  };

  // Replace the handleBuyNft function with this updated version
  const handleBuyNft = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to buy this NFT');
      return;
    }

    if (!nft || !nft.collection || !nft.collection.contract || !nft.tokenId) {
      toast.error('NFT data is incomplete');
      return;
    }

    if (!currentListing) {
      toast.error('This NFT is not currently listed for sale');
      return;
    }

    try {
      setIsBuying(true);
      toast.loading('Preparing purchase...', { id: 'buy-nft' });
      
      console.log(`[NFTDetailPage] Buying NFT ${nft.collection.contract}/${nft.tokenId} for ${ethers.formatUnits(currentListing.price, 18)} BASED`);
      
      // Use the fixed buyNFT service function
      const receipt = await buyNFT(
        nft.collection.contract,
        Number(nft.tokenId),
        currentListing.price,
        walletClient
      );
      
      console.log(`[NFTDetailPage] Buy transaction confirmed:`, receipt.hash);
      toast.success('Successfully purchased NFT!', { id: 'buy-nft' });
      
      // Refresh page after successful purchase
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (error: any) {
      console.error('[NFTDetailPage] Error buying NFT:', error);
      
      let errorMessage = 'Error buying NFT';
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction canceled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees or NFT price';
        } else if (error.message.includes('Transaction would fail')) {
          errorMessage = error.message; // Show specific simulation error
        } else {
          errorMessage = `Error: ${error.message.substring(0, 100)}...`;
        }
      }
      
      toast.error(errorMessage, { id: 'buy-nft' });
    } finally {
      setIsBuying(false);
    }
  };

  // Handle update price
  const handleUpdatePrice = async () => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!nft || !nft.collection || !nft.collection.contract || !nft.tokenId) {
      toast.error('NFT data is incomplete');
      return;
    }

    try {
      setIsUpdatingPrice(true);
      
      // Convert the new price to wei
      const priceInWei = ethers.parseEther(newPrice);
      
      toast.loading('Updating price...', { id: 'update-price' });
      console.log(`[NFTDetailPage] Updating price for ${nft.collection.contract}/${nft.tokenId} to ${newPrice} BASED`);
      
      // Marketplace contract address 
      const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
      
      // Get the ethereum provider from window
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No ethereum provider found in window. Please make sure you have a wallet extension installed.");
      }
      
      // Get user address
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      // DIRECT APPROACH: Use raw transaction
      // Function signature for updateListingPrice(address,uint256,uint256)
      const funcNameUpdatePrice = 'updateListingPrice(address,uint256,uint256)';
      const updatePriceSignature = ethers.keccak256(ethers.toUtf8Bytes(funcNameUpdatePrice)).substring(0, 10);
      
      console.log('[NFTDetailPage] Calculated updateListingPrice signature:', updatePriceSignature);
      
      // Encode parameters
      // Address param (32 bytes)
      const nftContractParam = nft.collection.contract.toLowerCase().substring(2).padStart(64, '0');
      
      // Token ID (32 bytes)
      const tokenIdParam = nft.tokenId.toString(16).padStart(64, '0');
      
      // New price (32 bytes)
      const newPriceParam = priceInWei.toString(16).padStart(64, '0');
      
      // Combine function signature with encoded parameters
      let encodedData = `${updatePriceSignature}${nftContractParam}${tokenIdParam}${newPriceParam}`;
      
      // Ensure data has 0x prefix
      if (!encodedData.startsWith('0x')) {
        encodedData = '0x' + encodedData;
      }
      
      // Construct transaction parameters
      const txParams = {
        from: userAddress,
        to: marketplaceAddress,
        data: encodedData,
        gas: '0x493E0', // 300,000 gas (in hex)
      };
      
      // Send the transaction
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      toast.loading(`Transaction submitted, waiting for confirmation...`, { id: 'update-price' });
      console.log(`[NFTDetailPage] Update price transaction hash:`, txHash);
      
      // Wait for transaction
      const provider = getBasedAIProvider();
      const receipt = await provider.waitForTransaction(txHash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Price updated successfully!', { id: 'update-price' });
      
        // Close the update price modal and refresh
        setShowUpdatePriceModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (receipt) {
        toast.error('Transaction failed. Please try again.', { id: 'update-price' });
      }
    } catch (error) {
      // Safe error logging without circular references
      let errorMsg = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = (error as any).message;
      }
      console.error('[NFTDetailPage] Error updating price:', errorMsg);
      if (errorMsg.includes('user rejected') || errorMsg.includes('User rejected')) {
        toast.error('Transaction canceled by user', { id: 'update-price' });
      } else if (errorMsg.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction fees', { id: 'update-price' });
      } else {
        toast.error(`Error updating price. Please try again.`, { id: 'update-price' });
      }
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Replace the handleMakeOffer function with this updated version
  const handleMakeOffer = async (offerDetails: { price: string; expirationDate?: Date }) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet to make an offer');
      return;
    }
    
    if (!nft || !nft.collection || !nft.collection.contract) {
      toast.error('NFT data is incomplete');
      return;
    }
    
    if (!offerDetails.price || parseFloat(offerDetails.price) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }
    
    try {
      setIsMakingOffer(true);
      toast.loading('Preparing offer...', { id: 'make-offer' });
      
      // Check if user already has an active offer for this NFT
      console.log(`[NFTDetailPage] Checking for existing offers before making new offer`);
      
      // IMPROVED: Check for existing offers first
      if (connectedAddress) {
        const existingOffers = await getUserOffersForNFT(
          nft.collection.contract,
          nft.tokenId.toString(),
          connectedAddress,
          publicClient
        );
        
        if (existingOffers.length > 0) {
          const activeOffers = existingOffers.filter(offer => 
            !offer.isExpired && offer.status === 'active'
          );
          
          if (activeOffers.length > 0) {
            console.log(`[NFTDetailPage] Found ${activeOffers.length} existing active offers`);
            toast.error('You already have an active offer for this NFT. Please cancel it first or use the update button.', { id: 'make-offer' });
          setIsMakingOffer(false);
          return;
        }
      }
      }
      
      const offerAmount = ethers.parseUnits(offerDetails.price, 18);
      
      // Calculate expiration timestamp
      let expirationTimestamp = 0;
      if (offerDetails.expirationDate) {
        expirationTimestamp = Math.floor(offerDetails.expirationDate.getTime() / 1000);
        console.log(`[NFTDetailPage] Offer expiration set to:`, offerDetails.expirationDate, `(timestamp: ${expirationTimestamp})`);
      }
      
      console.log(`[NFTDetailPage] Making offer:`, {
        contract: nft.collection.contract,
        tokenId: nft.tokenId,
        amount: offerDetails.price,
        amountWei: offerAmount.toString(),
        expiration: expirationTimestamp,
        walletAddress: connectedAddress
      });
      
      toast.loading('Submitting offer to blockchain...', { id: 'make-offer' });
      
      const tx = await makeOfferOnNFT(
        nft.collection.contract,
        nft.tokenId,
        offerAmount,
        expirationTimestamp,
        walletClient
      );
      
      console.log(`[NFTDetailPage] Offer transaction submitted:`, tx.hash);
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'make-offer' });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success('Offer submitted successfully!', { id: 'make-offer' });
        
        // Close modal and refresh user offers
        setShowOfferModal(false);
        setTimeout(() => {
          fetchUserOffers();
          fetchMarketData(); // Refresh all market data
        }, 2000);
      } else {
        console.error(`[NFTDetailPage] Transaction failed with status:`, receipt?.status);
        toast.error('Transaction failed. Please try again.', { id: 'make-offer' });
      }
    } catch (error: any) {
      console.error(`[NFTDetailPage] Error making offer:`, error);
      
      // IMPROVED: Better error handling with specific cases
      let errorMessage = 'Error making offer';
      
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees or offer amount';
        } else if (error.message.includes('execution reverted')) {
          // Check for specific contract revert reasons
          if (error.message.includes('AfterMintMarketplace__OfferAlreadyExists')) {
            errorMessage = 'You already have an active offer for this NFT. Please cancel it first.';
          } else if (error.message.includes('AfterMintMarketplace__OfferAmountTooLow')) {
            errorMessage = 'Offer amount is too low. Please increase your offer.';
          } else if (error.message.includes('AfterMintMarketplace__InvalidExpiration')) {
            errorMessage = 'Invalid expiration date. Please check your expiration settings.';
          } else if (error.message.includes('Marketplace__Paused')) {
            errorMessage = 'Marketplace is currently paused. Please try again later.';
        } else {
            // Generic revert
            errorMessage = 'Transaction reverted. You may already have an offer or there may be a contract issue.';
        }
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `Error: ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`;
      }
      }
      
      toast.error(errorMessage, { id: 'make-offer' });
    } finally {
      setIsMakingOffer(false);
    }
  };

  // Fix the renderOwnerControls function to use isListModalOpen state
  const renderOwnerControls = () => {
    if (!isOwner) return null;

      return (
      <div className="mt-6 p-4 bg-theme-surface-secondary rounded-lg shadow">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Owner Actions</h3>
        <div className="space-y-3">
          {isNFTListed && currentListing ? (
            <>
              <p className="text-sm text-theme-text-secondary">
                Your NFT is listed for <span className="font-bold text-theme-primary">{ethers.formatUnits(currentListing.price, 18)} BASED</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowUpdatePriceModal(true)}
                  className="btn-futuristic-secondary flex-1"
            >
                  <PencilIcon size={18} className="mr-2" /> Update Price
            </button>
            <button
              onClick={handleCancelListing}
                  className="btn-futuristic-danger flex-1"
                  disabled={isCancellingListing}
                >
                  {isCancellingListing ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <XCircle size={18} className="mr-2" />
                  )}
                  Cancel Listing
        </button>
      </div>
            </>
          ) : (
            <button
              onClick={() => setIsListModalOpen(true)}
              className="btn-futuristic w-full"
            >
              <TagIcon size={18} className="mr-2" /> List for Sale
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Update price modal component
  const renderUpdatePriceModal = () => {
    if (!showUpdatePriceModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-theme-surface rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-theme-text-primary">Update Listing Price</h3>
            <button onClick={() => setShowUpdatePriceModal(false)} className="text-theme-text-secondary hover:text-theme-text-primary">
              <XMarkIcon size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">New Price (BASED)</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-3 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
              placeholder="Enter new price in BASED"
              min="0"
              step="0.000001"
            />
            <p className="text-xs text-theme-text-secondary mt-2">
              Current price: {currentListing ? ethers.formatUnits(currentListing.price, 18) : "Not listed"} BASED
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpdatePriceModal(false)}
              className="btn-futuristic-secondary flex-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePrice}
              className="btn-futuristic flex-1 py-2"
            >
              Update Price
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Handle cancel listing
  const handleCancelListing = async () => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet to cancel the listing');
      return;
    }
    
    if (!nft || !nft.collection || !nft.collection.contract) {
      toast.error('NFT data is incomplete');
      return;
    }
    
    try {
      setIsCancellingListing(true);
      toast.loading('Cancelling listing...', { id: 'cancel-listing' });
      
      console.log(`[NFTDetailPage] Cancelling listing for ${nft.collection.contract}/${nft.tokenId}`);
      
      // Call the cancel function
      const tx = await cancelNFTListing(
        nft.collection.contract,
        nft.tokenId,
        walletClient
      );
      
      toast.loading(`Transaction sent! Waiting for confirmation...`, { id: 'cancel-listing' });
      console.log(`[NFTDetailPage] Cancel listing transaction sent: ${tx.hash}`);
      
      // Update UI
      setCurrentListing(null);
      
      // Update the nft state to reflect the listing cancellation
      setNft((prevNft: any) => ({
        ...prevNft,
        isListed: false,
        price: undefined
      }));
      
      toast.success('Listing cancelled successfully!', { id: 'cancel-listing' });
    } catch (error: any) {
      console.error('Error cancelling listing:', error);
      
      let errorMessage = error.message || 'Unknown error';
  
      // Handle specific error messages more clearly
      if (errorMessage.includes('getAddress is not a function')) {
        errorMessage = 'Wallet connection error. Please try reconnecting your wallet.';
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was rejected in your wallet.';
      } else if (errorMessage.includes('window.ethereum')) {
        errorMessage = 'Browser wallet not detected or not properly connected.';
      }
      
      toast.error(`Failed to cancel listing: ${errorMessage}`, { id: 'cancel-listing' });
    } finally {
      setIsCancellingListing(false);
    }
  };
  
  /**
   * Check if the NFT is listed on the marketplace
   */
  const checkIfNFTIsListed = async (toastId?: string) => {
    if (!nft?.collection?.contract || !tokenId) {
      console.warn('[NFTDetailPage] Cannot check listing: missing contract or tokenId');
      if (toastId) toast.error('Cannot check listing status: missing NFT data', { id: toastId });
      return;
    }
    
    try {
      setIsFetchingOwnerOrListing(true);
      
      // Get the current listing info
      const listingInfo = await getListingInfo(
        nft.collection.contract, // Make sure nft.collection.contract exists
        parseInt(tokenId),
        publicClient
      );
      
      console.log(`[NFTDetailPage] Listing check for ${nft.collection.contract}/${tokenId}:`, listingInfo);
      
      // Update state with listing info and status
      setCurrentListing(listingInfo);
      
      // Update toast message
      if (toastId) {
        if (listingInfo) {
          toast.success(`NFT is listed for ${ethers.formatUnits(listingInfo.price, 18)} BASED`, { id: toastId });
        } else {
          toast.success('NFT is not currently listed', { id: toastId });
        }
      }
      
    } catch (error: any) {
      console.error('[NFTDetailPage] Error checking if NFT is listed:', error);
      if (toastId) {
        toast.error(`Failed to check listing status: ${error.message || 'Unknown error'}`, { id: toastId });
      }
      // Don't change current listing state on error - maintain previous state
    } finally {
      setIsFetchingOwnerOrListing(false);
    }
  };

  // Render offer modal
  const renderOfferModal = () => {
    if (!showOfferModal) return null;
    
    const expirationPresets = [
      { label: '1 Hour', hours: 1 },
      { label: '12 Hours', hours: 12 },
      { label: '1 Day', hours: 24 },
      { label: '3 Days', hours: 72 },
      { label: '7 Days', hours: 168 },
      { label: '30 Days', hours: 720 },
      { label: 'No Expiration', hours: null }
    ];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-theme-surface rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-theme-text-primary">Make an Offer</h2>
            <button onClick={() => setShowOfferModal(false)} className="p-1.5 rounded-full hover:bg-theme-hover">
              <XMarkIcon size={20} className="text-theme-text-secondary" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Offer Amount Input */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                Offer Amount (BASED)
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full p-3 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="Enter amount in BASED"
                min="0"
                step="0.000001"
              />
              
              <p className="text-xs text-theme-text-secondary mt-2">
                {currentListing ? (
                  <>Current listing price: {ethers.formatUnits(currentListing.price, 18)} BASED</>
                ) : (
                  <>This NFT is not currently listed</>
                )}
              </p>
            </div>
            
            {/* Expiration Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Offer Expiration
              </label>
              
              {/* Preset Options */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {expirationPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSelectedExpiration(preset.hours);
                      setUseCustomExpiration(false);
                    }}
                    className={`p-2 text-xs rounded-md border transition-colors ${
                      !useCustomExpiration && selectedExpiration === preset.hours
                        ? 'bg-theme-primary text-black border-theme-primary'
                        : 'bg-theme-surface-secondary border-theme-border text-theme-text-secondary hover:border-theme-primary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Date Option */}
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useCustomExpiration}
                    onChange={(e) => setUseCustomExpiration(e.target.checked)}
                    className="mr-2 accent-theme-primary"
                  />
                  <span className="text-sm text-theme-text-secondary">Custom expiration date</span>
                </label>
                
                {useCustomExpiration && (
                  <input
                    type="datetime-local"
                    value={customExpiration}
                    onChange={(e) => setCustomExpiration(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full mt-2 p-2 bg-theme-surface-secondary border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
                  />
                )}
              </div>
              
              {/* Expiration Summary */}
              <div className="mt-2 p-2 bg-theme-surface-secondary rounded-md">
                <p className="text-xs text-theme-text-secondary">
                  {selectedExpiration === null && !useCustomExpiration ? (
                    'Offer will never expire'
                  ) : (
                    `Offer expires: ${calculateExpirationDate()?.toLocaleString() || 'Invalid date'}`
                  )}
                </p>
              </div>
            </div>
            
            {/* Offer Terms */}
            <div className="pt-2">
              <div className="text-xs text-theme-text-secondary mb-4 space-y-1">
                <p>• Funds will be escrowed until offer is accepted or cancelled</p>
                <p>• You can cancel your offer at any time to retrieve your funds</p>
                <p>• Owner will receive notification of your offer</p>
                {selectedExpiration !== null && (
                  <p>• Offer will automatically expire after the selected time</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="btn-futuristic-secondary flex-1 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMakeOffer({ 
                    price: offerAmount, 
                    expirationDate: calculateExpirationDate() 
                  })}
                  className="btn-futuristic flex-1 py-2"
                  disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isMakingOffer}
                >
                  {isMakingOffer ? 'Making Offer...' : 'Make Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render diagnostics panel
  const renderDiagnosticsPanel = () => {
    if (!showDiagnostics) return null;
    
    return (
      <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-4 m-4 rounded-lg shadow-lg max-w-lg max-h-96 overflow-auto z-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Diagnostics Panel</h3>
          <button onClick={() => setShowDiagnostics(false)} className="text-gray-400 hover:text-white">
            <XMarkIcon size={20} />
          </button>
        </div>
        <p>Diagnostics panel is not fully implemented yet.</p>
      </div>
    );
  };
  
  // Add local formatEarliestListingExpiration
  const formatEarliestListingExpiration = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Function to fetch user's offers for this NFT
  const fetchUserOffers = async () => {
    if (!collectionAddress || !tokenId || !connectedAddress) return;
    
    setUserOffersLoading(true);
    try {
      console.log(`[NFTDetailPage] Fetching user offers for ${collectionAddress} #${tokenId} from user ${connectedAddress}`);
      
      const provider = getBasedAIProvider();
      const offers = await getUserOffersForNFT(collectionAddress, tokenId, connectedAddress, provider);
      
      console.log(`[NFTDetailPage] User offers fetched:`, offers);
      setUserOffers(offers);
      
    } catch (error) {
      console.error('[NFTDetailPage] Error fetching user offers:', error);
      setUserOffers([]);
    } finally {
      setUserOffersLoading(false);
    }
  };

  // Function to handle updating an offer
  const handleUpdateOffer = async (offerId: string, newPrice: string) => {
    try {
      console.log(`Updating offer ${offerId} to ${newPrice}`);
      
      if (!userOffers.length) {
        toast.error('No offers found to update');
        return;
      }

      // Get the first user offer (since we can only have one offer per NFT)
      const offerToUpdate = userOffers[0];
      
      if (!walletClient) {
        toast.error('Please connect your wallet first');
        return;
      }

      // IMPROVED: Show a modal to get new price instead of using current price
      const newOfferPrice = prompt('Enter new offer price (BASED):', offerToUpdate.priceInEth.toString());
      
      if (!newOfferPrice || isNaN(parseFloat(newOfferPrice)) || parseFloat(newOfferPrice) <= 0) {
        toast.error('Please enter a valid offer price');
        return;
      }

      // Calculate expiration timestamp (keep same as original or default to 7 days)
      const expirationDate = offerToUpdate.expiration || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
      
      setIsCancellingOffer(true);
      toast.loading('Updating offer...', { id: 'update-offer' });
      
      console.log(`[NFTDetailPage] Updating offer for ${collectionAddress}/${tokenId} to ${newOfferPrice} BASED`);
      
      // Use the updateOffer function from storageService
      const tx = await updateOffer(
        collectionAddress!,
        tokenId!,
        newOfferPrice,
        expirationTimestamp,
        walletClient
      );
      
      console.log(`[NFTDetailPage] Update offer transaction hash:`, tx.hash);
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'update-offer' });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success(`Offer updated to ${newOfferPrice} BASED successfully!`, { id: 'update-offer' });
        
        // Refresh user offers after successful update
        setTimeout(() => {
          fetchUserOffers();
          fetchMarketData();
        }, 2000);
      } else {
        toast.error('Update transaction failed. Please try again.', { id: 'update-offer' });
      }
    } catch (error: any) {
      console.error(`[NFTDetailPage] Error updating offer:`, error);
      
      let errorMessage = 'Error updating offer';
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees or new offer amount';
        } else {
          errorMessage = `Update failed: ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`;
        }
      }
      
      toast.error(errorMessage, { id: 'update-offer' });
    } finally {
      setIsCancellingOffer(false);
    }
  };

  // Function to handle canceling an offer
  const handleCancelOffer = async (offerId: string) => {
    try {
      console.log(`Cancelling offer ${offerId}`);
      
      if (!walletClient) {
        toast.error('Please connect your wallet first');
        return;
      }
      
      toast.loading('Cancelling offer...', { id: 'cancel-offer' });
      
      await cancelOffer(collectionAddress, tokenId, walletClient);
      
      toast.success('Offer cancelled successfully!', { id: 'cancel-offer' });
      
      // Refresh data
      await fetchUserOffers();
      await fetchMarketData();
      
    } catch (error: any) {
      console.error('Error cancelling offer:', error);
      toast.error(`Failed to cancel offer: ${error.message}`, { id: 'cancel-offer' });
    }
  };

  // Render user offers section
  const renderUserOffers = () => {
    if (userOffersLoading) {
      return (
        <div className="mt-6 p-4 bg-theme-surface rounded-lg border border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Your Offers</h3>
          <p className="text-theme-text-secondary">Loading your offers...</p>
        </div>
      );
    }
    
    if (userOffers.length === 0) {
      return (
        <div className="mt-6 p-4 bg-theme-surface rounded-lg border border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Your Offers</h3>
          <p className="text-theme-text-secondary">You have no active offers for this NFT.</p>
          <button 
            onClick={() => setShowOfferModal(true)} 
            className="btn-futuristic text-sm py-2 px-4 mt-3"
            disabled={!isConnected || isOwner}
          >
            Make an Offer
          </button>
        </div>
      );
    }
    
    return (
      <div className="mt-6 p-4 bg-theme-surface rounded-lg border border-theme-border">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Your Offers</h3>
        <div className="space-y-3">
          {userOffers.map((offer, index) => {
            // Check if offer is expired
            const isExpired = Boolean(offer.expiration && offer.expiration < new Date());
            const expirationText = offer.expiration ? formatDate(offer.expiration) : 'No expiration';
            
            return (
              <div key={index} className={`border rounded-md p-3 ${isExpired ? 'border-red-500/30 bg-red-500/5' : 'border-theme-border bg-theme-surface-secondary'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-theme-text-primary">
                    Offer #{offer.offerId}
                    {isExpired && <span className="ml-2 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">EXPIRED</span>}
                  </span>
                  <span className={`text-sm ${isExpired ? 'text-red-400' : 'text-theme-text-secondary'}`}>
                    {expirationText}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-theme-text-primary">Price: {offer.price}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateOffer(offer.offerId, offer.price)}
                    className="btn-futuristic-secondary text-sm py-1.5 px-3"
                    disabled={isCancellingOffer || isExpired}
                    title={isExpired ? "Cannot update expired offer" : "Update offer price"}
                  >
                    Update Offer
                  </button>
                  <button 
                    onClick={() => handleCancelOffer(offer.offerId)}
                    className="btn-futuristic-destructive text-sm py-1.5 px-3"
                    disabled={isCancellingOffer}
                    title="Cancel this offer"
                  >
                    Cancel Offer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button 
          onClick={() => setShowOfferModal(true)} 
          className="btn-futuristic text-sm py-2 px-4 mt-4"
          disabled={!isConnected || isOwner}
        >
          Make Another Offer
        </button>
      </div>
    );
  };

  // Function to fetch real market data from blockchain
  const fetchMarketData = async () => {
    if (!collectionAddress || !tokenId) return;
    
    setMarketDataLoading(true);
    try {
      console.log(`[NFTDetailPage] Fetching real market data for ${collectionAddress} #${tokenId}`);
      
      const provider = getBasedAIProvider();
      const marketData = await getNFTMarketData(collectionAddress, tokenId, provider);
      
      console.log(`[NFTDetailPage] Market data fetched:`, marketData);
      
      setRealOffers(marketData.offers);
      setRealHistory(marketData.history);
      
      // Update the NFT object to include real data instead of mock data
      setNft((prevNft: any) => {
        if (!prevNft) return prevNft;
        return {
          ...prevNft,
          offers: marketData.offers,
          activities: marketData.history
        };
      });
      
      // Fetch user's offers after market data is loaded
      if (connectedAddress) {
        fetchUserOffers();
      }
      
    } catch (error) {
      console.error('[NFTDetailPage] Error fetching market data:', error);
      // Keep empty arrays as fallback
      setRealOffers([]);
      setRealHistory([]);
    } finally {
      setMarketDataLoading(false);
    }
  };
  
  // Function to fetch collection-wide offers and sales
  const fetchCollectionData = async () => {
    if (!collectionAddress) return;
    
    setCollectionDataLoading(true);
    
    try {
      console.log(`[NFTDetailPage] Fetching collection data for ${collectionAddress}...`);
      
      // Normalize address to prevent checksum errors
      const normalizedAddress = ethers.getAddress(collectionAddress);
      
      const provider = getBasedAIProvider();
      
      // Create storage contract instance to query collection events
      const STORAGE_ABI = [
        "function getAllOffers() view returns (tuple(address buyer, address nftContract, uint256 tokenId, uint256 amount, uint64 expirationTimestamp, bool isActive, uint256 offerId)[])",
        "event OfferMade(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 amount, uint64 expirationTimestamp)",
        "event OfferAccepted(address indexed buyer, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 amount)",
        "event Sale(address indexed buyer, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price, uint256 timestamp)"
      ];
      
      const storageContract = new ethers.Contract(
        MARKETPLACE_STORAGE_ADDRESS,
        STORAGE_ABI,
        provider
      );
      
      // Get all offers and filter by collection
      const allOffers = await storageContract.getAllOffers();
      const collectionOffersData = allOffers
        .filter((offer: any) => offer.nftContract.toLowerCase() === normalizedAddress.toLowerCase())
        .filter((offer: any) => offer.isActive)
        .map((offer: any) => ({
          offerId: offer.offerId.toString(),
          from: offer.buyer,
          to: '', // Not applicable for offers
          nftContract: offer.nftContract,
          tokenId: offer.tokenId.toString(),
          price: `${ethers.formatEther(offer.amount)} BASED`,
          priceInEth: parseFloat(ethers.formatEther(offer.amount)),
          expiration: offer.expirationTimestamp > 0 ? new Date(Number(offer.expirationTimestamp) * 1000) : null,
          isExpired: offer.expirationTimestamp > 0 ? Number(offer.expirationTimestamp) < Math.floor(Date.now() / 1000) : false,
          status: 'active'
        }));

      // Get collection sales from events (last 1000 blocks for performance)
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1000);
      
      const saleFilter = storageContract.filters.Sale(null, null, normalizedAddress);
      const saleEvents = await storageContract.queryFilter(saleFilter, fromBlock, currentBlock);
      
      const collectionSalesData = await Promise.all(
        saleEvents.map(async (event: any) => {
          const block = await event.getBlock();
          return {
            type: 'Sale' as const, // Fix type issue
            from: event.args.seller || null,
            to: event.args.buyer || null,
            nftContract: event.args.nftContract,
            tokenId: event.args.tokenId.toString(),
            price: `${ethers.formatEther(event.args.price)} BASED`,
            priceInEth: parseFloat(ethers.formatEther(event.args.price)),
            date: new Date(block.timestamp * 1000),
            transactionHash: event.transactionHash
          };
        })
      );

      // Sort sales by date (most recent first)
      collectionSalesData.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
      
      console.log(`[NFTDetailPage] Collection data fetched:`, {
        offers: collectionOffersData.length,
        sales: collectionSalesData.length
      });
      
      setCollectionOffers(collectionOffersData);
      setCollectionSales(collectionSalesData);
      
    } catch (error) {
      console.error('[NFTDetailPage] Error fetching collection data:', error);
      setCollectionOffers([]);
      setCollectionSales([]);
    } finally {
      setCollectionDataLoading(false);
    }
  };

  // Handle accept offer
  const handleAcceptOffer = async (buyerAddress: string, offerPrice: string) => {
    if (!isConnected || !nft || !nft.collection || !nft.collection.contract || !nft.tokenId) {
      toast.error('Missing required data to accept offer');
      return;
    }
    
    if (!isOwner) {
      toast.error('Only the NFT owner can accept offers');
      return;
    }
    
    try {
      setIsAcceptingOffer(buyerAddress);
      toast.loading(`Accepting offer of ${offerPrice}...`, { id: 'accept-offer' });
      
      console.log(`[NFTDetailPage] Accepting offer from ${buyerAddress} for ${nft.collection.contract}/${nft.tokenId}`);
      
      const tx = await acceptOffer(
        nft.collection.contract,
        nft.tokenId.toString(),
        buyerAddress,
        walletClient
      );
      
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'accept-offer' });
      console.log(`[NFTDetailPage] Accept offer transaction:`, tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        toast.success('Offer accepted successfully! NFT has been sold.', { id: 'accept-offer' });
        
        // Refresh page after successful sale
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('Transaction failed. Please try again.', { id: 'accept-offer' });
      }
    } catch (error: any) {
      console.error('[NFTDetailPage] Error accepting offer:', error);
      
      let errorMessage = 'Error accepting offer';
      if (error.message) {
        if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction fees';
        } else {
          errorMessage = `Error: ${error.message.substring(0, 100)}...`;
        }
      }
      
      toast.error(errorMessage, { id: 'accept-offer' });
    } finally {
      setIsAcceptingOffer(null);
    }
  };
  
  // Fetch user offers when wallet connects/disconnects or NFT changes
  useEffect(() => {
    if (connectedAddress && collectionAddress && tokenId && !marketDataLoading) {
      fetchUserOffers();
    } else {
      setUserOffers([]);
    }
  }, [connectedAddress, collectionAddress, tokenId, marketDataLoading]);
  
  // Refresh collection data when collection-offers tab is selected
  useEffect(() => {
    if (activeTab === 'collection-offers' && collectionOffers.length === 0 && !collectionDataLoading) {
      fetchCollectionData();
    }
  }, [activeTab]);
  
  return (
    <div className="min-h-screen bg-theme-background text-theme-text-primary pb-20">
      {/* Header and navigation - removed duplicate back link */}
        
      <main className="container mx-auto px-2 sm:px-4 py-2">
        {/* NFT Details Section */}
        {loading ? (
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className="w-full md:w-1/2 aspect-square bg-theme-surface rounded-xl"></div>
            <div className="w-full md:w-1/2">
              <div className="h-8 bg-theme-surface rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-theme-surface rounded w-1/2 mb-6"></div>
              <div className="h-32 bg-theme-surface rounded mb-6"></div>
              <div className="h-12 bg-theme-surface rounded mb-4"></div>
            </div>
          </div>
        ) : nft ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - NFT Image and Actions */}
            <div className="w-full lg:w-1/2">
              <div className="rounded-xl overflow-hidden bg-theme-surface border border-theme-border shadow-lg">
                <div className="aspect-square relative nft-image-container">
                  {nft.image ? (
                    <Image 
                      src={nft.image} 
                      alt={nft.name || `NFT #${nft.tokenId}`}
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-theme-surface-secondary">
                      <div className="text-theme-text-secondary">No image available</div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-theme-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
            <button 
                        className="text-theme-text-secondary hover:text-red-500 transition-colors"
              onClick={() => setIsLiked(!isLiked)}
            >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
                      <span className="text-sm text-theme-text-secondary">
                        {nft.likeCount || 0}
                      </span>
        </div>
        
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-theme-text-secondary hover:text-theme-primary transition-colors"
                        onClick={() => handleCopy(window.location.href)}
                      >
                        <Share2 size={18} className="mr-1" />
                        {copied ? <Check size={18} /> : null}
                      </button>
              </div>
                    </div>
                    </div>
                  </div>
              
              {/* Owner controls moved to right column */}
                </div>
                
            {/* Right Column - NFT Details */}
            <div className="w-full lg:w-1/2">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href={`/collection/${nft.collection?.contract || collectionAddress}`}
                    className="text-sm text-theme-primary hover:underline"
                  >
                    {nft.collection?.name || "Unknown Collection"}
                  </Link>
                  {nft.collection?.isVerified && (
                    <ShieldCheck size={16} className="text-blue-500" />
                      )}
                    </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{nft.name || `NFT #${nft.tokenId}`}</h1>
                  
                  {/* Owner Actions moved here */}
                  {isOwner && (
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-theme-surface-secondary rounded-lg shadow border border-theme-border/30">
                        <h3 className="text-sm font-semibold text-theme-text-primary mb-2">Owner Actions</h3>
                        <div className="space-y-2">
                          {isNFTListed && currentListing ? (
                            <div className="flex flex-col gap-2">
                              <p className="text-xs text-theme-text-secondary">
                                Listed for <span className="font-bold text-theme-primary">{ethers.formatUnits(currentListing.price, 18)} BASED</span>
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowUpdatePriceModal(true)}
                                  className="px-3 py-1 text-xs bg-theme-primary text-black rounded-lg hover:bg-theme-primary/90 transition-colors"
                                >
                                  <PencilIcon size={12} className="mr-1 inline" /> Update
                                </button>
                                <button
                                  onClick={handleCancelListing}
                                  className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  disabled={isCancellingListing}
                                >
                                  {isCancellingListing ? (
                                    <svg className="animate-spin h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <XCircle size={12} className="mr-1 inline" />
                                  )}
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsListModalOpen(true)}
                              className="px-3 py-1 text-xs bg-theme-primary text-black rounded-lg hover:bg-theme-primary/90 transition-colors w-full"
                            >
                              <TagIcon size={12} className="mr-1 inline" /> List for Sale
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mt-2 mb-6">
                  <span className="text-theme-text-secondary mr-1">Owned by</span>
                  {nft.owner ? (
                    <Link 
                      href={`/profile/${nft.owner}`}
                      className="text-theme-primary hover:underline"
                    >
                      {shortenAddress(nft.owner, 6)}
                  </Link>
                  ) : (
                    <span className="text-theme-text-secondary">Unknown</span>
                  )}
                </div>
                
                {isNFTListed && currentListing ? (
                  <div className="p-4 bg-theme-surface-secondary rounded-lg mb-6 border border-theme-border/30 shadow-lg animated-gradient-border-wrapper">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-theme-text-secondary">Current price</span>
                      {Number(currentListing.expiresAt) > 0 && (
                        <span className="text-xs text-theme-text-secondary">
                          Expires {formatEarliestListingExpiration(Number(currentListing.expiresAt))}
                    </span>
                      )}
                  </div>
                    <div className="text-3xl font-bold text-theme-primary">
                      {ethers.formatUnits(currentListing.price, 18)} BASED
        </div>
        
                    {currentListing.privateBuyer !== ethers.ZeroAddress && (
                      <div className="mt-2 text-sm text-amber-500">
                        <User size={14} className="inline mr-1" />
                        Private listing for {shortenAddress(currentListing.privateBuyer, 4)}
                      </div>
                )}
              </div>
                ) : (
                  <div className="p-4 bg-theme-surface-secondary rounded-lg mb-6 border border-theme-border/30">
                    <span className="text-theme-text-secondary">Not listed for sale</span>
            </div>
                )}
            
                {/* Action buttons for non-owners - moved to right column */}
                {!isOwner && (
                  <div className="mb-6 space-y-3">
                    {isNFTListed && currentListing ? (
              <button 
                        className="btn-futuristic w-full py-3 text-lg"
                        disabled={!isWalletConnected}
                        onClick={handleBuyNft}
              >
                        <ShoppingCart size={20} className="mr-2" />
                        Buy Now for {ethers.formatUnits(currentListing.price, 18)} BASED
              </button>
                    ) : null}
                    
              <button 
                      className="btn-futuristic-secondary w-full py-3"
                      disabled={!isWalletConnected}
                      onClick={() => setShowOfferModal(true)}
              >
                      <TagIcon size={20} className="mr-2" />
                      Make Offer
              </button>
            </div>
                )}
                  
                {/* Tabs */}
                <div className="border-b border-theme-border mb-6">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                        className={`px-4 py-2 font-medium whitespace-nowrap relative ${
                          activeTab === tab.id
                            ? 'text-theme-primary'
                            : 'text-theme-text-secondary hover:text-theme-text-primary'
                        }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>
                        )}
                  </button>
                ))}
              </div>
            </div>
            
                {/* Tab Content */}
                <div>
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      {nft.description && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Description</h3>
                          <p className="text-theme-text-secondary whitespace-pre-line">
                            {nft.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'traits' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Traits</h3>
                      {nft.attributes && nft.attributes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {nft.attributes.map((trait: any, index: number) => (
                            <div key={index} className="bg-theme-surface-secondary rounded-lg p-3 border border-theme-border/30">
                              <p className="text-xs text-theme-text-secondary mb-1">
                                {trait.trait_type}
                              </p>
                              <p className="font-semibold text-theme-text-primary">
                                {trait.value}
                              </p>
                              {trait.rarity && (
                                <p className="text-xs text-theme-primary mt-1">
                                  {trait.rarity < 10 ? 'Rare' : trait.rarity < 25 ? 'Uncommon' : 'Common'} • {trait.rarity}%
                                </p>
                              )}
                      </div>
                    ))}
                  </div>
                      ) : (
                        <p className="text-theme-text-secondary">No traits found for this NFT.</p>
                      )}
                </div>
              )}
              
                  {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Sales & Activity</h3>
                  {marketDataLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto"></div>
                      <p className="text-theme-text-secondary mt-2">Loading activity...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Collection Sales */}
                      {collectionSales && collectionSales.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-3 text-theme-primary">Recent Collection Sales</h4>
                          <div className="divide-y divide-theme-border">
                            {collectionSales.slice(0, 10).map((sale: ProcessedActivity, index: number) => (
                              <div key={index} className="py-3 flex justify-between items-center">
                                <div>
                                  <p className="text-theme-text-primary font-medium">
                                    Sale: NFT #{sale.tokenId}
                                  </p>
                                  <div className="text-sm text-theme-text-secondary">
                                    <span>From: {sale.from ? shortenAddressFromStorage(sale.from) : 'Unknown'}</span>
                                    <span className="ml-2">To: {sale.to ? shortenAddressFromStorage(sale.to) : 'Unknown'}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-theme-text-primary font-medium">
                                    {sale.price}
                                  </p>
                                  <p className="text-sm text-theme-text-secondary">
                                    {formatDate(sale.date)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* This NFT's Activity */}
                      {realHistory && realHistory.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-3 text-theme-primary">This NFT's Activity</h4>
                    <div className="divide-y divide-theme-border">
                      {realHistory.map((activity: ProcessedActivity, index: number) => (
                        <div key={index} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="text-theme-text-primary font-medium">
                              {activity.type}
                            </p>
                            <div className="text-sm text-theme-text-secondary">
                              {activity.from && (
                                <span>
                                  From: {activity.from === '0x0000000000000000000000000000000000000000' ? 'Mint' : shortenAddressFromStorage(activity.from)}
                                </span>
                              )}
                              {activity.to && (
                                <span className="ml-2">
                                  To: {shortenAddressFromStorage(activity.to)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-theme-text-primary font-medium">
                              {activity.price || '-'}
                            </p>
                            <p className="text-sm text-theme-text-secondary">
                              {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                        </div>
                      )}
                      
                      {(!collectionSales || collectionSales.length === 0) && (!realHistory || realHistory.length === 0) && (
                        <p className="text-theme-text-secondary text-center py-8">No activity history available.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
                  {activeTab === 'offers' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Offers for this NFT</h3>
                      
                      {/* User's own offers section */}
                      {isConnected && userOffers.length > 0 && (
                        <div className="mb-6 p-4 bg-theme-surface-secondary rounded-lg border border-theme-border">
                          <h4 className="text-md font-medium mb-3 text-theme-primary">Your Offers</h4>
                          <div className="divide-y divide-theme-border">
                            {userOffers.map((offer: ProcessedOffer, index: number) => (
                              <div key={index} className="py-3 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-theme-text-primary">You</p>
                                    <p className="text-sm text-theme-text-secondary">
                                      Expires: {offer.expiration ? formatDate(offer.expiration) : 'No expiration'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="font-semibold text-theme-text-primary">{offer.price}</span>
                                  <button
                                    onClick={() => handleCancelOffer(offer.offerId)}
                                    disabled={isCancellingOffer}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded-md transition-colors"
                                  >
                                    {isCancellingOffer ? 'Cancelling...' : 'Cancel'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {marketDataLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto"></div>
                          <p className="text-theme-text-secondary mt-2">Loading offers...</p>
                        </div>
                      ) : realOffers && realOffers.length > 0 ? (
                        <div className="divide-y divide-theme-border">
                          {realOffers.map((offer: ProcessedOffer, index: number) => (
                            <div key={index} className="py-3 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-theme-text-primary">
                                    {shortenAddress(offer.from)}
                                  </p>
                                  <p className="text-sm text-theme-text-secondary">
                                    Expires: {offer.expiration ? formatDate(offer.expiration) : 'No expiration'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-semibold text-theme-text-primary">{offer.price}</span>
                                {/* Show accept button only if user is owner and this is not their own offer */}
                                {isOwner && isConnected && offer.from.toLowerCase() !== connectedAddress?.toLowerCase() && (
                                  <button
                                    onClick={() => handleAcceptOffer(offer.from, offer.price)}
                                    disabled={isAcceptingOffer === offer.from}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm rounded-md transition-colors"
                                  >
                                    {isAcceptingOffer === offer.from ? 'Accepting...' : 'Accept'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-theme-text-secondary">
                          <p>No offers have been made for this NFT yet.</p>
                        </div>
                      )}
                    </div>
                  )}
              
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                <div>
                        <h3 className="text-lg font-semibold mb-2">Contract Details</h3>
                        <div className="bg-theme-surface-secondary rounded-lg p-4 border border-theme-border/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-theme-text-secondary mb-1">Token ID</p>
                              <p className="font-medium text-theme-text-primary">{nft.tokenId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-theme-text-secondary mb-1">Contract Address</p>
                              <p className="font-medium text-theme-text-primary truncate">
                      <a 
                        href={`https://explorer.bf1337.org/address/${nft.collection.contract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                                  className="hover:text-theme-primary flex items-center"
                      >
                                  {shortenAddress(nft.collection.contract, 8)}
                                  <ExternalLink size={14} className="ml-1" />
                      </a>
                              </p>
                    </div>
                            {nft.tokenStandard && (
                              <div>
                                <p className="text-sm text-theme-text-secondary mb-1">Token Standard</p>
                                <p className="font-medium text-theme-text-primary">{nft.tokenStandard}</p>
                    </div>
                            )}
                            {nft.collection && nft.collection.name && (
                              <div>
                                <p className="text-sm text-theme-text-secondary mb-1">Collection</p>
                                <Link
                                  href={`/collection/${nft.collection.contract}`}
                                  className="font-medium text-theme-primary hover:underline"
                                >
                                  {nft.collection.name}
                                </Link>
                    </div>
                            )}
                            {nft.rarityRank && (
                              <div>
                                <p className="text-sm text-theme-text-secondary mb-1">Rarity Rank</p>
                                <p className="font-medium text-theme-text-primary">#{nft.rarityRank}</p>
                    </div>
                            )}
                            {nft.rarityScore && (
                              <div>
                                <p className="text-sm text-theme-text-secondary mb-1">Rarity Score</p>
                                <p className="font-medium text-theme-text-primary">{nft.rarityScore.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
                  )}
                  
                  {/* Other tab content goes here */}
                    </div>
                  </div>
            </div>
                      </div>
                    ) : (
          <div className="text-center py-20">
            <p className="text-theme-text-secondary text-xl">NFT not found</p>
            <p className="mt-2">The NFT you're looking for might not exist or there was an error loading it.</p>
                      </div>
                    )}
      </main>

      {/* Render the ListNftModal component */}
      {isListModalOpen && nft && (
        <ListNftModal
          isOpen={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
          nft={{
            id: tokenId,
            name: nft.name || `NFT #${tokenId}`,
            image: nft.image || '/placeholder-image.png', // Provide a fallback
            contractAddress: collectionAddress,
            collectionName: nft.collection?.name || 'Unknown Collection',
          }}
          onConfirmListing={handleConfirmListNft}
        />
      )}

      {/* Keep only the necessary modals */}
      {renderUpdatePriceModal()}
      {renderOfferModal()}
      {renderDiagnosticsPanel()}

      <Toaster 
        position="top-center" 
        containerStyle={{
          top: 100,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '500px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          },
        }}
          />
      </div>
  );
} 