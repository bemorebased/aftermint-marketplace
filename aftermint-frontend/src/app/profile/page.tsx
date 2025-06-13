"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, usePublicClient } from 'wagmi';
import { Tab } from '@headlessui/react';
import { User, Clock, Tag, Wallet, Heart, ChevronDown, Settings, ExternalLink, Star, CircleDollarSign, CalendarCheck, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import NftCard from '@/components/NftCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getNFTsForOwner, getBasedAIProvider, LIFENODES_NFT_ADDRESS } from '@/lib/services/nftService';
import { ethers } from 'ethers';
import { formatEther } from 'ethers';
import { fetchWalletBalance, fetchUserNFTs, fetchUserActivity } from '@/utils/blockchain';
import { basedCollections } from '@/data/collections';
import { captureError } from '@/utils/errorTracking';
import SafeImage from '@/components/SafeImage';

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
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [activityItems, setActivityItems] = useState<any[]>([]);
  const [offersItems, setOffersItems] = useState<any[]>([]);
  const [listingsItems, setListingsItems] = useState<any[]>([]);
  const [favoritesItems, setFavoritesItems] = useState<any[]>([]);
  
  // Use the persistent connection hook - DISABLED TO FIX RUNTIME ERRORS
  // usePersistentConnection();
  
  // Subscription states
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<any>(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'7day' | '30day' | '365day'>('30day');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 48; // Match collection page pagination

  // Subscription plans
  const subscriptionPlans = [
    { id: '7day', name: '7 Days', price: 1000, discountedFee: 0, regularFee: 100 },
    { id: '30day', name: '30 Days', price: 3000, discountedFee: 0, regularFee: 100, popular: true },
    { id: '365day', name: '365 Days', price: 25000, discountedFee: 0, regularFee: 100 }
  ];

  // Wallet stats - will be calculated based on actual blockchain data
  const [walletStats, setWalletStats] = useState({
    totalValue: "0 BASED",
    nftCount: 0,
    nftValue: "0 BASED",
    tokensValue: "0 BASED"
  });

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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      setOwnedNFTs([]); // Clear previous NFTs before fetching new ones
      setListingsItems([]);
      setFavoritesItems([]);
      
      // Reset wallet stats
      setWalletStats({
        totalValue: "0 BASED",
        nftCount: 0,
        nftValue: "0 BASED",
        tokensValue: "0 BASED"
      });
      
      async function fetchUserData() {
        if (!address) return;
        
        setLoading(true);
        try {
          console.log(`[ProfilePage] 🔍 Fetching user data for ${address}`);
          captureError({
            type: 'api',
            severity: 'low',
            message: `Starting profile data fetch for ${address}`,
            component: 'ProfilePage'
          });
          
          // Fetch wallet balance
          const walletBalanceData = await fetchWalletBalance(address);
          console.log(`[ProfilePage] Wallet balance:`, walletBalanceData);
          
          // Fetch NFTs with basic error handling
          const nfts = await fetchUserNFTs(address);
          console.log(`[ProfilePage] ✅ Found ${nfts.length} NFTs for user`);
          
          setOwnedNFTs(nfts);
          
          // Calculate wallet stats properly
          const nftCount = nfts.length;
          const tokenValue = parseFloat(walletBalanceData.formatted);
          const totalValue = tokenValue; // For now, just token value
          
          setWalletStats({
            totalValue: `${totalValue.toFixed(2)} BASED`,
            nftCount: nftCount,
            nftValue: "0 BASED", // TODO: Calculate from NFT prices
            tokensValue: `${walletBalanceData.formatted} BASED`
          });
          
          // Simple subscription check (disabled for now)
          setHasActiveSubscription(false);
          setSubscriptionTier(null);
          setSubscriptionExpiry(null);
          
          captureError({
            type: 'api',
            severity: 'low',
            message: `Successfully loaded profile data: ${nfts.length} NFTs, ${walletBalanceData.formatted} BASED`,
            component: 'ProfilePage',
            additionalData: { nftCount: nfts.length, balance: walletBalanceData.formatted }
          });
          
        } catch (error: any) {
          console.error(`[ProfilePage] ❌ Error fetching user data:`, error);
          captureError({
            type: 'api',
            severity: 'high',
            message: `Failed to fetch profile data: ${error.message}`,
            component: 'ProfilePage',
            additionalData: { userAddress: address, error: error.message }
          });
          
          setOwnedNFTs([]);
          setWalletStats({
            totalValue: "0 BASED",
            nftCount: 0,
            nftValue: "0 BASED",
            tokensValue: "0 BASED"
          });
        } finally {
          setLoading(false);
        }
      }
      
      fetchUserData();
    } else if (!isConnected) {
      // If not connected, clear data and set loading to false
      setOwnedNFTs([]);
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

  // Fetch activity data when activity tab is selected
  useEffect(() => {
    if (activeTab === 'activity' && isConnected && address) {
      const fetchActivity = async () => {
        try {
          console.log('ProfilePage: Fetching activity data for', address);
          const activity = await fetchUserActivity(address, 20); // Get 20 recent items
          console.log('ProfilePage: Fetched activity:', activity);
          setActivityItems(activity);
        } catch (error) {
          console.error('ProfilePage: Error fetching activity:', error);
          setActivityItems([]);
        }
      };
      
      fetchActivity();
    }
  }, [activeTab, address]);

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

  // Add error boundary for profile content
  try {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          {/* Basic info only */}
          <div className="flex-grow">
            <div className="flex items-start gap-3 mb-1.5">
              <div className="w-12 h-12 rounded-full bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-theme-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-text-primary break-all">
                  {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Anonymous'}
                </h1>
                <div className="px-2 py-0.5 bg-theme-primary/10 text-theme-primary text-xs rounded-full whitespace-nowrap inline-block mt-1">
                  Connected
                </div>
                <div className="flex items-center gap-2 text-theme-text-secondary text-xs mt-2">
                  {/* Settings button */}
                  <Link href="/settings" className="flex items-center gap-1 hover:text-theme-primary">
                    <Settings size={12} />
                    <span>Settings</span>
                  </Link>
                  <span className="text-theme-text-tertiary">|</span>
                  <button 
                    onClick={() => {navigator.clipboard.writeText(address || '')}} 
                    className="hover:text-theme-primary transition-colors truncate flex items-center gap-1"
                    title="Copy address to clipboard"
                  >
                    <Copy size={12} />
                    <span>{address}</span>
                  </button>
                  <span className="text-theme-text-tertiary">|</span>
                  <Link href={`https://explorer.bf1337.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-theme-primary">
                    <ExternalLink size={12} />
                    <span>Explorer</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Simple wallet stats */}
          <div className="bg-theme-surface border border-theme-border rounded-lg p-4">
            <h3 className="text-sm text-theme-text-secondary mb-1">Wallet Value</h3>
            <p className="text-lg font-bold text-theme-text-primary">{walletStats.totalValue}</p>
            <p className="text-sm text-theme-text-secondary">NFTs: {walletStats.nftCount}</p>
          </div>
        </div>
        
        {/* Simple tabs */}
        <div className="border-b border-theme-border mb-8">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'collected' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary'}`}
              onClick={() => setActiveTab('collected')}
            >
              <Wallet className="mr-2" size={16} />
              Collected ({ownedNFTs.length})
            </button>
            <button
              className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${activeTab === 'activity' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-text-secondary'}`}
              onClick={() => setActiveTab('activity')}
            >
              <Clock className="mr-2" size={16} />
              Activity
            </button>
          </div>
        </div>
        
        {/* Content Area - Simplified */}
        <div className="min-h-[300px]">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
            </div>
          )}
          
          {!loading && activeTab === 'collected' && ownedNFTs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-theme-text-secondary mb-6">You don't have any NFTs yet.</p>
              <Link href="/collection" className="px-6 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors">
                Browse Collections
              </Link>
            </div>
          )}
          
          {!loading && activeTab === 'collected' && ownedNFTs.length > 0 && (
            <div>
              <p className="text-sm text-theme-text-secondary mb-4">
                Showing {ownedNFTs.length} NFTs from marketplace collections
              </p>
              
              {/* Pagination calculation */}
              {(() => {
                const totalNFTs = ownedNFTs.length;
                const totalPages = Math.ceil(totalNFTs / itemsPerPage);
                const paginatedNFTs = ownedNFTs.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                );
                
                return (
                  <>
                    {/* NFT Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                      {paginatedNFTs.map((nft) => (
                        <Link 
                          key={`${nft.contractAddress}-${nft.tokenId}`}
                          href={`/nft/${nft.contractAddress}/${nft.tokenId}`}
                          className="group"
                        >
                          <div className="glass-card rounded-lg overflow-hidden border border-theme-border hover:border-theme-border-hover transition-colors">
                            <div className="aspect-square relative overflow-hidden bg-theme-surface">
                              {nft.image && !isImgurUrl(nft.image) ? (
                                <SafeImage 
                                  src={nft.image} 
                                  alt={nft.name || `NFT #${nft.tokenId}`} 
                                  className="object-cover w-full h-full"
                                  fill={true}
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-theme-surface to-theme-surface/50 flex items-center justify-center">
                                  <span className="text-theme-text-secondary">#{nft.tokenId}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="text-theme-text font-medium truncate">
                                {nft.name || `${nft.collection?.name || 'NFT'} #${nft.tokenId}`}
                              </h3>
                              <p className="text-theme-text-secondary text-sm truncate">
                                {nft.collection?.name || 'Unknown Collection'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-theme-text-secondary text-sm">
                          Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalNFTs)} of {totalNFTs} NFTs
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm bg-theme-surface border border-theme-border rounded-md hover:bg-theme-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-8 h-8 text-sm rounded-md transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-theme-primary text-white'
                                      : 'bg-theme-surface border border-theme-border hover:bg-theme-surface-hover'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm bg-theme-surface border border-theme-border rounded-md hover:bg-theme-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          
          {!loading && activeTab === 'activity' && (
            <div>
              {activityItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left border-b border-theme-border">
                      <tr>
                        <th className="py-3 pr-4 text-theme-text-secondary font-medium text-sm">Event</th>
                        <th className="py-3 px-4 text-theme-text-secondary font-medium text-sm">Item</th>
                        <th className="py-3 px-4 text-theme-text-secondary font-medium text-sm">Price</th>
                        <th className="py-3 pl-4 text-theme-text-secondary font-medium text-sm">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {activityItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 pr-4">
                            <span className={`inline-block text-sm ${
                              item.type === 'Purchase' ? 'text-green-500' :
                              item.type === 'Sale' ? 'text-blue-500' :
                              item.type === 'Transfer' ? 'text-purple-500' :
                              'text-theme-text-primary'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-theme-surface">
                                <div 
                                  className="w-full h-full bg-cover bg-center"
                                  style={{ backgroundImage: `url(${item.collection?.logo || '/placeholder-nft.png'})` }}
                                />
                              </div>
                              <span className="text-theme-text-primary">{item.item}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-theme-text-primary">{item.price} BASED</td>
                          <td className="py-3 pl-4 text-theme-text-secondary text-sm">
                            {item.date ? formatDate(item.date) : 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                  <p className="text-theme-text-secondary">Activity data will appear here when available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Profile page error:', error);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-theme-text-secondary mb-8">Please refresh the page and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-theme-primary text-black font-medium rounded-lg hover:bg-theme-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
} 