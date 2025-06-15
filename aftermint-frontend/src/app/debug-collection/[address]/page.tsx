"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Minimal ERC721 ABI
const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)'
];

// Simple ABI just to check token listings
const MARKETPLACE_ABI = [
  'function getListing(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, uint64 listedAt, uint64 expiresAt, address privateBuyer, address paymentToken))'
];

export default function DebugCollectionPage({ params }: { params: Promise<{ address: string }> }) {
  const [collection, setCollection] = useState({ name: '', symbol: '' });
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [address, setAddress] = useState<string>('');
  
  // Resolve params Promise
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setAddress(resolved.address);
    }
    resolveParams();
  }, [params]);
  
  useEffect(() => {
    if (!address) return;
    
    async function fetchNFTs() {
      try {
        setLoading(true);
        setError('');
        
        console.log(`Fetching data for collection: ${address}`);
        
        // Use BasedAI RPC URL only
        const provider = new ethers.JsonRpcProvider('https://mainnet.basedaibridge.com/rpc/');
        
        // Get the NFT contract
        const nftContract = new ethers.Contract(address, ERC721_ABI, provider);
        
        // Hardcode the marketplace address
        const marketplaceAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
        const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, provider);
        
        // Fetch collection info
        try {
          const name = await nftContract.name();
          const symbol = await nftContract.symbol();
          setCollection({ name, symbol });
        } catch (e) {
          console.error('Error fetching collection info:', e);
          setCollection({ 
            name: `Collection ${address.substring(0, 6)}...`,
            symbol: 'NFT' 
          });
        }
        
        // Check first 10 tokens
        const nftData = [];
        for (let i = 0; i < 10; i++) {
          try {
            // Check if token exists by querying ownerOf
            const owner = await nftContract.ownerOf(i);
            
            // Get token URI
            const tokenURI = await nftContract.tokenURI(i);
            
            // Check if token is listed
            let listingInfo = { isListed: false, price: '0' };
            try {
              const listing = await marketplace.getListing(address, i);
              if (listing && listing.seller !== ethers.ZeroAddress) {
                listingInfo = {
                  isListed: true,
                  price: ethers.formatEther(listing.price)
                };
              }
            } catch (listingError) {
              console.error(`Error checking listing for token ${i}:`, listingError);
            }
            
            // Fetch metadata
            let metadata = { name: `Token #${i}`, image: '', attributes: [] };
            try {
              const response = await fetch(tokenURI);
              if (response.ok) {
                metadata = await response.json();
              } else {
                console.error(`Error fetching metadata for token ${i}: ${response.status}`);
              }
            } catch (metadataError) {
              console.error(`Error fetching metadata for token ${i}:`, metadataError);
            }
            
            nftData.push({
              id: i,
              owner,
              tokenURI,
              metadata,
              listing: listingInfo
            });
          } catch (tokenError) {
            // Token doesn't exist or can't be fetched
            console.log(`Token #${i} doesn't exist or error:`, tokenError);
          }
        }
        
        setNfts(nftData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching collection data:', err);
        setError(err.message || 'Error fetching NFTs');
        setLoading(false);
      }
    }
    
    fetchNFTs();
  }, [address]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Collection Page</h1>
      
      {loading ? (
        <div className="flex justify-center">Loading collection data...</div>
      ) : error ? (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="bg-gray-800 p-4 rounded-md mb-6">
            <h2 className="text-xl font-semibold">{collection.name} ({collection.symbol})</h2>
            <p className="text-sm opacity-80">Contract: {address}</p>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Available NFTs: {nfts.length}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map(nft => (
              <div key={nft.id} className="border border-gray-700 rounded-md overflow-hidden">
                <div className="aspect-square relative bg-gray-900">
                  {nft.metadata.image ? (
                    <Image 
                      src={nft.metadata.image} 
                      alt={nft.metadata.name || `NFT #${nft.id}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-800">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium">{nft.metadata.name || `NFT #${nft.id}`}</h3>
                  
                  <div className="text-sm opacity-70 mt-1">
                    Token ID: {nft.id}
                  </div>
                  
                  {nft.listing.isListed && (
                    <div className="mt-2 inline-block bg-blue-600 text-white px-2 py-1 rounded-md text-sm">
                      Price: {nft.listing.price} ETH/BASED
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs truncate">
                    <span className="opacity-70">Owner: </span>
                    <span className="font-mono">{nft.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {nfts.length === 0 && (
            <div className="text-center p-8 bg-gray-800 rounded-md">
              No NFTs found for this collection. Make sure you've minted some tokens.
            </div>
          )}
        </>
      )}
    </div>
  );
} 