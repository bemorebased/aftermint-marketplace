"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, ExternalLink, Grid, ListFilter, Star, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import DirectNFTCard from '../../direct-nft-card';
import ViewModeToggle from '@/components/ViewModeToggle';
import { useAccount } from 'wagmi';
import { getNFTsForOwner, getBasedAIProvider } from '@/lib/services/nftService';
import { NFT_COLLECTIONS } from '@/lib/services/nftService';
import { ethers } from 'ethers';

// Use the NFT_COLLECTIONS from the service instead of hardcoded data
const collections = NFT_COLLECTIONS;

export default function UserProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'trader' | 'compact'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState<20 | 40>(20);
  const [activeTab, setActiveTab] = useState<'owned' | 'listings' | 'offers' | 'activity' | 'favorites'>('owned');
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionDays, setSubscriptionDays] = useState(23);
  const [lifeNodesOwned, setLifeNodesOwned] = useState(true);
  const [address, setAddress] = useState<string>('');
  
  // Resolve params Promise
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setAddress(resolved.address);
    }
    resolveParams();
  }, [params]);
  
  const provider = getBasedAIProvider();
  const { isConnected } = useAccount();
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Load NFT data for the profile
  useEffect(() => {
    async function fetchRealNFTData() {
      setLoading(true);
      
      try {
        console.log('Fetching NFTs for address:', address);
        
        // Fetch actual owned NFTs from the blockchain
        const nfts = await getNFTsForOwner(address, provider);
        console.log('Fetched NFTs:', nfts);
        
        if (nfts.length > 0) {
          // Convert the fetched NFTs to the expected format
          const formattedNFTs = await Promise.all(nfts.map(async (nft) => {
            // Fetch listing info to see if this NFT is listed
            const listingInfo = null; // Temporarily set to null since getListingInfo is not available
            
            return {
              id: nft.tokenId,
              tokenId: nft.tokenId,
              name: nft.metadata.name || `${nft.collection?.name || 'NFT'} #${nft.tokenId}`,
              image: nft.metadata.image,
              price: null, // Since listingInfo is set to null, price will be null
              collection: nft.collection,
              rarity: nft.metadata.attributes?.find((attr: any) => 
                attr.trait_type === 'Rarity' || attr.trait_type === 'Rank')?.value || Math.floor(Math.random() * 100) + 1,
              lastSale: null, // We don't have this data yet
              contractAddress: nft.contractAddress
            };
          }));
          
          setOwnedNFTs(formattedNFTs);
          
          // Filter for listed NFTs
          const listedNFTs = formattedNFTs.filter(nft => nft.price !== null);
          setListings(listedNFTs);
        } else {
          // If no NFTs found and we're in development, fall back to mock data
          if (process.env.NODE_ENV === 'development') {
            console.log('No NFTs found, using mock data for development');
            generateMockData();
          } else {
            setOwnedNFTs([]);
            setListings([]);
          }
        }
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        // Fall back to mock data in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Error fetching NFTs, using mock data for development');
          generateMockData();
        }
      } finally {
        setLoading(false);
      }
    }
    
    // Mock data generation function
    const generateMockData = () => {
      // Generate owned NFTs
      const owned = Array.from({ length: 12 }, (_, i) => {
        const collectionKeys = Object.keys(collections);
        const collection = collections[collectionKeys[i % collectionKeys.length] as keyof typeof collections];
        return {
          id: i + 1,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          name: `${collection.name} #${Math.floor(Math.random() * 10000) + 1}`,
          image: `https://picsum.photos/seed/owned${i}/500/500`, // Random placeholder images
          price: Math.random() < 0.5 ? (Math.random() * 2 + 0.1).toFixed(2) : null, // Some are listed, some are not
          collection: collection,
          rarity: Math.floor(Math.random() * 100) + 1,
          lastSale: parseFloat((Math.random() * 1 + 0.1).toFixed(2)),
        };
      });
      
      setOwnedNFTs(owned);
      
      // Generate listings (subset of owned that have prices)
      const listed = owned.filter(nft => nft.price !== null);
      setListings(listed);
      
      // Generate offers
      const mockOffers = Array.from({ length: 5 }, (_, i) => {
        const collectionKeys = Object.keys(collections);
        const collection = collections[collectionKeys[i % collectionKeys.length] as keyof typeof collections];
        return {
          id: i + 1,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          name: `${collection.name} #${Math.floor(Math.random() * 10000) + 1}`,
          image: `https://picsum.photos/seed/offer${i}/500/500`,
          offerPrice: parseFloat((Math.random() * 1 + 0.1).toFixed(2)),
          collection: collection,
          floorPrice: parseFloat((Math.random() * 2 + 0.2).toFixed(2)),
          expiration: new Date(Date.now() + Math.random() * 86400000 * 7), // Random expiration within a week
        };
      });
      setOffers(mockOffers);
      
      // Generate activity history
      const mockActivities = Array.from({ length: 10 }, (_, i) => {
        const collectionKeys = Object.keys(collections);
        const collection = collections[collectionKeys[i % collectionKeys.length] as keyof typeof collections];
        const activityTypes = ['purchase', 'sale', 'listing', 'offer', 'offer_received', 'mint'];
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        return {
          id: i + 1,
          type,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          name: `${collection.name} #${Math.floor(Math.random() * 10000) + 1}`,
          image: `https://picsum.photos/seed/activity${i}/500/500`,
          collection: collection,
          price: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
          date: new Date(Date.now() - Math.random() * 86400000 * 30), // Within the last month
          counterparty: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        };
      });
      
      // Sort activities by date (newest first)
      mockActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(mockActivities);
      
      // Generate favorites
      const mockFavorites = Array.from({ length: 6 }, (_, i) => {
        const collectionKeys = Object.keys(collections);
        const collection = collections[collectionKeys[i % collectionKeys.length] as keyof typeof collections];
        return {
          id: i + 1,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          name: `${collection.name} #${Math.floor(Math.random() * 10000) + 1}`,
          image: `https://picsum.photos/seed/fav${i}/500/500`,
          price: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
          collection: collection,
          rarity: Math.floor(Math.random() * 100) + 1,
          lastSale: parseFloat((Math.random() * 1 + 0.1).toFixed(2)),
        };
      });
      setFavorites(mockFavorites);
    };
    
    if (address && provider) {
      fetchRealNFTData();
    }
  }, [address, provider]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  // Get appropriate data for the current tab
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'owned':
        return ownedNFTs;
      case 'listings':
        return listings;
      case 'offers':
        return offers;
      case 'activity':
        return activities;
      case 'favorites':
        return favorites;
      default:
        return [];
    }
  };
  
  // Render content based on active tab and view mode
  const renderTabContent = () => {
    const data = getCurrentTabData();
    
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-theme-card-highlight rounded-xl mb-2"></div>
              <div className="h-4 bg-theme-card-highlight rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-theme-card-highlight rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-xl text-theme-text-secondary mb-4">No items found</p>
          {activeTab === 'owned' && (
            <Link 
              href="/collection" 
              className="px-6 py-3 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors"
            >
              Browse Collections
            </Link>
                )}
              </div>
      );
    }
    
    if (activeTab === 'activity') {
      return (
        <div className="bg-theme-surface border border-theme-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-theme-background">
              <tr className="border-b border-theme-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Item</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">From/To</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-theme-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-theme-border hover:bg-theme-background/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/nft/${activity.collection.contract}/${activity.tokenId}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-theme-border overflow-hidden bg-theme-card-highlight">
                        <div 
                          className="w-full h-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${activity.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-theme-text-primary">{`${activity.name}`}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize">{activity.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-theme-text-primary">{activity.price} BASED</td>
                  <td className="px-4 py-3 text-theme-text-secondary truncate max-w-[120px]">
                    {activity.type === 'sale' ? `To ${activity.counterparty}` : 
                     activity.type === 'purchase' ? `From ${activity.counterparty}` : 
                     activity.type === 'offer_received' ? `From ${activity.counterparty}` : 
                     activity.type === 'offer' ? `To ${activity.counterparty}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-theme-text-secondary">{formatDate(activity.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'offers') {
      return (
        <div className="bg-theme-surface border border-theme-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-theme-background">
              <tr className="border-b border-theme-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Item</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Offer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Floor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-theme-text-secondary">Expires</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-theme-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-theme-border hover:bg-theme-background/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/nft/${offer.collection.contract}/${offer.tokenId}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-theme-border overflow-hidden bg-theme-card-highlight">
                        <div 
                          className="w-full h-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${offer.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-theme-text-primary">{`${offer.name}`}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-theme-text-primary">{offer.offerPrice} BASED</td>
                  <td className="px-4 py-3 text-theme-text-secondary">{offer.floorPrice} BASED</td>
                  <td className="px-4 py-3 text-theme-text-secondary">{formatDate(offer.expiration)}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1 border border-theme-border text-theme-text-primary text-sm font-medium rounded-lg hover:bg-theme-card-highlight transition-colors">
                      Cancel
                </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.map((nft) => (
          <DirectNFTCard 
            key={`${nft.contractAddress || nft.collection?.contract || ''}-${nft.tokenId || nft.id}`} 
            id={nft.id} 
            name={nft.name} 
            image={nft.image} 
            price={nft.price} 
            isListed={!!nft.price}
            tokenId={nft.tokenId}
            contractAddress={nft.contractAddress}
            collection={nft.collection}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-theme-card-highlight border-4 border-theme-background">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(https://picsum.photos/seed/${address}/200/200)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          
          <div className="flex-grow">
            {/* Address and badges */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                {formatAddress(address)}
              </h1>
              <button 
                className="p-1 text-theme-text-secondary hover:text-theme-text-primary"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                <Copy size={16} />
              </button>
              
              {subscriptionActive && (
                <div className="px-3 py-1 text-xs font-medium bg-theme-primary/20 text-theme-primary rounded-full flex items-center gap-1">
                  <Star size={12} />
                  <span>Premium User</span>
                </div>
              )}
              
              {lifeNodesOwned && (
                <div className="px-3 py-1 text-xs font-medium bg-theme-secondary/20 text-theme-secondary rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>LifeNodes Holder</span>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 mt-4">
              <div className="glass-card rounded-lg p-3 border border-theme-border">
                <p className="text-sm text-theme-text-secondary mb-1">NFTs Owned</p>
                <p className="text-xl font-bold">{ownedNFTs.length}</p>
              </div>
              <div className="glass-card rounded-lg p-3 border border-theme-border">
                <p className="text-sm text-theme-text-secondary mb-1">Collections</p>
                <p className="text-xl font-bold">
                  {Object.keys(
                    ownedNFTs.reduce((acc: Record<string, boolean>, nft) => {
                      acc[nft.collection.contract] = true;
                      return acc;
                    }, {})
                  ).length}
                </p>
              </div>
              <div className="glass-card rounded-lg p-3 border border-theme-border">
                <p className="text-sm text-theme-text-secondary mb-1">Active Listings</p>
                <p className="text-xl font-bold">{listings.length}</p>
            </div>
              <div className="glass-card rounded-lg p-3 border border-theme-border">
                <p className="text-sm text-theme-text-secondary mb-1">Active Offers</p>
                <p className="text-xl font-bold">{offers.length}</p>
          </div>
            </div>
            
            {/* Subscription Status */}
            {subscriptionActive && (
              <div className="glass-card rounded-lg p-3 border border-theme-primary max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-text-secondary mb-1">Subscription Status</p>
                    <p className="text-md font-bold flex items-center gap-2">
                      <span className="text-theme-primary">Active</span>
                      <span className="text-theme-text-secondary">•</span>
                      <span>{subscriptionDays} days remaining</span>
                    </p>
            </div>
                  <Link href="/subscription" className="text-theme-primary text-sm hover:underline">
                    Manage
                  </Link>
            </div>
              </div>
            )}
            </div>
          </div>
        </div>
        
      {/* Tab navigation */}
      <div className="mb-6">
        <div className="flex border-b border-theme-border overflow-x-auto">
            <button
            className={`px-6 py-3 font-medium text-lg relative whitespace-nowrap ${activeTab === 'owned' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
              onClick={() => setActiveTab('owned')}
            >
            Owned
            {activeTab === 'owned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
            </button>
            <button
            className={`px-6 py-3 font-medium text-lg relative whitespace-nowrap ${activeTab === 'listings' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
            onClick={() => setActiveTab('listings')}
            >
            Listings
            {activeTab === 'listings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
            </button>
            <button
            className={`px-6 py-3 font-medium text-lg relative whitespace-nowrap ${activeTab === 'offers' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
              onClick={() => setActiveTab('offers')}
            >
            Offers
            {activeTab === 'offers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
            </button>
            <button
            className={`px-6 py-3 font-medium text-lg relative whitespace-nowrap ${activeTab === 'activity' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
              onClick={() => setActiveTab('activity')}
            >
            Activity
            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
            </button>
            <button
            className={`px-6 py-3 font-medium text-lg relative whitespace-nowrap ${activeTab === 'favorites' ? 'text-theme-primary' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
            onClick={() => setActiveTab('favorites')}
            >
            Favorites
            {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></div>}
            </button>
          </div>
        </div>
        
      {/* View Controls - Only show on relevant tabs */}
      {(activeTab === 'owned' || activeTab === 'listings' || activeTab === 'favorites') && (
        <div className="flex justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">
              {activeTab === 'owned' ? 'My NFTs' : 
               activeTab === 'listings' ? 'My Listings' : 
               activeTab === 'favorites' ? 'Favorite NFTs' : ''}
            </div>
            <span className="text-theme-text-secondary">
              {activeTab === 'owned' ? `${ownedNFTs.length} items` : 
               activeTab === 'listings' ? `${listings.length} items` : 
               activeTab === 'favorites' ? `${favorites.length} items` : ''}
            </span>
          </div>
          
          <ViewModeToggle 
            currentMode={viewMode} 
            onChange={setViewMode}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
            </div>
          )}
          
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Not Subscribed CTA */}
      {!subscriptionActive && (
        <div className="mt-12 glass-card rounded-xl border border-theme-border p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Get premium marketplace benefits</h3>
              <p className="text-theme-text-secondary mb-0">
                Subscribe to reduce marketplace fees and unlock exclusive features
              </p>
            </div>
            <Link 
              href="/subscription" 
              className="px-6 py-3 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors whitespace-nowrap"
            >
              Subscribe Now
            </Link>
            </div>
            </div>
          )}
        </div>
  );
}
