import { ethers, BrowserProvider, Signer } from 'ethers';
import { marketplaceABI } from '../abi/marketplaceABI';
import { erc721MinimalApproveABI } from '../abi/erc721MinimalApproveABI';
import { MARKETPLACE_CONTRACT_ADDRESS, NATIVE_TOKEN_ADDRESS } from '../constants/contracts';
import { getBasedAIProvider } from './nftService';
import { formatEther } from 'ethers';

/**
 * Creates an instance of the Marketplace contract
 */
export function getMarketplaceContract(
  provider: ethers.Provider,
  signerOrProvider?: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(
    MARKETPLACE_CONTRACT_ADDRESS,
    marketplaceABI,
    signerOrProvider || provider
  );
}

/**
 * Helper type for NFT listing data
 */
export interface NFTListing {
  seller: string;
  price: bigint;
  paymentToken: string;
  listedAt: number;
  expiresAt: number;
  privateBuyer: string;
  historicalListingIndex: bigint;
}

/**
 * Gets the listing information for a specific NFT if it exists
 */
export async function getListingInfo(
  nftContractAddress: string,
  tokenId: number,
  provider: any // Changed from ethers.Provider to any to handle different provider types
): Promise<NFTListing | null> {
  try {
    // Validate the address to prevent ENS lookup attempts
    if (!ethers.isAddress(nftContractAddress)) {
      console.error(`[MarketplaceService] Invalid contract address format: ${nftContractAddress}`);
      return null;
    }
    
    // Normalize the address (converts checksummed addresses to lowercase)
    const normalizedAddress = nftContractAddress.toLowerCase();
    
    // Determine if we're dealing with a wagmi PublicClient or an ethers.js provider
    const isWagmiClient = provider && provider.getChainId && typeof provider.getChainId === 'function';
    
    // Create a compatible provider for ethers.js
    let ethersProvider: ethers.Provider;
    if (isWagmiClient) {
      // Use getBasedAIProvider to get a compatible ethers provider
      console.log('[MarketplaceService] Using getBasedAIProvider for compatibility');
      ethersProvider = getBasedAIProvider();
    } else {
      // Assume it's already an ethers provider
      ethersProvider = provider;
    }
    
    // Create the marketplace contract with the compatible provider
    const marketplaceContract = getMarketplaceContract(ethersProvider);
    
    try {
      // Call the contract method with validated parameters
      const listing = await marketplaceContract.getListing(normalizedAddress, tokenId);
      
      // Zero address seller means no listing exists
      if (listing && listing.seller !== ethers.ZeroAddress) {
        // Check if listing has expired BEFORE returning it
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = listing.expiresAt > 0 && Number(listing.expiresAt) < currentTime;
        
        if (isExpired) {
          console.log(`[MarketplaceService] 🕐 Listing for ${nftContractAddress}#${tokenId} has expired at ${new Date(Number(listing.expiresAt) * 1000).toLocaleString()}`);
          // Return null for expired listings so the UI knows it's not available
          return null;
        }
        
        return {
          seller: listing.seller,
          price: listing.price,
          paymentToken: listing.paymentToken,
          listedAt: listing.listedAt,
          expiresAt: listing.expiresAt,
          privateBuyer: listing.privateBuyer,
          historicalListingIndex: listing.historicalListingIndex || BigInt(0)
        };
      }
      
      // Listing exists but seller is zero address
      return null;
      
    } catch (contractError: any) {
      // Handle different types of contract errors silently for better UX
      if (contractError.code === 'CALL_EXCEPTION' || 
          contractError.message?.includes('missing revert data') ||
          contractError.message?.includes('AfterMintMarketplace__ListingNotFound') ||
          contractError.message?.includes('revert')) {
        // These are expected errors when NFT is not listed - don't log them
        return null;
      }
      
      // Log unexpected errors only
      console.warn(`[MarketplaceService] Unexpected error getting listing for ${nftContractAddress}#${tokenId}:`, contractError.message || contractError);
      return null;
    }
  } catch (error) {
    console.error('[MarketplaceService] Error in getListingInfo:', error);
    return null;
  }
}

/**
 * Lists an NFT for sale on the marketplace
 */
export async function listNFTForSale(
  nftContractAddress: string,
  tokenId: string | number,
  priceInBased: string | bigint,
  walletClient: any, // Accept any wallet client type
  expirationDate?: Date,
  privateBuyerAddress?: string
): Promise<ethers.TransactionResponse> {
  try {
    console.log(`[MarketplaceService] Starting listNFTForSale for ${nftContractAddress}/${tokenId}`);
    
    // Normalize and validate addresses
    const normalizedNftContract = ethers.getAddress(nftContractAddress);
    const normalizedPrivateBuyer = privateBuyerAddress ? ethers.getAddress(privateBuyerAddress) : ethers.ZeroAddress;
    
    console.log(`[MarketplaceService] Normalized NFT contract: ${normalizedNftContract}`);
    
    // Set up provider first 
    let provider: ethers.Provider = getBasedAIProvider();
    
    // Get the user address using our more robust approach
    let userAddress: string;
    
    if (!walletClient) {
      throw new Error("No wallet client provided - please connect your wallet");
    }
    
    // First try to find address through our robust helper function
    let foundAddress = findAddressInWalletObject(walletClient);
    if (foundAddress) {
      userAddress = ethers.getAddress(foundAddress); // Ensure proper checksum
      console.log(`[MarketplaceService] Found address in wallet object: ${userAddress}`);
    }
    // Fallbacks for specific wallet types
    else if (walletClient.account && walletClient.account.address) {
      userAddress = ethers.getAddress(walletClient.account.address); // Ensure proper checksum
      console.log(`[MarketplaceService] Using wagmi-style wallet with address: ${userAddress}`);
    } 
    else if (typeof walletClient.getAddress === 'function') {
      try {
        const rawAddress = await walletClient.getAddress();
        userAddress = ethers.getAddress(rawAddress); // Ensure proper checksum
        console.log(`[MarketplaceService] Using ethers signer with address: ${userAddress}`);
      } catch (error) {
        console.error('[MarketplaceService] Error calling getAddress():', error);
        throw new Error("Could not get address from wallet. Please try a different wallet or reconnect.");
      }
    }
    else if (walletClient.address) {
      userAddress = ethers.getAddress(walletClient.address); // Ensure proper checksum
      console.log(`[MarketplaceService] Using wallet with direct address property: ${userAddress}`);
    }
    else {
      console.error("[MarketplaceService] Could not extract address from wallet:", 
        typeof walletClient === 'object' ? 'complex wallet object' : typeof walletClient);
      throw new Error("Could not determine your wallet address. Please try a different wallet.");
    }
    
    console.log(`[MarketplaceService] User address for listing: ${userAddress}`);
    
    // Handle price parsing
    const priceInWei = typeof priceInBased === 'string' 
      ? ethers.parseEther(priceInBased)
      : priceInBased;
      
    // Handle expiration date
    let expirationTimestamp = BigInt(0);
    if (expirationDate) {
      const expTs = Math.floor(expirationDate.getTime() / 1000);
      if (expTs > 0) {
        expirationTimestamp = BigInt(expTs);
      }
    } else {
        const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60;
        expirationTimestamp = BigInt(Math.floor(Date.now() / 1000) + tenYearsInSeconds);
    }
    
    // Now create an ethers signer from window.ethereum
    let signer: ethers.Signer;
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No window.ethereum found - browser wallet not detected");
      }
      
      // Create a BrowserProvider and get a signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      provider = ethersProvider; // Update our provider to the browser provider
      signer = await ethersProvider.getSigner();
      
      // Verify the signer has the right address
      const signerAddress = await signer.getAddress();
      console.log(`[MarketplaceService] Created signer with address: ${signerAddress}`);
      
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        console.warn(`[MarketplaceService] Signer address (${signerAddress}) doesn't match wallet address (${userAddress})`);
      }
    } catch (error) {
      console.error('[MarketplaceService] Error creating ethers signer:', error);
      throw new Error("Failed to create a signer from wallet connection. Please make sure your wallet is properly connected.");
    }
    
    // Verify we have a working signer with a provider
    if (!signer.provider) {
      console.log('[MarketplaceService] Signer missing provider, attaching provider');
      Object.defineProperty(signer, 'provider', { get: () => provider });
    }
    
    // Log debug information with normalized addresses
    console.log(`[MarketplaceService] Ready to list NFT:`, {
      nftContractAddress: normalizedNftContract,
      tokenId,
      priceInWei: priceInWei.toString(),
      userAddress,
      expirationTimestamp: expirationTimestamp.toString(),
      privateBuyer: normalizedPrivateBuyer,
      hasProvider: !!signer.provider
    });
    
    // Approve the marketplace contract to transfer this NFT
    console.log(`[MarketplaceService] Approving marketplace to transfer NFT...`);
    const approveTx = await approveNFTTransfer(
      normalizedNftContract, 
      typeof tokenId === 'string' ? parseInt(tokenId) : tokenId, 
      MARKETPLACE_CONTRACT_ADDRESS, 
      { address: userAddress } // Only pass the address for approval to avoid circular references
    );
    
    console.log('[MarketplaceService] Approval transaction sent, waiting for confirmation...', approveTx.hash);
    await approveTx.wait();
    console.log('[MarketplaceService] NFT approval successful.');
    
    // Get the marketplace contract with signer
    if (!signer.provider) {
      throw new Error('Signer does not have a provider');
    }
    
    const marketplaceContract = getMarketplaceContract(signer.provider, signer);

    console.log(`[MarketplaceService] Calling listNFT on marketplace contract...`);
    const listTx = await marketplaceContract.listNFT(
        normalizedNftContract, // Use normalized address
        tokenId,
      priceInWei,
      NATIVE_TOKEN_ADDRESS,
        expirationTimestamp,
        normalizedPrivateBuyer, // Use normalized address
      { gasLimit: 500000 } // Add explicit gas limit to avoid estimation issues
      );
      
    console.log('[MarketplaceService] listNFT transaction sent, hash:', listTx.hash);
    return listTx;

    } catch (error: any) {
    console.error(`[MarketplaceService] Error listing NFT for sale:`, error);
    if (error.data && error.data.length > 10) {
      // Try to decode contract error
      try {
        const iface = new ethers.Interface(marketplaceABI);
        const decodedError = iface.parseError(error.data);
        console.error("Decoded contract error:", decodedError);
        throw new Error(`Contract error: ${decodedError?.name} - ${decodedError?.args?.join(', ')}`);
      } catch (decodeError) {
        console.error("Could not decode contract error:", decodeError);
      }
    }
    
    if (error.message) {
      throw new Error(`Failed to list NFT: ${error.message}`);
    }
    throw new Error('Failed to list NFT for an unknown reason.');
  }
}

/**
 * Helper function to recursively find an address property in a wallet object
 */
function findAddressInWalletObject(obj: any, depth: number = 0, visited: Set<any> = new Set()): string | null {
  // Prevent infinite recursion
  if (depth > 5) return null;
  
  // Handle null or undefined values
  if (!obj) return null;
  
  // Detect circular references
  if (visited.has(obj)) return null;
  visited.add(obj);
  
  // Check if obj is an Ethereum address string directly
  if (typeof obj === 'string' && ethers.isAddress(obj)) {
    return obj;
  }
  
  // Check for common address property names
  const addressProps = ['address', 'addr', 'walletAddress', 'accountAddress', 'account'];
  for (const prop of addressProps) {
    if (obj[prop] && typeof obj[prop] === 'string' && ethers.isAddress(obj[prop])) {
      return obj[prop];
    }
  }
  
  // Check if obj.account is an object with an address
  if (obj.account && typeof obj.account === 'object' && !visited.has(obj.account)) {
    visited.add(obj.account);
    if (obj.account.address && typeof obj.account.address === 'string' && ethers.isAddress(obj.account.address)) {
      return obj.account.address;
    }
  }
  
  // Recursively check properties that are objects
  for (const key in obj) {
    // Skip properties we've already checked
    if (key === 'account') continue;
    
    if (obj[key] && typeof obj[key] === 'object' && !visited.has(obj[key])) {
      const result = findAddressInWalletObject(obj[key], depth + 1, visited);
      if (result) return result;
  }
  }
  
  return null;
}

/**
 * Cancels an NFT listing on the marketplace
 */
export async function cancelNFTListing(
  nftContractAddress: string,
  tokenId: number,
  walletClient: any // Changed from ethers.Signer to accept walletClient from wagmi
): Promise<ethers.TransactionResponse> {
  try {
    console.log('[MarketplaceService] Starting cancelNFTListing for wallet type:', 
      walletClient ? (typeof walletClient) : 'undefined');
    
    // Set up provider first 
    let provider: ethers.Provider = getBasedAIProvider();
    
    // Get the user address using our more robust approach
    let userAddress: string;
    
    if (!walletClient) {
      throw new Error("No wallet client provided - please connect your wallet");
    }
    
    // First try to find address through our robust helper function
    let foundAddress = findAddressInWalletObject(walletClient);
    if (foundAddress) {
      userAddress = foundAddress;
      console.log(`[MarketplaceService] Found address in wallet object: ${userAddress}`);
    }
    // Fallbacks for specific wallet types
    else if (walletClient.account && walletClient.account.address) {
      userAddress = walletClient.account.address;
      console.log(`[MarketplaceService] Using wagmi-style wallet with address: ${userAddress}`);
    } 
    else if (typeof walletClient.getAddress === 'function') {
      try {
        userAddress = await walletClient.getAddress();
        console.log(`[MarketplaceService] Using ethers signer with address: ${userAddress}`);
      } catch (error) {
        console.error('[MarketplaceService] Error calling getAddress():', error);
        throw new Error("Could not get address from wallet. Please try a different wallet or reconnect.");
      }
    }
    else if (walletClient.address) {
      userAddress = walletClient.address;
      console.log(`[MarketplaceService] Using wallet with direct address property: ${userAddress}`);
    }
    else {
      console.error("[MarketplaceService] Could not extract address from wallet:", 
        typeof walletClient === 'object' ? 'complex wallet object' : typeof walletClient);
      throw new Error("Could not determine your wallet address. Please try a different wallet.");
    }
    
    console.log(`[MarketplaceService] User address for cancel: ${userAddress}`);
    
    // First check if there's an active listing we can cancel
    const marketplaceContractReadOnly = getMarketplaceContract(provider);
    
    try {
      const listing = await marketplaceContractReadOnly.getListing(nftContractAddress, tokenId);
      if (!listing || listing.seller === ethers.ZeroAddress) {
        throw new Error("No active listing found for this NFT");
      }
      
      // Verify the caller is the seller
      if (listing.seller.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error("Only the seller can cancel this listing");
      }
      
      console.log('[MarketplaceService] Listing exists and caller is the seller');
    } catch (error: any) {
      console.error(`[MarketplaceService] Error checking listing:`, error);
      throw new Error(`Failed to verify listing: ${error.message}`);
    }
    
    // Now create an ethers signer from window.ethereum
    let signer: ethers.Signer;
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No window.ethereum found - browser wallet not detected");
      }
      
      // Create a BrowserProvider and get a signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      provider = ethersProvider; // Update our provider to the browser provider
      signer = await ethersProvider.getSigner();
      
      // Verify the signer has the right address
      const signerAddress = await signer.getAddress();
      console.log(`[MarketplaceService] Created signer with address: ${signerAddress}`);
      
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        console.warn(`[MarketplaceService] Signer address (${signerAddress}) doesn't match wallet address (${userAddress})`);
      }
    } catch (error) {
      console.error('[MarketplaceService] Error creating ethers signer:', error);
      throw new Error("Failed to create a signer from wallet connection. Please make sure your wallet is properly connected.");
    }
    
    // Verify we have a working signer with a provider
    if (!signer.provider) {
      console.log('[MarketplaceService] Signer missing provider, attaching provider');
      Object.defineProperty(signer, 'provider', { get: () => provider });
    }
    
    // Log debug information
    console.log(`[MarketplaceService] Ready to cancel listing:`, {
      nftContractAddress,
      tokenId,
      userAddress,
      hasProvider: !!signer.provider
    });
    
    // Get the contract with signer and cancel the listing
    const marketplaceContract = getMarketplaceContract(provider, signer);
    
    // Add gas limit to avoid estimation issues
    const gasLimit = 500000; // Set a reasonably high fixed gas limit
    
    // Cancel the listing
    const tx = await marketplaceContract.cancelListing(
      nftContractAddress,
      tokenId,
      { gasLimit }
    );
    
    console.log(`[MarketplaceService] Listing cancel tx:`, tx.hash);
    return tx;
  } catch (error: any) {
    console.error('[MarketplaceService] Error cancelling NFT listing:', error);
    
    // Improve error messages
    if (error.message?.includes('getAddress is not a function')) {
      throw new Error(`Wallet connection error. Please reconnect your wallet and try again.`);
    } else if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
      throw new Error(`Transaction canceled by user.`);
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error(`Insufficient funds to pay for transaction gas fees.`);
    }
    
    throw error;
  }
}

/**
 * Buys an NFT that is listed for sale
 */
export async function buyNFT(
  nftContractAddress: string,
  tokenId: number,
  listingPrice: bigint,
  walletClient: any
): Promise<ethers.TransactionReceipt> {
  try {
    console.log(`[BuyNFT] 🛒 Starting purchase: ${nftContractAddress}/${tokenId} for ${ethers.formatEther(listingPrice)} BASED`);
    
    // Simple provider creation - prioritize wallet provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    console.log(`[BuyNFT] 👤 Buyer: ${await signer.getAddress()}`);
    
    // Create marketplace contract with signer
    const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, marketplaceABI, signer);
    
    // Execute buy transaction
    console.log('[BuyNFT] 🚀 Executing buyNFTNative...');
    const tx = await marketplace.buyNFTNative(nftContractAddress, tokenId, {
      value: listingPrice,
      gasLimit: 300000
    });
    
    console.log(`[BuyNFT] 📝 Transaction submitted: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`[BuyNFT] ✅ Purchase successful in block ${receipt.blockNumber}`);
      return receipt;
    } else {
      throw new Error('Transaction failed');
    }
    
  } catch (error: any) {
    console.error(`[BuyNFT] ❌ Purchase failed:`, error);
    
    // Better error messages
    if (error.message?.includes('user rejected')) {
      throw new Error('Transaction canceled by user');
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient BASED tokens to complete purchase');
    } else if (error.reason) {
      throw new Error(`Transaction failed: ${error.reason}`);
    }
    
    throw error;
  }
}

/**
 * Makes an offer on an NFT
 */
export async function makeOfferOnNFT(
  nftContract: string,
  tokenId: number,
  offerAmount: bigint,
  expirationTimestamp: number = 0, // 0 means no expiration
  walletClient: any
): Promise<ethers.TransactionResponse> {
  try {
    console.log(`[MarketplaceService] Starting makeOfferOnNFT for wallet type:`, 
      walletClient ? (typeof walletClient) : 'undefined');
    
    // Set up provider first 
    let provider: ethers.Provider = getBasedAIProvider();
    
    // Get the user address using our more robust approach
    let offerMakerAddress: string;
    
    if (!walletClient) {
      throw new Error("No wallet client provided - please connect your wallet");
    }
    
    // First try to find address through our robust helper function
    let foundAddress = findAddressInWalletObject(walletClient);
    if (foundAddress) {
      offerMakerAddress = foundAddress;
      console.log(`[MarketplaceService] Found address in wallet object: ${offerMakerAddress}`);
    }
    // Fallbacks for specific wallet types
    else if (walletClient.account && walletClient.account.address) {
      offerMakerAddress = walletClient.account.address;
      console.log(`[MarketplaceService] Using wagmi-style wallet with address: ${offerMakerAddress}`);
    } 
    else if (typeof walletClient.getAddress === 'function') {
      try {
        offerMakerAddress = await walletClient.getAddress();
        console.log(`[MarketplaceService] Using ethers signer with address: ${offerMakerAddress}`);
      } catch (error) {
        console.error('[MarketplaceService] Error calling getAddress():', error);
        throw new Error("Could not get address from wallet. Please try a different wallet or reconnect.");
      }
    }
    else if (walletClient.address) {
      offerMakerAddress = walletClient.address;
      console.log(`[MarketplaceService] Using wallet with direct address property: ${offerMakerAddress}`);
    }
    else {
      console.error("[MarketplaceService] Could not extract address from wallet:", 
        typeof walletClient === 'object' ? 'complex wallet object' : typeof walletClient);
      throw new Error("Could not determine your wallet address. Please try a different wallet.");
    }
    
    // Now create an ethers signer from window.ethereum
    let signer: ethers.Signer;
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No window.ethereum found - browser wallet not detected");
      }
      
      // Create a BrowserProvider and get a signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      provider = ethersProvider; // Update our provider to the browser provider
      signer = await ethersProvider.getSigner();
      
      // Verify the signer has the right address
      const signerAddress = await signer.getAddress();
      console.log(`[MarketplaceService] Created signer with address: ${signerAddress}`);
      
      if (signerAddress.toLowerCase() !== offerMakerAddress.toLowerCase()) {
        console.warn(`[MarketplaceService] Signer address (${signerAddress}) doesn't match wallet address (${offerMakerAddress})`);
      }
    } catch (error) {
      console.error('[MarketplaceService] Error creating ethers signer:', error);
      throw new Error("Failed to create a signer from wallet connection. Please make sure your wallet is properly connected.");
      }
    
    // Verify we have a working signer with a provider
    if (!signer.provider) {
      console.log('[MarketplaceService] Signer missing provider, attaching provider');
      Object.defineProperty(signer, 'provider', { get: () => provider });
    }

    // Set default expiration if not provided (7 days from now)
    if (expirationTimestamp === 0) {
      expirationTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
    }
    
    console.log(`[MarketplaceService] Making offer on NFT ${nftContract} #${tokenId} for ${ethers.formatUnits(offerAmount, 18)} BASED from address ${offerMakerAddress}`);
    
    // Create contract instance
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceABI,
      signer
    );
    
    console.log(`[MarketplaceService] Making offer with parameters:`, {
      contractAddress: nftContract,
      tokenId,
      offerAmount: ethers.formatUnits(offerAmount, 18),
      expirationTimestamp
    });
    
    // Check if marketplace is paused before making offer
    try {
      const isPaused = await marketplaceContract.paused();
      if (isPaused) {
        throw new Error('Marketplace is currently paused. Please try again later.');
      }
    } catch (error) {
      console.warn('[MarketplaceService] Could not check if marketplace is paused:', error);
    }
    
    // FIXED: Call the offer function with correct parameter order matching contract signature
    // function makeOffer(address nftContract, uint256 tokenId, uint256 amount, uint64 expirationTimestamp)
    const tx = await marketplaceContract.makeOffer(
      nftContract,
      tokenId,
      offerAmount,           // ← FIXED: amount is 3rd parameter
      expirationTimestamp,   // ← FIXED: expiration is 4th parameter
      { 
        value: offerAmount,
        gasLimit: 300000
      }
    );
    
    console.log(`[MarketplaceService] Make offer transaction submitted:`, tx);
      return tx;
    } catch (error: any) {
      console.error(`[MarketplaceService] Error making offer:`, error);
      
    // Improve error messages
    if (error.message?.includes('getAddress is not a function')) {
      throw new Error(`Wallet connection error. Please reconnect your wallet and try again.`);
    } else if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
      throw new Error(`Transaction canceled by user.`);
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error(`Insufficient funds to pay for transaction gas fees or to make the offer.`);
    } else if (error.message?.includes('overflow') || error.message?.includes('INVALID_ARGUMENT')) {
      throw new Error(`Error with offer parameters. Please try a smaller offer amount or contact support.`);
    }
    
    throw error;
  }
}

/**
 * Fetches the marketplace fee percentage
 */
export async function getMarketplaceFee(
  provider: ethers.Provider,
  nftContractAddress: string = MARKETPLACE_CONTRACT_ADDRESS
): Promise<number> {
  try {
    const marketplaceContract = getMarketplaceContract(provider);
    
    // Check if there's a collection-specific fee
    const collectionFee = await marketplaceContract.collectionSpecificFees(nftContractAddress);
    
    if (collectionFee > BigInt(0)) {
      return Number(collectionFee) / 100; // Convert from basis points (e.g., 250 = 2.5%)
    }
    
    // Otherwise get the default fee
    const defaultFee = await marketplaceContract.defaultFeePercentage();
    return Number(defaultFee) / 100;
  } catch (error) {
    console.error('Error getting marketplace fee:', error);
    return 2.5; // Return default 2.5% if there's an error
  }
}

/**
 * Gets all active listings from the marketplace
 * This is normally done via event indexing, but for the demo we'll use a simple approach
 */
export async function getActiveListings(
  provider: ethers.Provider,
  limit = 20
): Promise<{ nftContract: string; tokenId: number; listing: NFTListing }[]> {
  try {
    // In a real application, you would query an indexed database of events
    // For this demo, we'll just check the Mock NFT collection for the first N tokens
    const activeListings = [];
    
    for (let tokenId = 0; tokenId < limit; tokenId++) {
      const listing = await getListingInfo(MARKETPLACE_CONTRACT_ADDRESS, tokenId, provider);
      
      if (listing) {
        activeListings.push({
          nftContract: MARKETPLACE_CONTRACT_ADDRESS,
          tokenId,
          listing
        });
      }
    }
    
    return activeListings;
  } catch (error) {
    console.error('Error fetching active listings:', error);
    return [];
  }
}

/**
 * Approves a specific NFT for transfer to another address (usually the marketplace contract)
 */
export async function approveNFTTransfer(
  nftContractAddress: string,
  tokenId: number,
  spenderAddress: string, // This will be the MARKETPLACE_ADDRESS
  walletClient: any // Changed from ethers.Signer to accept walletClient from wagmi
): Promise<ethers.TransactionResponse> {
  try {
    console.log(`[MarketplaceService] Starting approveNFTTransfer with wallet type:`, 
      walletClient ? (typeof walletClient) : 'undefined');
    
    // Set up provider first 
    let provider: ethers.Provider = getBasedAIProvider();
    
    // We need the ABI for a generic ERC721 approve function.
    const approveAbi = [
      "function approve(address to, uint256 tokenId) external",
      "function getApproved(uint256 tokenId) view returns (address)"
    ];
    
    // Get the wallet address using our more robust approach
    let ownerAddress: string;
    
    if (!walletClient) {
      throw new Error("No wallet client provided - please connect your wallet");
    }
    
    // First try to find address through our robust helper function
    let foundAddress = findAddressInWalletObject(walletClient);
    if (foundAddress) {
      ownerAddress = foundAddress;
      console.log(`[MarketplaceService] Found address in wallet object: ${ownerAddress}`);
    }
    // Fallbacks for specific wallet types
    else if (walletClient.account && walletClient.account.address) {
      ownerAddress = walletClient.account.address;
      console.log(`[MarketplaceService] Using wagmi-style wallet with address: ${ownerAddress}`);
    } 
    else if (typeof walletClient.getAddress === 'function') {
      try {
        ownerAddress = await walletClient.getAddress();
        console.log(`[MarketplaceService] Using ethers signer with address: ${ownerAddress}`);
      } catch (error) {
        console.error('[MarketplaceService] Error calling getAddress():', error);
        throw new Error("Could not get address from wallet. Please try a different wallet or reconnect.");
      }
    }
    else if (walletClient.address) {
      ownerAddress = walletClient.address;
      console.log(`[MarketplaceService] Using wallet with direct address property: ${ownerAddress}`);
    }
    else {
      console.error("[MarketplaceService] Could not extract address from wallet:", 
        typeof walletClient === 'object' ? 'complex wallet object' : typeof walletClient);
      throw new Error("Could not determine your wallet address. Please try a different wallet.");
    }
    
    // Now create an ethers signer from window.ethereum
    let signer: ethers.Signer;
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No window.ethereum found - browser wallet not detected");
      }
      
      // Create a BrowserProvider and get a signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      signer = await ethersProvider.getSigner();
      
      // Verify the signer has the right address
      const signerAddress = await signer.getAddress();
      console.log(`[MarketplaceService] Created signer with address: ${signerAddress}`);
      
      if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        console.warn(`[MarketplaceService] Signer address (${signerAddress}) doesn't match wallet address (${ownerAddress})`);
      }
    } catch (error) {
      console.error('[MarketplaceService] Error creating ethers signer:', error);
      throw new Error("Failed to create a signer from wallet connection. Please make sure your wallet is properly connected.");
    }
    
    console.log(`[MarketplaceService] Approving NFT ${nftContractAddress} #${tokenId} for transfer to ${spenderAddress} from address ${ownerAddress}`);
    
    // Create contract instance for the NFT
    const nftContract = new ethers.Contract(
      nftContractAddress,
      approveAbi,
      signer
    );

    // Check if approval already exists
    try {
      const currentApproved = await nftContract.getApproved(tokenId);
      console.log(`[MarketplaceService] Current approved address:`, currentApproved);
      
      if (currentApproved.toLowerCase() === spenderAddress.toLowerCase()) {
        console.log(`[MarketplaceService] NFT is already approved for transfer to ${spenderAddress}`);
        
        // Return a mock transaction that has a dummy hash and a wait function
        // This allows the caller to handle this case the same way as a real approval
        return {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          wait: async () => ({ status: 1, blockNumber: 0 }),
        } as unknown as ethers.TransactionResponse;
      }
    } catch (error) {
      console.log(`[MarketplaceService] Error checking approval status:`, error);
      // Continue to approve anyway
    }
    
    // Call approve on the NFT contract
    const tx = await nftContract.approve(spenderAddress, tokenId, {
      gasLimit: 150000 // Set a reasonable gas limit
      });
      
    console.log(`[MarketplaceService] Approval transaction submitted:`, tx);
      return tx;
  } catch (error: any) {
    console.error(`Error approving NFT transfer:`, error);
    
    // Improve error messages
    if (error.message?.includes('getAddress is not a function')) {
      throw new Error(`Wallet connection error. Please reconnect your wallet and try again.`);
    } else if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
      throw new Error(`Transaction canceled by user.`);
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error(`Insufficient funds to pay for transaction gas fees.`);
    }
    
    throw error;
  }
}

/**
 * Checks if the marketplace contract is properly configured with the AfterMintStorage address
 */
export async function checkMarketplaceSetup(provider: ethers.Provider): Promise<boolean> {
  try {
    console.log(`[MarketplaceService] Checking marketplace contract setup at ${MARKETPLACE_CONTRACT_ADDRESS}`);
    
    // Define a minimal ABI just for checking the storage address
    const minimalAbi = [
      "function afterMintStorage() view returns (address)"
    ];
    
    const contract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, minimalAbi, provider);
    
    try {
      const storageAddress = await contract.afterMintStorage();
      console.log(`[MarketplaceService] Marketplace storage address: ${storageAddress}`);
      
      if (storageAddress === ethers.ZeroAddress) {
        console.error('[MarketplaceService] Marketplace has storage address set to zero address!');
        return false;
      }
      
      // Check if the storage contract exists at that address
      const code = await provider.getCode(storageAddress);
      if (code === '0x' || code === '') {
        console.error(`[MarketplaceService] Storage contract doesn't exist at address ${storageAddress}`);
        return false;
      }
      
      console.log(`[MarketplaceService] Marketplace is properly configured with storage at ${storageAddress}`);
      return true;
    } catch (error) {
      console.error('[MarketplaceService] Error checking marketplace storage:', error);
      return false;
    }
  } catch (error) {
    console.error('[MarketplaceService] Error checking marketplace setup:', error);
    return false;
  }
}

/**
 * Run a diagnostic check on all marketplace contracts and their configurations
 */
export async function checkMarketplaceContracts(provider: ethers.Provider): Promise<{
  marketplace: {
    address: string;
    exists: boolean;
    storageAddress: string | undefined;
    implementation: string | undefined;
  },
  storage: {
    address: string;
    exists: boolean;
    marketplaceAddress: string | undefined;
  }
}> {
  const result = {
    marketplace: {
      address: MARKETPLACE_CONTRACT_ADDRESS,
      exists: false,
      storageAddress: undefined as string | undefined,
      implementation: undefined as string | undefined,
    },
    storage: {
      address: MARKETPLACE_CONTRACT_ADDRESS,
      exists: false,
      marketplaceAddress: undefined as string | undefined,
    }
  };
  
  try {
    console.log("[MarketplaceService] Running contract diagnostics");
    
    // Check marketplace contract existence
    const marketplaceCode = await provider.getCode(MARKETPLACE_CONTRACT_ADDRESS);
    result.marketplace.exists = marketplaceCode !== '0x' && marketplaceCode !== '';
    
    if (result.marketplace.exists) {
      // Check marketplace implementation address (EIP-1967 standard)
      try {
        // Implementation slot for transparent proxy (UUPS) = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
        const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implData = await provider.getStorage(MARKETPLACE_CONTRACT_ADDRESS, implSlot);
        
        if (implData && implData !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          // Extract address from storage slot
          const implementationAddr = "0x" + implData.slice(-40);
          result.marketplace.implementation = implementationAddr;
        }
      } catch (e) {
        console.warn("[MarketplaceService] Could not read implementation slot:", e);
      }
      
      // Check marketplace afterMintStorage address
      try {
        const minAbi = ["function afterMintStorage() view returns (address)"];
        const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, minAbi, provider);
        result.marketplace.storageAddress = await marketContract.afterMintStorage() as string;
      } catch (e) {
        console.warn("[MarketplaceService] Could not read afterMintStorage:", e);
      }
    }
    
    // Check storage contract existence
    const storageCode = await provider.getCode(MARKETPLACE_CONTRACT_ADDRESS);
    result.storage.exists = storageCode !== '0x' && storageCode !== '';
    
    if (result.storage.exists) {
      // Check storage marketplaceContract address
      try {
        const minAbi = ["function marketplaceContract() view returns (address)"];
        const storageContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, minAbi, provider);
        result.storage.marketplaceAddress = await storageContract.marketplaceContract() as string;
      } catch (e) {
        console.warn("[MarketplaceService] Could not read marketplaceContract:", e);
      }
    }
    
    // Output diagnostics
    console.table({
      "Marketplace Proxy": {
        Address: result.marketplace.address,
        Exists: result.marketplace.exists,
        "Storage Address": result.marketplace.storageAddress,
        "Implementation": result.marketplace.implementation,
      },
      "Storage Contract": {
        Address: result.storage.address,
        Exists: result.storage.exists,
        "Marketplace Address": result.storage.marketplaceAddress,
      }
    });
    
    return result;
  } catch (error) {
    console.error('[MarketplaceService] Error running diagnostics:', error);
    return result;
  }
}

/**
 * Direct low-level check of the marketplace's storage configuration 
 */
export async function checkMarketplaceStorageConfig(provider: ethers.Provider): Promise<{
  marketplaceAddress: string;
  storageAddress: string;
  storageIsSet: boolean;
  storageContractExists: boolean;
  storagePointsToMarketplace: boolean;
  marketplaceOwner: string | null;
}> {
  const result = {
    marketplaceAddress: MARKETPLACE_CONTRACT_ADDRESS,
    storageAddress: MARKETPLACE_CONTRACT_ADDRESS,
    storageIsSet: false,
    storageContractExists: false,
    storagePointsToMarketplace: false,
    marketplaceOwner: null as string | null
  };

  try {
    // 1. Check if marketplace has storage set
    const marketplaceAbi = [
      "function afterMintStorage() view returns (address)",
      "function owner() view returns (address)"
    ];
    const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, marketplaceAbi, provider);
    
    try {
      const configuredStorageAddress = await marketplaceContract.afterMintStorage();
      console.log(`[MarketplaceService] Marketplace storage address: ${configuredStorageAddress}`);
      
      result.storageIsSet = configuredStorageAddress !== ethers.ZeroAddress;
      
      // Check if configured storage matches expected storage
      const isCorrectStorage = configuredStorageAddress.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase();
      console.log(`[MarketplaceService] Is storage correctly configured? ${isCorrectStorage ? 'Yes' : 'No'}`);
      
      if (!isCorrectStorage && result.storageIsSet) {
        console.warn(`[MarketplaceService] Marketplace is using a different storage address: ${configuredStorageAddress}`);
      }
      
      // Try to get the marketplace owner
      try {
        const owner = await marketplaceContract.owner();
        result.marketplaceOwner = owner;
        console.log(`[MarketplaceService] Marketplace owner: ${owner}`);
      } catch (e) {
        console.warn("[MarketplaceService] Could not get marketplace owner:", e);
      }
    } catch (e) {
      console.warn("[MarketplaceService] Error checking marketplace storage:", e);
    }
    
    // 2. Check if storage contract exists
    const storageCode = await provider.getCode(MARKETPLACE_CONTRACT_ADDRESS);
    result.storageContractExists = storageCode !== '0x' && storageCode !== '';
    
    if (result.storageContractExists) {
      // 3. Check if storage points to marketplace
      const storageAbi = ["function marketplaceContract() view returns (address)"];
      const storageContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, storageAbi, provider);
      
      try {
        const configuredMarketplace = await storageContract.marketplaceContract();
        result.storagePointsToMarketplace = configuredMarketplace.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase();
        
        if (!result.storagePointsToMarketplace) {
          console.warn(`[MarketplaceService] Storage points to different marketplace: ${configuredMarketplace}`);
        }
      } catch (e) {
        console.warn("[MarketplaceService] Error checking storage marketplace:", e);
      }
    }
    
    return result;
  } catch (error) {
    console.error('[MarketplaceService] Error checking marketplace storage config:', error);
    return result;
  }
}

/**
 * Function to fix the marketplace configuration by setting the storage address
 * This requires the signer to be the owner of the marketplace
 */
export async function configureMarketplaceStorage(
  signer: ethers.Signer
): Promise<ethers.TransactionResponse | null> {
  try {
    const config = await checkMarketplaceStorageConfig(getBasedAIProvider());
    
    if (config.storageIsSet && config.storagePointsToMarketplace) {
      console.log("[MarketplaceService] Marketplace already correctly configured!");
      return null;
    }
    
    if (!config.marketplaceOwner) {
      throw new Error("Could not determine marketplace owner, cannot configure");
    }
    
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== config.marketplaceOwner.toLowerCase()) {
      throw new Error(`Only the marketplace owner (${config.marketplaceOwner}) can configure the storage`);
    }
    
    // Setup the marketplace contract
    const abi = ["function setAfterMintStorage(address) external"];
    const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, abi, signer);
    
    console.log(`[MarketplaceService] Setting marketplace storage to ${MARKETPLACE_CONTRACT_ADDRESS}`);
    
    const tx = await marketplaceContract.setAfterMintStorage(MARKETPLACE_CONTRACT_ADDRESS);
    console.log(`[MarketplaceService] Transaction sent: ${tx.hash}`);
    
    return tx;
  } catch (error) {
    console.error("[MarketplaceService] Error configuring marketplace storage:", error);
    throw error;
  }
}

/**
 * Function to fix the storage configuration by setting the marketplace address
 * This requires the signer to be the owner of the storage contract
 */
export async function configureStorageMarketplace(
  signer: ethers.Signer
): Promise<ethers.TransactionResponse | null> {
  try {
    const config = await checkMarketplaceStorageConfig(getBasedAIProvider());
    
    if (config.storagePointsToMarketplace) {
      console.log("[MarketplaceService] Storage already correctly configured!");
      return null;
    }
    
    // Get storage owner
    const storageAbi = [
      "function owner() view returns (address)",
      "function setMarketplaceContract(address) external"
    ];
    const storageContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, storageAbi, await getBasedAIProvider());
    
    let storageOwner;
    try {
      storageOwner = await storageContract.owner();
      console.log(`[MarketplaceService] Storage contract owner: ${storageOwner}`);
    } catch (e) {
      console.error("[MarketplaceService] Could not determine storage owner:", e);
      throw new Error("Could not determine storage owner, cannot configure");
    }
    
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== storageOwner.toLowerCase()) {
      throw new Error(`Only the storage owner (${storageOwner}) can configure the marketplace address`);
    }
    
    // Setup the storage contract with signer
    const connectedStorageContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, storageAbi, signer);
    
    console.log(`[MarketplaceService] Setting storage's marketplace address to ${MARKETPLACE_CONTRACT_ADDRESS}`);
    
    try {
      const estimatedGas = await storageContract.setMarketplaceContract.estimateGas(MARKETPLACE_CONTRACT_ADDRESS);
      console.log("[MarketplaceService] Estimated gas for setMarketplaceContract:", estimatedGas.toString());
      
      // Use a fixed gas limit that's higher than the estimation
      const gasLimit = 2000000; // Set a high enough fixed limit
      console.log("[MarketplaceService] Using gas limit:", gasLimit);
      
      const tx = await connectedStorageContract.setMarketplaceContract(MARKETPLACE_CONTRACT_ADDRESS, {
        gasLimit: gasLimit,
        gasPrice: ethers.parseUnits("11", "gwei") // Set explicit gas price
      });
      
      console.log(`[MarketplaceService] Transaction sent: ${tx.hash}`);
      
      return tx;
    } catch (error: any) {
      console.error('[MarketplaceService] Error setting storage marketplace:', error);
      throw error;
    }
  } catch (error) {
    console.error("[MarketplaceService] Error configuring storage marketplace:", error);
    throw error;
  }
}

/**
 * Check both marketplace and storage contract setup and return detailed information
 */
export async function getContractLinkageStatus(provider: ethers.Provider): Promise<{
  status: 'ok' | 'marketplace_missing' | 'storage_missing' | 'bidirectional_missing' | 'marketplace_to_storage_missing' | 'storage_to_marketplace_missing';
  marketplaceExists: boolean;
  storageExists: boolean;
  marketplaceAddress: string;
  storageAddress: string;
  marketplacePointsToStorage: boolean;
  marketplaceStorageTarget: string | null;
  storagePointsToMarketplace: boolean;
  storageMarketplaceTarget: string | null;
  marketplaceOwner: string | null;
  storageOwner: string | null;
}> {
  const result = {
    status: 'ok' as 'ok' | 'marketplace_missing' | 'storage_missing' | 'bidirectional_missing' | 'marketplace_to_storage_missing' | 'storage_to_marketplace_missing',
    marketplaceExists: false,
    storageExists: false,
    marketplaceAddress: MARKETPLACE_CONTRACT_ADDRESS,
    storageAddress: MARKETPLACE_CONTRACT_ADDRESS,
    marketplacePointsToStorage: false,
    marketplaceStorageTarget: null as string | null,
    storagePointsToMarketplace: false,
    storageMarketplaceTarget: null as string | null,
    marketplaceOwner: null as string | null,
    storageOwner: null as string | null
  };

  try {
    console.log("[MarketplaceService] Checking contract linkage status");
    
    // Check marketplace contract existence
    const marketplaceCode = await provider.getCode(MARKETPLACE_CONTRACT_ADDRESS);
    result.marketplaceExists = marketplaceCode !== '0x' && marketplaceCode !== '';
    
    const storageCode = await provider.getCode(MARKETPLACE_CONTRACT_ADDRESS);
    result.storageExists = storageCode !== '0x' && storageCode !== '';

    // Check marketplace -> storage linkage
    if (result.marketplaceExists) {
      try {
        const marketplaceAbi = [
          "function afterMintStorage() view returns (address)",
          "function owner() view returns (address)"
        ];
        const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, marketplaceAbi, provider);
        
        const storageAddr = await marketplaceContract.afterMintStorage();
        result.marketplaceStorageTarget = storageAddr;
        result.marketplacePointsToStorage = 
          storageAddr.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase();
        
        // Get marketplace owner
        const owner = await marketplaceContract.owner();
        result.marketplaceOwner = owner;
      } catch (e: any) {
        console.warn("[MarketplaceService] Could not check marketplace -> storage linkage:", e);
      }
    }

    // Check storage -> marketplace linkage  
    if (result.storageExists) {
      try {
        const storageAbi = [
          "function marketplaceContract() view returns (address)",
          "function owner() view returns (address)"
        ];
        const storageContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, storageAbi, provider);
        
        const marketplaceAddr = await storageContract.marketplaceContract();
        result.storageMarketplaceTarget = marketplaceAddr;
        result.storagePointsToMarketplace = 
          marketplaceAddr.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS.toLowerCase();
        
        // Get storage owner
        const owner = await storageContract.owner();
        result.storageOwner = owner;
      } catch (e: any) {
        console.warn("[MarketplaceService] Could not check storage -> marketplace linkage:", e);
      }
    }

    // Determine overall status
    if (!result.marketplaceExists) {
      result.status = 'marketplace_missing';
    } else if (!result.storageExists) {
      result.status = 'storage_missing';
    } else if (!result.marketplacePointsToStorage && !result.storagePointsToMarketplace) {
      result.status = 'bidirectional_missing';
    } else if (!result.marketplacePointsToStorage) {
      result.status = 'marketplace_to_storage_missing';
    } else if (!result.storagePointsToMarketplace) {
      result.status = 'storage_to_marketplace_missing';
    } else {
      result.status = 'ok';
    }

    return result;
  } catch (error: any) {
    console.error('[MarketplaceService] Error checking contract linkage:', error);
    return result;
  }
}

/**
 * Fix all marketplace configuration issues in one step if possible
 */
export async function fixAllMarketplaceConfiguration(signer: ethers.Signer): Promise<{ success: boolean; errorMessage?: string; }> {
  const result = { success: false, errorMessage: "" };

  try {
    const status = await getContractLinkageStatus(signer.provider as ethers.Provider);
    console.log("[MarketplaceService] Current contract linkage status:", status);

    // Fix marketplace -> storage linkage if needed
    if (!status.marketplacePointsToStorage && status.marketplaceOwner) {
      const isCurrentUserMarketplaceOwner = 
        status.marketplaceOwner.toLowerCase() === (await signer.getAddress()).toLowerCase();
      
      if (isCurrentUserMarketplaceOwner) {
        console.log("[MarketplaceService] User is marketplace owner, setting marketplace storage...");
        
        try {
          const marketplaceAbi = ["function setAfterMintStorage(address _newAfterMintStorageAddress) external"];
          const marketplaceContract = new ethers.Contract(status.marketplaceAddress, marketplaceAbi, signer);
          
          const tx = await marketplaceContract.setAfterMintStorage(status.storageAddress, {
            gasLimit: 500000, // Set higher gas limit
            gasPrice: ethers.parseUnits("11", "gwei") // Set explicit gas price 
          });
          
          console.log("[MarketplaceService] Successfully set marketplace storage. Tx:", tx.hash);
          await tx.wait();
        } catch (e: any) {
          console.error("[MarketplaceService] Error setting marketplace storage:", e);
          result.errorMessage = `Failed to set marketplace storage: ${e.message || e}`;
          return result;
        }
      }
    }
    
    // Fix storage -> marketplace linkage if needed
    if (!status.storagePointsToMarketplace && status.storageOwner) {
      const isCurrentUserStorageOwner = 
        status.storageOwner.toLowerCase() === (await signer.getAddress()).toLowerCase();
      
      if (isCurrentUserStorageOwner) {
        console.log("[MarketplaceService] User is storage owner, setting storage marketplace...");
        
        try {
          const storageAbi = ["function setMarketplaceContract(address _marketplaceContract) external"];
          const storageContract = new ethers.Contract(status.storageAddress, storageAbi, signer);
          
          // Break down the operation into smaller steps - first estimate gas
          try {
            const estimatedGas = await storageContract.setMarketplaceContract.estimateGas(status.marketplaceAddress);
            console.log("[MarketplaceService] Estimated gas for setMarketplaceContract:", estimatedGas.toString());
            
            // Use a fixed gas limit that's higher than the estimation
            const gasLimit = 2000000; // Set a high enough fixed limit
            console.log("[MarketplaceService] Using gas limit:", gasLimit);
            
            const tx = await storageContract.setMarketplaceContract(status.marketplaceAddress, {
              gasLimit: gasLimit,
              gasPrice: ethers.parseUnits("11", "gwei") // Set explicit gas price
            });
            
            console.log("[MarketplaceService] Successfully set storage marketplace. Tx:", tx.hash);
            await tx.wait();
          } catch (estimateError: any) {
            console.warn("[MarketplaceService] Gas estimation failed, using fixed gas limit:", estimateError);
            // Fallback to fixed gas limit if estimation fails
            const tx = await storageContract.setMarketplaceContract(status.marketplaceAddress, {
              gasLimit: 1500000, // Higher fixed gas limit
              gasPrice: ethers.parseUnits("11", "gwei") // Set explicit gas price
            });
            
            console.log("[MarketplaceService] Successfully set storage marketplace with fixed gas. Tx:", tx.hash);
            await tx.wait();
          }
          
        } catch (e: any) {
          console.error("[MarketplaceService] Error setting storage marketplace:", e);
          result.errorMessage = `Failed to set storage marketplace: ${e.message || e}`;
          return result;
        }
      }
    }
    
    // Check status after fixing
    const newStatus = await getContractLinkageStatus(signer.provider as ethers.Provider);
    console.log("[MarketplaceService] Updated contract linkage status:", newStatus);
    
    if (newStatus.status === 'ok') {
      result.success = true;
    } else {
      result.success = false;
      result.errorMessage = `Config not completely fixed. New status: ${newStatus.status}`;
    }
    
    return result;
  } catch (error: any) {
    console.error('[MarketplaceService] Error fixing marketplace configuration:', error);
    result.errorMessage = error.message || String(error);
    return result;
  }
}

/**
 * Gets all active listings for a specific collection
 */
export async function getCollectionActiveListings(
  collectionAddress: string,
  provider: ethers.Provider,
  limit = 100
): Promise<number[]> {
  try {
    // This is a simplified implementation since we don't actually have an indexed storage
    // In a real implementation, we would query the marketplace contract or indexer
    
    // For now, let's scan some token IDs in the collection to check if they're listed
    const listedTokenIds: number[] = [];
    
    // We'll check tokens 0 through limit-1 as a basic implementation
    const checkPromises = Array.from({ length: limit }, (_, i) => {
      return getListingInfo(collectionAddress, i, provider)
        .then(listing => {
          if (listing !== null) {
            listedTokenIds.push(i);
            return true;
          }
          return false;
        })
        .catch(() => false);
    });
    
    // Wait for all checks to complete
    await Promise.all(checkPromises);
    
    console.log(`[MarketplaceService] Found ${listedTokenIds.length} active listings for collection ${collectionAddress}`);
    return listedTokenIds;
  } catch (error: any) {
    console.error('[MarketplaceService] Error fetching collection listings:', error);
    return [];
  }
}

/**
 * Updates the price of an existing NFT listing
 */
export async function updateListingPrice(
  nftContractAddress: string,
  tokenId: number,
  newPrice: bigint,
  walletClient: any // Changed from ethers.Signer to accept walletClient from wagmi
): Promise<ethers.TransactionResponse> {
  try {
    console.log('[MarketplaceService] Starting updateListingPrice for wallet type:', 
      walletClient ? (typeof walletClient) : 'undefined');
    
    // Set up provider first 
    let provider: ethers.Provider = getBasedAIProvider();
    
    // Get the user address using our more robust approach
    let userAddress: string;
    
    if (!walletClient) {
      throw new Error("No wallet client provided - please connect your wallet");
    }
    
    // First try to find address through our robust helper function
    let foundAddress = findAddressInWalletObject(walletClient);
    if (foundAddress) {
      userAddress = foundAddress;
      console.log(`[MarketplaceService] Found address in wallet object: ${userAddress}`);
    }
    // Fallbacks for specific wallet types
    else if (walletClient.account && walletClient.account.address) {
      userAddress = walletClient.account.address;
      console.log(`[MarketplaceService] Using wagmi-style wallet with address: ${userAddress}`);
    } 
    else if (typeof walletClient.getAddress === 'function') {
      try {
        userAddress = await walletClient.getAddress();
        console.log(`[MarketplaceService] Using ethers signer with address: ${userAddress}`);
      } catch (error) {
        console.error('[MarketplaceService] Error calling getAddress():', error);
        throw new Error("Could not get address from wallet. Please try a different wallet or reconnect.");
      }
    }
    else if (walletClient.address) {
      userAddress = walletClient.address;
      console.log(`[MarketplaceService] Using wallet with direct address property: ${userAddress}`);
    }
    else {
      console.error("[MarketplaceService] Could not extract address from wallet:", 
        typeof walletClient === 'object' ? 'complex wallet object' : typeof walletClient);
      throw new Error("Could not determine your wallet address. Please try a different wallet.");
    }
    
    console.log(`[MarketplaceService] User address for update: ${userAddress}`);
    
    // First check if there's an active listing we can update
    const marketplaceContractReadOnly = getMarketplaceContract(provider);
    
    try {
      const listing = await marketplaceContractReadOnly.getListing(nftContractAddress, tokenId);
      if (!listing || listing.seller === ethers.ZeroAddress) {
        throw new Error("No active listing found for this NFT");
      }
      
      // Verify the caller is the seller
      if (listing.seller.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error("Only the seller can update the listing price");
      }
      
      console.log('[MarketplaceService] Listing exists and caller is the seller');
    } catch (error: any) {
      console.error(`[MarketplaceService] Error checking listing:`, error);
      throw new Error(`Failed to verify listing: ${error.message}`);
    }
    
    // Now create an ethers signer from window.ethereum
    let signer: ethers.Signer;
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No window.ethereum found - browser wallet not detected");
      }
      
      // Create a BrowserProvider and get a signer
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      provider = ethersProvider; // Update our provider to the browser provider
      signer = await ethersProvider.getSigner();
      
      // Verify the signer has the right address
      const signerAddress = await signer.getAddress();
      console.log(`[MarketplaceService] Created signer with address: ${signerAddress}`);
      
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        console.warn(`[MarketplaceService] Signer address (${signerAddress}) doesn't match wallet address (${userAddress})`);
      }
    } catch (error) {
      console.error('[MarketplaceService] Error creating ethers signer:', error);
      throw new Error("Failed to create a signer from wallet connection. Please make sure your wallet is properly connected.");
    }
    
    // Verify we have a working signer with a provider
    if (!signer.provider) {
      console.log('[MarketplaceService] Signer missing provider, attaching provider');
      Object.defineProperty(signer, 'provider', { get: () => provider });
    }
    
    // Log debug information
    console.log(`[MarketplaceService] Ready to update listing price:`, {
      nftContractAddress,
      tokenId,
      newPrice: newPrice.toString(),
      userAddress,
      hasProvider: !!signer.provider
    });
    
    // Get the contract with signer and update the price
    const marketplaceContract = getMarketplaceContract(provider, signer);
    
    // Add gas limit to avoid estimation issues
    const gasLimit = 500000; // Set a reasonably high fixed gas limit
    
    // Update the listing price
    const tx = await marketplaceContract.updateListingPrice(
      nftContractAddress,
      tokenId,
      newPrice,
      { gasLimit }
    );
    
    console.log(`[MarketplaceService] Listing price update tx:`, tx.hash);
    return tx;
  } catch (error: any) {
    console.error(`[MarketplaceService] Error updating listing price:`, error);
    
    // Improve error messages
    if (error.message?.includes('getAddress is not a function')) {
      throw new Error(`Wallet connection error. Please reconnect your wallet and try again.`);
    } else if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
      throw new Error(`Transaction canceled by user.`);
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error(`Insufficient funds to pay for transaction gas fees.`);
    }
    
    throw error;
  }
}

// Function to get listings using the better API endpoints
export const getTokenListing = async (
  collectionAddress: string,
  tokenId: number,
  provider?: any
): Promise<{ isListed: boolean; price?: string; seller?: string } | null> => {
  try {
    console.log(`[MarketplaceService] Getting listing for ${collectionAddress}/${tokenId}`);
    
    // Try the collection listing endpoint first
    try {
      const collectionResponse = await fetch(`https://explorer.bf1337.org/api/contracts/tokenListing?collection=${collectionAddress}`);
      if (collectionResponse.ok) {
        const collectionData = await collectionResponse.json();
        
        // Look for this specific token in the collection listings
        const tokenListing = collectionData.listings?.find((listing: any) => 
          listing.tokenId === tokenId || listing.token_id === tokenId
        );
        
        if (tokenListing) {
          return {
            isListed: true,
            price: tokenListing.price || tokenListing.amount,
            seller: tokenListing.seller || tokenListing.owner
          };
        }
      }
    } catch (error) {
      console.log(`[MarketplaceService] Collection listing endpoint failed: ${error}`);
    }
    
    // Try the single listing endpoint
    try {
      const singleResponse = await fetch(`https://explorer.bf1337.org/api/listings/single?nftContract=${collectionAddress}&tokenId=${tokenId}`);
      if (singleResponse.ok) {
        const singleData = await singleResponse.json();
        
        if (singleData && singleData.isActive) {
          return {
            isListed: true,
            price: singleData.price || singleData.amount,
            seller: singleData.seller || singleData.owner
          };
        }
      }
    } catch (error) {
      console.log(`[MarketplaceService] Single listing endpoint failed: ${error}`);
    }
    
    // Fallback to contract method if APIs fail
    if (provider) {
      const listing = await getListingInfo(collectionAddress, tokenId, provider);
      if (listing) {
        return {
          isListed: true,
          price: ethers.formatEther(listing.price),
          seller: listing.seller
        };
      }
    }
    
    return { isListed: false };
    
  } catch (error) {
    console.error('[MarketplaceService] Error getting token listing:', error);
    return { isListed: false };
  }
};

// Function to get all listings for a collection using better APIs
export const getCollectionListingsFromAPI = async (
  collectionAddress: string
): Promise<Array<{ tokenId: number; price: string; seller: string }>> => {
  try {
    console.log(`[MarketplaceService] Getting collection listings from API for ${collectionAddress}`);
    
    const response = await fetch(`https://explorer.bf1337.org/api/contracts/tokenListing?collection=${collectionAddress}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collection listings: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.listings && Array.isArray(data.listings)) {
      return data.listings
        .filter((listing: any) => listing.isActive !== false) // Only active listings
        .map((listing: any) => ({
          tokenId: listing.tokenId || listing.token_id,
          price: listing.price || listing.amount,
          seller: listing.seller || listing.owner
        }));
    }
    
    return [];
    
  } catch (error) {
    console.error('[MarketplaceService] Error getting collection listings from API:', error);
    return [];
  }
};

/**
 * Check if a wallet address owns any LifeNodes NFTs
 */
export async function isLifeNodesHolder(walletAddress: string): Promise<boolean> {
  try {
    const provider = getBasedAIProvider();
    const lifeNodesContract = new ethers.Contract(
      '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21', // LifeNodes contract address
      [
        "function balanceOf(address owner) view returns (uint256)",
      ],
      provider
    );
    
    const balance = await lifeNodesContract.balanceOf(walletAddress);
    return balance > 0;
  } catch (error) {
    console.error('Error checking LifeNodes ownership:', error);
    return false;
  }
}

/**
 * Get marketplace fee for a specific transaction, considering LifeNodes ownership
 */
export async function getMarketplaceFeeForUser(
  nftContractAddress: string,
  userAddress: string,
  provider: ethers.Provider
): Promise<{ feePercentage: number; isLifeNodesHolder: boolean }> {
  try {
    const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, marketplaceABI, provider);
    
    // Check if user is a LifeNodes holder
    const isLifeNodes = await isLifeNodesHolder(userAddress);
    
    // First check if there's a collection-specific fee
    const collectionFee = await marketplaceContract.collectionSpecificFees(nftContractAddress);
    
    if (collectionFee > BigInt(0)) {
      const baseFee = Number(collectionFee) / 100; // Convert from basis points
      
      // Check if LifeNodes holders get a discount on collection fees
      // This would be implemented in the contract if such a feature exists
      return {
        feePercentage: baseFee,
        isLifeNodesHolder: isLifeNodes
      };
    }
    
    // Otherwise get the default fee
    const defaultFee = await marketplaceContract.defaultFeePercentage();
    const baseFee = Number(defaultFee) / 100;
    
    // Check if there's a LifeNodes discount function in the contract
    // This is speculative - you'd need to check if such a function exists
    try {
      // Try to call a hypothetical LifeNodes discount function
      // Replace this with the actual function name if it exists
      // const discountedFee = await marketplaceContract.getFeeForLifeNodesHolder?.(userAddress);
      // if (discountedFee !== undefined) {
      //   return {
      //     feePercentage: Number(discountedFee) / 100,
      //     isLifeNodesHolder: isLifeNodes
      //   };
      // }
    } catch (error) {
      // Function doesn't exist, use default fee
    }
    
    return {
      feePercentage: baseFee,
      isLifeNodesHolder: isLifeNodes
    };
    
  } catch (error) {
    console.error('Error getting marketplace fee for user:', error);
    throw error;
  }
}

/**
 * Test marketplace fees for different scenarios
 */
export async function testMarketplaceFees() {
  try {
    const provider = getBasedAIProvider();
    
    // Test addresses - replace with actual addresses
    const lifeNodesHolderAddress = '0x...'; // Replace with a known LifeNodes holder
    const nonHolderAddress = '0x...'; // Replace with a non-holder address
    const testNFTContract = '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21'; // LifeNodes contract for testing
    
    console.log('=== Marketplace Fee Testing ===');
    
    // Test LifeNodes holder
    if (lifeNodesHolderAddress !== '0x...') {
      const holderFee = await getMarketplaceFeeForUser(testNFTContract, lifeNodesHolderAddress, provider);
      console.log('LifeNodes Holder Fee:', {
        address: lifeNodesHolderAddress,
        feePercentage: holderFee.feePercentage,
        isLifeNodesHolder: holderFee.isLifeNodesHolder
      });
    }
    
    // Test non-holder
    if (nonHolderAddress !== '0x...') {
      const nonHolderFee = await getMarketplaceFeeForUser(testNFTContract, nonHolderAddress, provider);
      console.log('Non-Holder Fee:', {
        address: nonHolderAddress,
        feePercentage: nonHolderFee.feePercentage,
        isLifeNodesHolder: nonHolderFee.isLifeNodesHolder
      });
    }
    
    // Test default marketplace fee
    const defaultFee = await getMarketplaceFee(provider, testNFTContract);
    console.log('Default Marketplace Fee:', defaultFee);
    
  } catch (error) {
    console.error('Error testing marketplace fees:', error);
  }
} 