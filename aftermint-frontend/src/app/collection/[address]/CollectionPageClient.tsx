"use client";

import React, { useState, useEffect } from 'react';
import DirectNFTCard from '../../direct-nft-card';
import NFTInteractionModal from '@/components/NFTInteractionModal';
import { basedCollections } from '@/data/collections';
import { fetchAllCollectionTokens } from '@/utils/blockchain';
import { getCollectionListingsFromAPI } from '@/lib/services/marketplaceService';

interface Collection {
  name: string;
  contract: string;
  logo?: string;
  description?: string;
  totalSupply?: number;
  holders?: number;
}

interface NFTData {
  id: number;
  tokenId: number;
  name: string;
  image: string;
  owner?: string;
  isListed?: boolean;
  price?: number;
  seller?: string;
  collection?: {
    contract: string;
    name: string;
  };
}

interface CollectionPageClientProps {
  address: string;
}

export default function CollectionPageClient({ address }: CollectionPageClientProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!address) {
    return <div>Loading...</div>;
  }

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[CollectionPageClient] 🚀 Starting NFT fetch for ${address}`);
      
      // Fetch collection tokens - fetchAllCollectionTokens returns array directly
      console.log(`[CollectionPageClient] 📡 Calling fetchAllCollectionTokens...`);
      const tokens = await fetchAllCollectionTokens(address, 100, 777);
      console.log(`[CollectionPageClient] 📦 Raw tokens result:`, {
        type: typeof tokens,
        isArray: Array.isArray(tokens),
        length: tokens?.length,
        firstToken: tokens?.[0]
      });
      
      if (tokens && Array.isArray(tokens) && tokens.length > 0) {
        console.log(`[CollectionPageClient] 🎯 Found ${tokens.length} tokens, fetching marketplace listings...`);
        
        // Get marketplace listings
        const listings = await getCollectionListingsFromAPI(address);
        console.log(`[CollectionPageClient] 💰 Marketplace listings:`, {
          count: listings?.length || 0,
          listings: listings
        });
        
        // Process NFTs with listing data
        const processedNFTs = tokens.map((token: any, index: number) => {
          const tokenId = parseInt(token.id || token.tokenId || index.toString());
          const listing = listings.find(l => parseInt(l.tokenId) === tokenId);
          
          const nftData = {
            id: tokenId,
            tokenId: tokenId,
            name: token.metadata?.name || token.name || `${collection?.name || 'NFT'} #${tokenId}`,
            image: token.metadata?.image || token.image || token.imageUrl || `https://picsum.photos/seed/${address}${tokenId}/500/500`,
            owner: token.owner?.hash || token.owner,
            isListed: !!listing,
            price: listing ? parseFloat(listing.price) : null,
            seller: listing?.seller,
            collection: {
              contract: address,
              name: collection?.name || 'Unknown Collection'
            }
          };
          
          if (index < 3) {
            console.log(`[CollectionPageClient] 🔍 Sample NFT #${index}:`, nftData);
          }
          
          return nftData;
        });

        // Sort: listed items first by price low to high, then unlisted by tokenId
        const sortedNFTs = processedNFTs.sort((a, b) => {
          if (a.isListed && !b.isListed) return -1;
          if (!a.isListed && b.isListed) return 1;
          if (a.isListed && b.isListed) return (a.price || 0) - (b.price || 0);
          return a.tokenId - b.tokenId;
        });

        setNfts(sortedNFTs);
        console.log(`[CollectionPageClient] ✅ Successfully processed ${sortedNFTs.length} NFTs`);
      } else {
        console.log(`[CollectionPageClient] ❌ No tokens found for ${address}`, {
          tokens,
          type: typeof tokens,
          isArray: Array.isArray(tokens)
        });
        setNfts([]);
      }
    } catch (error) {
      console.error('[CollectionPageClient] 💥 Error fetching NFTs:', error);
      setError(`Failed to load NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNFTInteraction = (nftData: any) => {
    console.log('[CollectionPageClient] NFT interaction:', nftData);
    setSelectedNFT(nftData);
    setIsModalOpen(true);
  };

  // Initialize collection data and fetch NFTs
  useEffect(() => {
    if (!address) return;

    const initializeCollection = async () => {
      // Set initial collection data from basedCollections
      const basedCollection = basedCollections.find(c => c.id.toLowerCase() === address.toLowerCase());
      if (basedCollection) {
        setCollection({
          name: basedCollection.name,
          contract: basedCollection.id,
          logo: basedCollection.logoUrl,
          description: basedCollection.description || `Collection for ${basedCollection.name}`,
          totalSupply: basedCollection.items || 777, // Default to 777 for LifeNodes
          holders: basedCollection.owners || 500,
        });
      } else {
        // Set a default collection if not found in basedCollections
        setCollection({
          name: 'Unknown Collection',
          contract: address,
          description: 'Collection details loading...',
          totalSupply: 777,
          holders: 500,
        });
      }

      // Fetch real collection data from blockchain/explorer
      try {
        console.log(`[CollectionPageClient] Fetching real collection data for ${address}`);
        
        // Get collection info from explorer API
        const response = await fetch(`https://explorer.bf1337.org/api?module=token&action=tokeninfo&contractaddress=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "1" && data.result) {
            const tokenInfo = data.result;
            console.log(`[CollectionPageClient] Token info from explorer:`, tokenInfo);
            
            // Update collection with real data
            setCollection(prev => ({
              ...prev,
              totalSupply: parseInt(tokenInfo.totalSupply || tokenInfo.supply || prev?.totalSupply || 777),
              name: tokenInfo.name || prev?.name || 'Unknown Collection',
            }));
          }
        }

        // Get holder count from explorer API
        const holdersResponse = await fetch(`https://explorer.bf1337.org/api?module=token&action=tokenholderlist&contractaddress=${address}&page=1&offset=1`);
        if (holdersResponse.ok) {
          const holdersData = await holdersResponse.json();
          if (holdersData.status === "1" && holdersData.result) {
            console.log(`[CollectionPageClient] Holders data:`, holdersData.result.length);
            setCollection(prev => ({
              ...prev,
              holders: holdersData.result.length || prev?.holders || 500
            }));
          }
        }
      } catch (error) {
        console.error('[CollectionPageClient] Error fetching real collection data:', error);
      }

      // Fetch NFTs after collection data is set
      fetchNFTs();
    };

    initializeCollection();
  }, [address]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
        <p className="text-theme-text-secondary">Loading collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-theme-text-secondary mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-theme-primary text-black rounded-xl hover:bg-theme-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
        <p className="text-theme-text-secondary mb-8">
          The collection could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Collection Header */}
      <div className="mb-8">
        <div className="glass-card rounded-xl border border-theme-border p-6">
          <div className="flex items-center gap-6">
            {collection.logo && (
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-theme-surface">
                <img
                  src={collection.logo}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-theme-text-primary mb-2">{collection.name}</h1>
              <p className="text-theme-text-secondary mb-4">{collection.description}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-theme-text-secondary">Total Supply: </span>
                  <span className="font-semibold">{collection.totalSupply}</span>
                </div>
                <div>
                  <span className="text-theme-text-secondary">Holders: </span>
                  <span className="font-semibold">{collection.holders}</span>
                </div>
                <div>
                  <span className="text-theme-text-secondary">Items: </span>
                  <span className="font-semibold">{nfts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-theme-text-secondary text-lg">No NFTs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {nfts.map((nft) => (
            <DirectNFTCard
              key={nft.tokenId}
              id={nft.id}
              tokenId={nft.tokenId}
              name={nft.name}
              image={nft.image}
              owner={nft.owner}
              isListed={nft.isListed}
              price={nft.price?.toString()}
              seller={nft.seller}
              collection={nft.collection}
              contractAddress={address}
              onInteract={handleNFTInteraction}
            />
          ))}
        </div>
      )}

      {/* NFT Interaction Modal */}
      <NFTInteractionModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNFT(null);
        }}
      />
    </div>
  );
} 