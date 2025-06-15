"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, usePublicClient } from 'wagmi';
import { Tab } from '@headlessui/react';
import { User, Clock, Tag, Wallet, Heart, ChevronDown, Settings, ExternalLink, Star, CircleDollarSign, CalendarCheck, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import NftCard from '@/components/NftCard';
import CollectionGroup from '@/components/CollectionGroup';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getNFTsForOwner, getBasedAIProvider, LIFENODES_NFT_ADDRESS } from '@/lib/services/nftService';
import { 
  getAddressGroupedNFTCollections, 
  getWalletActivity, 
  GroupedNFTCollection, 
  WalletTransaction,
  getUserListings,
  getUserOffers
} from '@/lib/services/profileService';
import { UserListing, UserOffer } from '@/lib/services/storageService';
import { ethers } from 'ethers';
import Image from 'next/image';
import { formatEther } from 'ethers';
import { fetchWalletBalance } from '@/utils/blockchain';

// Helper function to check if a URL is from Imgur
function isImgurUrl(url: string) {
  return url && typeof url === 'string' && url.includes('imgur.com');
}

// Type definition for ethereum window
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Persistent wallet connection helper
function usePersistentConnection() {
  useEffect(() => {
    // Check for stored wallet connection on page load
    const checkConnection = async () => {
      try {
        // This is just to ensure the wallet reconnects properly if supported by the browser
        // Most wallet providers already handle this via localStorage
        if (typeof window !== 'undefined' && window.ethereum) {
          // When using modern browsers, we can prompt the wallet to reconnect
          await window.ethereum.request({ method: 'eth_accounts' });
        }
      } catch (error) {
        console.error('Error checking persistent connection:', error);
      }
    };
    
    // Run the check in a setTimeout to avoid updating during render
    setTimeout(checkConnection, 0);
  }, []);
}

function ProfilePageContent() {
  const { address, isConnected } = useAccount();
  const provider = usePublicClient();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'collected';
  const [activeTab, setActiveTab] = useState('collected');
  const [groupedCollections, setGroupedCollections] = useState<GroupedNFTCollection[]>([]);
  const [activityItems, setActivityItems] = useState<WalletTransaction[]>([]);
  const [listingsItems, setListingsItems] = useState<UserListing[]>([]);
  const [offersItems, setOffersItems] = useState<UserOffer[]>([]);
  const [favoritesItems, setFavoritesItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletStats, setWalletStats] = useState({
    totalValue: "0 BASED",
    nftCount: 0,
    nftValue: "0 BASED",
    tokensValue: "0 BASED"
  });
  
  // Use the persistent connection hook
  usePersistentConnection();
  
  // Subscription states
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'7day' | '30day' | '365day' | null>(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'7day' | '30day' | '365day'>('30day');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Subscription plans
  const subscriptionPlans = [
    { id: '7day', name: '7 Days', price: 1000, discountedFee: 0, regularFee: 100 },
    { id: '30day', name: '30 Days', price: 3000, discountedFee: 0, regularFee: 100, popular: true },
    { id: '365day', name: '365 Days', price: 25000, discountedFee: 0, regularFee: 100 }
  ];

  // Fetch subscription status function
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isConnected || !address) return;
    
    try {
      // In a real implementation, this would call the smart contract to check subscription status
      // For now, we'll use a mock that randomly shows an active subscription or not
      const randomHasSubscription = Math.random() > 0.5;
      
      if (randomHasSubscription) {
        const tiers = ['7day', '30day', '365day'] as const;
        const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
        const now = new Date();
        
        // Generate a random expiry date in the future based on the tier
        let daysToAdd = 0;
        if (randomTier === '7day') daysToAdd = Math.floor(Math.random() * 7) + 1;
        else if (randomTier === '30day') daysToAdd = Math.floor(Math.random() * 30) + 1;
        else daysToAdd = Math.floor(Math.random() * 365) + 1;
        
        const expiryDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        
        setHasActiveSubscription(true);
        setSubscriptionTier(randomTier);
        setSubscriptionExpiry(expiryDate);
      } else {
        setHasActiveSubscription(false);
        setSubscriptionTier(null);
        setSubscriptionExpiry(null);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setHasActiveSubscription(false);
      setSubscriptionTier(null);
      setSubscriptionExpiry(null);
    }
  }, [isConnected, address]);

  // Subscription purchase function
  const handleSubscriptionPurchase = async () => {
    if (!isConnected || !address) return;
    
    setSubscriptionLoading(true);
    setShowConfirmDialog(false);
    
    try {
      // This would be a contract call in a real implementation
      console.log(`Purchasing ${selectedPlan} subscription for address ${address}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      const selectedPlanObj = subscriptionPlans.find(plan => plan.id === selectedPlan);
      let daysToAdd = 0;
      if (selectedPlan === '7day') daysToAdd = 7;
      else if (selectedPlan === '30day') daysToAdd = 30;
      else daysToAdd = 365;
      
      const now = new Date();
      const expiryDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      
      setHasActiveSubscription(true);
      setSubscriptionTier(selectedPlan);
      setSubscriptionExpiry(expiryDate);
      
      // Show success toast or message here
      alert(`Successfully purchased ${selectedPlanObj?.name} subscription!`);
    } catch (error) {
      console.error("Error purchasing subscription:", error);
      // Show error toast or message here
      alert("Failed to purchase subscription. Please try again.");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Format date function
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'less than an hour ago';
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than a month
    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format relative time for subscription expiry
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // If expired
    if (diff <= 0) return 'Expired';
    
    // Convert to days
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 1) return 'Expires tomorrow';
    else if (days < 30) return `Expires in ${days} days`;
    else if (days < 365) {
      const months = Math.floor(days / 30);
      return `Expires in ${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(days / 365);
      return `Expires in ${years} year${years > 1 ? 's' : ''}`;
    }
  };

  // Enhanced fetchUserData function
  const fetchUserData = useCallback(async () => {
    if (!address) return;
    
    try {
      console.log(`[Profile] Fetching data for address: ${address}`);
      
      // Fetch grouped collections
      const collections = await getAddressGroupedNFTCollections(address);
      console.log(`[Profile] Fetched ${collections.length} collections`);
      setGroupedCollections(collections);
      
      // Fetch wallet activity
      const activity = await getWalletActivity(address);
      console.log(`[Profile] Fetched ${activity.length} activity items`);
      setActivityItems(activity);
      
      // Fetch user listings and offers
      const [listings, offers] = await Promise.all([
        getUserListings(address),
        getUserOffers(address)
      ]);
      
      console.log(`[Profile] Fetched ${listings.length} listings and ${offers.length} offers`);
      setListingsItems(listings);
      setOffersItems(offers);
      
      // Calculate total NFT count from collections
      const totalNFTs = collections.reduce((total, collection) => {
        return total + (collection.token_instances?.length || 0);
      }, 0);
      
      // Update wallet stats
      setWalletStats(prev => ({
        ...prev,
        nftCount: totalNFTs,
        nftValue: `${totalNFTs * 0.1} BASED` // Placeholder calculation
      }));
      
    } catch (error) {
      console.error('[Profile] Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      setListingsItems([]);
      setFavoritesItems([]);
      
      // Reset wallet stats
      setWalletStats({
        totalValue: "0 BASED",
        nftCount: 0,
        nftValue: "0 BASED",
        tokensValue: "0 BASED"
      });
      
      fetchUserData();
      fetchSubscriptionStatus();
    } else if (!isConnected) {
      // If not connected, clear data and set loading to false
      setGroupedCollections([]);
      setActivityItems([]);
      setListingsItems([]);
      setFavoritesItems([]);
      setWalletStats({
        totalValue: "0 BASED",
        nftCount: 0,
        nftValue: "0 BASED",
        tokensValue: "0 BASED"
      });
      setLoading(false);
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-theme-text-secondary mb-8">
            Connect your wallet to view your NFTs, activity, and manage your marketplace listings.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        {/* Left side: User Info */}
        <div className="flex-grow">
          <div className="flex items-start gap-3 mb-1.5">
            <div className="w-12 h-12 rounded-full bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-theme-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-theme-text-primary break-all">{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Anonymous'}</h1>
                <div className="px-2 py-0.5 bg-theme-primary/10 text-theme-primary text-xs rounded-full whitespace-nowrap">Connected</div>
                {hasActiveSubscription && (
                  <div className="px-2 py-0.5 bg-theme-primary/20 text-theme-primary text-xs rounded-full whitespace-nowrap flex items-center gap-1">
                    <Star size={10} />
                    <span>Premium</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-theme-text-secondary text-xs mb-1.5">
                <span>Joined May 2024</span>
                <span>•</span>
                <button 
                  onClick={() => {navigator.clipboard.writeText(address || '')}} 
                  className="hover:text-theme-primary transition-colors truncate"
                  title="Copy address to clipboard"
                >
                  {address}
                </button>
                <span className="text-theme-text-tertiary">|</span>
                <Link href={`https://explorer.bf1337.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-theme-primary">
                  <ExternalLink size={12} />
                  <span>Explorer</span>
                </Link>
                <span className="text-theme-text-tertiary">|</span>
                <Link href="/settings" className="flex items-center gap-1 hover:text-theme-primary">
                  <Settings size={12} />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side: Wallet Stats - Updated Layout */}
        <div className="grid grid-cols-2 gap-px border border-theme-border rounded-lg overflow-hidden min-w-[300px] w-full sm:w-auto shadow-sm bg-theme-border">
          {/* Column 1: Total Wallet Value */}
          <div className="bg-theme-surface p-3">
            <h3 className="text-xs text-theme-text-secondary mb-0.5">Wallet Value</h3>
            <p className="text-lg font-bold text-theme-text-primary">{walletStats.totalValue}</p>
          </div>

          {/* Column 2: NFTs and Tokens Value */}
          <div className="bg-theme-surface p-3 flex flex-col justify-center">
            <div className="text-xs">
              <span className="text-theme-text-secondary">NFTs ({walletStats.nftCount})</span> 
              <span className="font-medium text-theme-text-primary float-right">{walletStats.nftValue}</span>
            </div>
            <div className="text-xs">
              <span className="text-theme-text-secondary">Tokens</span> 
              <span className="font-medium text-theme-text-primary float-right">{walletStats.tokensValue}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-theme-border mb-8">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'collected' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('collected')}
          >
            <Wallet className="mr-2" size={16} />
            Collected
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'activity' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('activity')}
          >
            <Clock className="mr-2" size={16} />
            Activity
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'offers' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('offers')}
          >
            <Tag className="mr-2" size={16} />
            Offers
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'listings' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('listings')}
          >
            <Tag className="mr-2" size={16} />
            Listings
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'favorites' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart className="mr-2" size={16} />
            Favorites
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'subscription' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-text-primary/30'}`}
            onClick={() => setActiveTab('subscription')}
          >
            <Star className="mr-2" size={16} />
            Subscription
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="min-h-[500px]">
        {/* Loading State */}
        {loading && activeTab !== 'subscription' && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
          </div>
        )}
        
        {/* No NFTs State */}
        {!loading && activeTab === 'collected' && groupedCollections.length === 0 && (
          <div className="text-center py-12 px-4">
            <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
            <p className="text-theme-text-secondary mb-6">
              You don't have any NFTs in your wallet yet.
            </p>
            <Link href="/collection" className="px-6 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors">
              Browse Collections
            </Link>
          </div>
        )}
        
        {/* Collected Tab */}
        {!loading && activeTab === 'collected' && (
          <div>
            {/* Collections View Only */}
            <div className="space-y-4">
              {groupedCollections.length > 0 ? (
                groupedCollections.map((collection) => (
                  <CollectionGroup
                    key={collection.token.address}
                    collection={collection}
                    onNFTClick={(contractAddress, tokenId) => {
                      // Navigate to NFT detail page
                      window.location.href = `/nft/${contractAddress}/${tokenId}`;
                    }}
                    onCollectionClick={(contractAddress) => {
                      // Navigate to collection page
                      window.location.href = `/collection/${contractAddress}`;
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-theme-text-secondary mb-4">No NFT collections found</p>
                  <p className="text-sm text-theme-text-tertiary">
                    Your NFT collections will appear here when you own some
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Activity Tab */}
        {!loading && activeTab === 'activity' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left border-b border-theme-border">
                <tr>
                  <th className="py-3 pr-4 text-theme-text-secondary font-medium text-sm">Transaction</th>
                  <th className="py-3 px-4 text-theme-text-secondary font-medium text-sm">From/To</th>
                  <th className="py-3 px-4 text-theme-text-secondary font-medium text-sm">Value</th>
                  <th className="py-3 px-4 text-theme-text-secondary font-medium text-sm">Status</th>
                  <th className="py-3 pl-4 text-theme-text-secondary font-medium text-sm">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {activityItems.map((transaction) => {
                  const isOutgoing = transaction.from.toLowerCase() === address?.toLowerCase();
                  const otherAddress = isOutgoing ? transaction.to : transaction.from;
                  const shortAddress = `${otherAddress.substring(0, 6)}...${otherAddress.substring(otherAddress.length - 4)}`;
                  const valueInEther = transaction.value !== '0' ? parseFloat(formatEther(transaction.value)).toFixed(4) : '0';
                  
                  return (
                    <tr key={transaction.hash}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <Link
                            href={`https://explorer.bf1337.org/tx/${transaction.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:underline font-mono text-sm"
                          >
                            {transaction.hash.substring(0, 10)}...
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isOutgoing 
                              ? 'bg-red-500/10 text-red-500' 
                              : 'bg-green-500/10 text-green-500'
                          }`}>
                            {isOutgoing ? 'TO' : 'FROM'}
                          </span>
                          <Link
                            href={`https://explorer.bf1337.org/address/${otherAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-text-primary hover:text-theme-primary font-mono"
                          >
                            {shortAddress}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-theme-text-primary">
                          {valueInEther} BASED
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          transaction.status === 'ok' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {transaction.status === 'ok' ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-theme-text-secondary text-sm">
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {activityItems.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary" />
                <p className="text-theme-text-secondary">No wallet activity found</p>
                <p className="text-sm text-theme-text-tertiary mt-2">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Offers Tab */}
        {!loading && activeTab === 'offers' && (
          <div>
            {offersItems.length > 0 ? (
              <div className="space-y-4">
                {offersItems.map((offer, index) => (
                  <div key={`${offer.nftContract}-${offer.tokenId}-${offer.offerIndex}`} className="glass-card rounded-lg border border-theme-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-theme-surface flex items-center justify-center">
                          <span className="text-2xl">🖼️</span>
                        </div>
                        <div>
                          <h3 className="text-theme-text font-medium">
                            NFT #{offer.tokenId}
                          </h3>
                          <p className="text-theme-text-secondary text-sm">
                            {offer.nftContract.substring(0, 10)}...{offer.nftContract.substring(38)}
                          </p>
                          <p className="text-theme-text-tertiary text-xs">
                            Offered {offer.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-theme-accent font-medium text-lg">
                          {offer.price} BASED
                        </p>
                        <p className="text-theme-text-secondary text-sm">
                          Status: {offer.status}
                        </p>
                        {offer.expiresAt && (
                          <p className="text-theme-text-tertiary text-xs">
                            Expires: {offer.expiresAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-theme-text-secondary mb-4">No active offers found</p>
                <p className="text-sm text-theme-text-tertiary">
                  Your active offers on NFTs will appear here
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Listings Tab */}
        {!loading && activeTab === 'listings' && (
          <div>
            {listingsItems.length > 0 ? (
              <div className="space-y-4">
                {listingsItems.map((listing, index) => (
                  <div key={`${listing.nftContract}-${listing.tokenId}-${listing.listingIndex}`} className="glass-card rounded-lg border border-theme-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-theme-surface flex items-center justify-center">
                          <span className="text-2xl">🖼️</span>
                        </div>
                        <div>
                          <h3 className="text-theme-text font-medium">
                            NFT #{listing.tokenId}
                          </h3>
                          <p className="text-theme-text-secondary text-sm">
                            {listing.nftContract.substring(0, 10)}...{listing.nftContract.substring(38)}
                          </p>
                          <p className="text-theme-text-tertiary text-xs">
                            Listed {listing.listedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-theme-accent font-medium text-lg">
                          {listing.price} BASED
                        </p>
                        <p className="text-theme-text-secondary text-sm">
                          Status: {listing.status}
                        </p>
                        {listing.expiresAt && (
                          <p className="text-theme-text-tertiary text-xs">
                            Expires: {listing.expiresAt.toLocaleDateString()}
                          </p>
                        )}
                        {listing.privateBuyer && (
                          <p className="text-theme-text-tertiary text-xs">
                            Private listing
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-theme-text-secondary mb-4">No active listings found</p>
                <p className="text-sm text-theme-text-tertiary">
                  Your active NFT listings will appear here
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Favorites Tab */}
        {!loading && activeTab === 'favorites' && (
          <div>
            {favoritesItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favoritesItems.map((nft) => (
                  <NftCard 
                    key={`favorite-${nft.contractAddress}-${nft.tokenId}`}
                    id={nft.tokenId}
                    name={nft.name}
                    collection={nft.collection}
                    image={nft.image}
                    price={nft.price}
                    isListed={nft.isListed}
                    contractAddress={nft.contractAddress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-theme-text-secondary mb-4">You haven't favorited any NFTs yet</p>
                <Link href="/collection" className="px-6 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors">
                  Browse Collections
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            {/* Current Subscription Status */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Your Subscription</h2>
              
              <div className="glass-card rounded-xl border border-theme-border p-6 mb-8">
                {hasActiveSubscription ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-grow">
                      <div className="w-12 h-12 rounded-lg bg-theme-primary/20 flex items-center justify-center">
                        <Star size={24} className="text-theme-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          Premium Plan
                          <span className="text-theme-primary">
                            <CheckCircle size={16} />
                          </span>
                        </h3>
                        <p className="text-theme-text-secondary">
                          {subscriptionTier === '7day' ? '7 Days' : 
                           subscriptionTier === '30day' ? '30 Days' : '365 Days'} Plan • 0% Marketplace Fee
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <div className="bg-theme-primary/10 text-theme-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CalendarCheck size={14} />
                        {formatRelativeTime(subscriptionExpiry)}
                      </div>
                      <div className="text-xs text-theme-text-secondary">
                        {subscriptionExpiry?.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-grow">
                      <div className="w-12 h-12 rounded-lg bg-theme-card-highlight flex items-center justify-center">
                        <AlertCircle size={24} className="text-theme-text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">No Active Subscription</h3>
                        <p className="text-theme-text-secondary">
                          Subscribe to get 0% marketplace fees
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Link href="#choose-plan" className="bg-theme-primary text-black px-4 py-2 rounded-lg font-medium text-sm inline-block hover:bg-theme-primary/90 transition-colors">
                        Get Started
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Subscription Plans */}
            <div id="choose-plan">
              <h2 className="text-2xl font-bold mb-6">{hasActiveSubscription ? 'Renew or Change Plan' : 'Choose a Plan'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {subscriptionPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`glass-card rounded-xl border p-6 relative ${
                      selectedPlan === plan.id 
                        ? 'border-theme-primary shadow-md' 
                        : 'border-theme-border hover:border-theme-border-hover cursor-pointer'
                    }`}
                    onClick={() => setSelectedPlan(plan.id as any)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 right-4 bg-theme-primary text-black text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <CircleDollarSign size={20} className="text-theme-primary" />
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-2xl font-bold">{plan.price.toLocaleString()} <span className="text-sm font-normal text-theme-text-secondary">BASED</span></p>
                      <p className="text-theme-text-secondary text-sm">0% marketplace fee (was 1%)</p>
                    </div>
                    
                    <ul className="text-sm space-y-2 mb-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-theme-primary mt-0.5 flex-shrink-0" />
                        <span>0% marketplace fees on all transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-theme-primary mt-0.5 flex-shrink-0" />
                        <span>Access to premium marketplace features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-theme-primary mt-0.5 flex-shrink-0" />
                        <span>Premium badge on your profile</span>
                      </li>
                    </ul>
                    
                    <button
                      className={`w-full py-2 rounded-lg font-medium ${
                        selectedPlan === plan.id
                          ? 'bg-theme-primary text-black hover:bg-theme-primary/90'
                          : 'bg-theme-surface border border-theme-border hover:bg-theme-card-highlight'
                      } transition-colors`}
                      onClick={() => {
                        setSelectedPlan(plan.id as any);
                        setShowConfirmDialog(true);
                      }}
                    >
                      {hasActiveSubscription ? 'Switch to this plan' : 'Choose this plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-theme-surface rounded-xl max-w-md w-full p-6 border border-theme-border shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Confirm Subscription</h3>
                  
                  <p className="text-theme-text-secondary mb-6">
                    You are about to purchase the {
                      subscriptionPlans.find(p => p.id === selectedPlan)?.name
                    } subscription plan for {
                      subscriptionPlans.find(p => p.id === selectedPlan)?.price.toLocaleString()
                    } BASED.
                  </p>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      className="px-4 py-2 border border-theme-border rounded-lg hover:bg-theme-card-highlight transition-colors"
                      onClick={() => setShowConfirmDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-theme-primary text-black rounded-lg font-medium hover:bg-theme-primary/90 transition-colors flex items-center gap-2"
                      onClick={handleSubscriptionPurchase}
                      disabled={subscriptionLoading}
                    >
                      {subscriptionLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-theme-background border-t-transparent rounded-full"></div>
                          Processing...
                        </>
                      ) : (
                        'Confirm Purchase'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
} 