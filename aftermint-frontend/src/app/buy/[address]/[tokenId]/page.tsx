"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';

// Simple ABIs
const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function approve(address to, uint256 tokenId) external'
];

const MARKETPLACE_ABI = [
  'function getListing(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, uint64 listedAt, uint64 expiresAt, address privateBuyer, address paymentToken))',
  'function buyNFT(address nftContract, uint256 tokenId) external payable'
];

export default function BuyNFTPage({ params }: { params: Promise<{ address: string; tokenId: string }> }) {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  
  const [nftData, setNftData] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ address: string; tokenId: string } | null>(null);
  
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setResolvedParams(resolved);
    }
    resolveParams();
  }, [params]);
  
  useEffect(() => {
    if (!resolvedParams) return;
    
    async function fetchNFTData() {
      try {
        setLoading(true);
        setError(null);
        
        const nftAddress = resolvedParams!.address;
        const tokenId = Number(resolvedParams!.tokenId);
        
        // Connect to the blockchain
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, provider);
        const marketplaceAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
        const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
        
        // Check if token exists
        const owner = await nftContract.ownerOf(tokenId);
        
        // Get token URI and collection info
        const [tokenURI, name, symbol] = await Promise.all([
          nftContract.tokenURI(tokenId),
          nftContract.name(),
          nftContract.symbol()
        ]);
        
        // Check if token is listed
        const listing = await marketplace.getListing(nftAddress, tokenId);
        const isListed = listing && listing.seller !== ethers.ZeroAddress;
        
        if (!isListed) {
          setError("This NFT is not currently listed for sale.");
          setLoading(false);
          return;
        }
        
        // Fetch metadata
        let metadata = { name: `Token #${tokenId}`, image: '', description: '', attributes: [] };
        try {
          const response = await fetch(tokenURI);
          if (response.ok) {
            metadata = await response.json();
          }
        } catch (e) {
          console.error(`Error fetching metadata:`, e);
        }
        
        setNftData({
          tokenId,
          name: metadata.name || `Token #${tokenId}`,
          image: metadata.image || '',
          description: metadata.description || '',
          attributes: metadata.attributes || [],
          owner,
          collection: {
            name,
            symbol,
            address: nftAddress
          }
        });
        
        setListing({
          seller: listing.seller,
          price: ethers.formatEther(listing.price),
          priceWei: listing.price,
          listedAt: Number(listing.listedAt),
          expiresAt: Number(listing.expiresAt)
        });
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading NFT:', error);
        setError('Failed to load NFT: ' + (error.message || 'Unknown error'));
        setLoading(false);
      }
    }
    
    fetchNFTData();
  }, [resolvedParams]);
  
  const handleBuy = async () => {
    if (!isConnected || !userAddress || !walletClient) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!nftData || !listing) {
      alert('NFT data not loaded yet');
      return;
    }
    
    try {
      setBuying(true);
      setError(null);
      
      if (!resolvedParams) return;
      
      const nftAddress = resolvedParams.address;
      const tokenId = Number(resolvedParams.tokenId);
      const marketplaceAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
      
      // Create provider and signer - more defensive approach
      let provider;
      try {
        // Check if window.ethereum exists before trying to use it
        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.BrowserProvider(window.ethereum);
        } else {
          throw new Error('No ethereum provider found. Please install a wallet extension.');
        }
      } catch (providerError) {
        console.error('Provider error:', providerError);
        const errorMessage = providerError instanceof Error ? providerError.message : 'Unknown error';
        setError('Failed to connect to wallet: ' + errorMessage);
        setBuying(false);
        return;
      }
      
      const signer = await provider.getSigner();
      
      // Create contract instances with signer
      const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, signer);
      
      // Execute buy transaction
      const tx = await marketplace.buyNFT(nftAddress, tokenId, {
        value: listing.priceWei
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Success!
      setSuccess(true);
      setTransaction(receipt.hash);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/collection/${nftAddress}`);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error buying NFT:', error);
      setError('Transaction failed: ' + (error.message || 'Unknown error'));
    } finally {
      setBuying(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <div className="animate-pulse text-xl">Loading NFT data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-600/20 border border-red-700 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Link href={`/collection/${resolvedParams?.address || ''}`} className="text-blue-400 hover:underline">
          Back to collection
        </Link>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-green-600/20 border border-green-700 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
          <p className="mb-4">You have successfully purchased this NFT.</p>
          {transaction && (
            <p className="text-sm opacity-70 mb-2">
              Transaction: <span className="font-mono break-all">{transaction}</span>
            </p>
          )}
          <p>Redirecting to collection page...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="glass-card max-w-5xl mx-auto rounded-xl border border-theme-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* NFT Image */}
          <div className="bg-black aspect-square relative">
            {nftData?.image ? (
              <Image
                src={nftData.image}
                alt={nftData.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex justify-center items-center h-full bg-gray-900">
                <span>No Image Available</span>
              </div>
            )}
          </div>
          
          {/* NFT Details */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{nftData?.name}</h1>
              <p className="text-sm opacity-70 mb-4">
                {nftData?.collection.name} #{nftData?.tokenId}
              </p>
              
              {nftData?.description && (
                <p className="mt-4 text-sm md:text-base opacity-80">{nftData.description}</p>
              )}
            </div>
            
            {/* Price and actions */}
            <div className="py-4 border-t border-theme-border">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm opacity-70">Current price</p>
                  <p className="text-2xl md:text-3xl font-bold">{listing?.price} ETH/BASED</p>
                </div>
                
                {listing?.seller === userAddress ? (
                  <div className="bg-yellow-500/20 border border-yellow-600 px-4 py-2 rounded">
                    You are the seller
                  </div>
                ) : null}
              </div>
              
              {/* Buy button */}
              <div className="space-y-4">
                {!isConnected ? (
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                ) : listing?.seller === userAddress ? (
                  <button 
                    className="w-full py-3 px-6 bg-gray-600 text-white rounded-lg opacity-70 cursor-not-allowed"
                    disabled
                  >
                    You are the seller
                  </button>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className={`w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                      ${buying ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {buying ? 'Processing...' : `Buy for ${listing?.price} ETH/BASED`}
                  </button>
                )}
                
                <Link
                  href={`/collection/${resolvedParams?.address || ''}`}
                  className="block text-center w-full py-3 px-6 bg-transparent border border-theme-border 
                    hover:bg-theme-surface text-theme-text-primary rounded-lg"
                >
                  Back to collection
                </Link>
              </div>
            </div>
            
            {/* Seller info */}
            <div className="mt-6 pt-4 border-t border-theme-border">
              <p className="text-sm opacity-70">Seller</p>
              <p className="font-mono text-sm break-all">{listing?.seller}</p>
            </div>
            
            {/* Attributes */}
            {nftData?.attributes && nftData.attributes.length > 0 && (
              <div className="mt-6 pt-4 border-t border-theme-border">
                <h3 className="text-lg font-semibold mb-3">Properties</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {nftData.attributes.map((attr: any, index: number) => (
                    <div 
                      key={index} 
                      className="bg-theme-surface border border-theme-border rounded p-2 text-center"
                    >
                      <p className="text-xs opacity-70 uppercase">{attr.trait_type}</p>
                      <p className="font-medium truncate">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 