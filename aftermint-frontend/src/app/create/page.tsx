"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

type NFTToList = {
  id: number;
  tokenId: number;
  name: string;
  image: string;
  collection: {
    name: string;
    contract: string;
  };
  selected: boolean;
  price: string;
};

export default function CreateListingPage() {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<NFTToList[]>([]);
  const [step, setStep] = useState<'select' | 'price' | 'review' | 'confirm'>('select');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load NFTs owned by the user
  useEffect(() => {
    setLoading(true);
    
    // Simulate loading NFTs from API
    setTimeout(() => {
      // Generate mock NFTs
      const mockCollections = [
        { name: "LifeNodes", contract: "0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21" },
        { name: "KEKTECH", contract: "0x40b6184b901334c0a88f528c1a0a1de7a77490f1" },
        { name: "Dank Pepes", contract: "0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d" },
      ];
      
      const mockNfts = Array.from({ length: 10 }, (_, i) => {
        const collection = mockCollections[i % mockCollections.length];
        return {
          id: i + 1,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          name: `${collection.name} #${Math.floor(Math.random() * 10000) + 1}`,
          image: `https://picsum.photos/seed/nft${i}/500/500`,
          collection,
          selected: false,
          price: '',
        };
      });
      
      setNfts(mockNfts);
      setLoading(false);
    }, 1000);
  }, []);
  
  const selectedNfts = nfts.filter(nft => nft.selected);
  
  // Toggle selection of an NFT
  const toggleNftSelection = (id: number) => {
    setNfts(prevNfts => 
      prevNfts.map(nft => 
        nft.id === id ? { ...nft, selected: !nft.selected } : nft
      )
    );
  };
  
  // Set price for an NFT
  const setNftPrice = (id: number, price: string) => {
    // Validate price to accept only numbers and decimal points
    if (price === '' || /^\d*\.?\d*$/.test(price)) {
      setNfts(prevNfts => 
        prevNfts.map(nft => 
          nft.id === id ? { ...nft, price } : nft
        )
      );
    }
  };
  
  // Apply bulk price to all selected NFTs
  const applyBulkPrice = () => {
    if (bulkPrice && /^\d*\.?\d*$/.test(bulkPrice)) {
      setNfts(prevNfts => 
        prevNfts.map(nft => 
          nft.selected ? { ...nft, price: bulkPrice } : nft
        )
      );
    }
  };
  
  // Select all NFTs
  const selectAll = () => {
    setNfts(prevNfts => 
      prevNfts.map(nft => ({ ...nft, selected: true }))
    );
  };
  
  // Deselect all NFTs
  const deselectAll = () => {
    setNfts(prevNfts => 
      prevNfts.map(nft => ({ ...nft, selected: false }))
    );
  };
  
  // Validate if all selected NFTs have valid prices
  const validatePrices = () => {
    const invalidNfts = selectedNfts.filter(nft => !nft.price || isNaN(parseFloat(nft.price)) || parseFloat(nft.price) <= 0);
    
    if (invalidNfts.length > 0) {
      setErrorMessage(`${invalidNfts.length} NFT(s) have invalid prices. Please enter a valid price for all selected NFTs.`);
      return false;
    }
    
    setErrorMessage('');
    return true;
  };
  
  // Move to the next step
  const nextStep = () => {
    if (step === 'select') {
      if (selectedNfts.length === 0) {
        setErrorMessage('Please select at least one NFT to list.');
        return;
      }
      setStep('price');
      setErrorMessage('');
    } else if (step === 'price') {
      if (!validatePrices()) {
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      // Simulate API call to create listings
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('confirm');
        setSuccessMessage(`Successfully created ${selectedNfts.length} listing(s)!`);
      }, 1500);
    }
  };
  
  // Move to the previous step
  const prevStep = () => {
    if (step === 'price') {
      setStep('select');
    } else if (step === 'review') {
      setStep('price');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Listings</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step === 'select' ? 'text-theme-primary' : (step === 'price' || step === 'review' || step === 'confirm') ? 'text-theme-primary' : 'text-theme-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'select' ? 'bg-theme-primary text-black' : (step === 'price' || step === 'review' || step === 'confirm') ? 'bg-theme-primary/20 text-theme-primary' : 'bg-theme-card-highlight text-theme-text-secondary'}`}>
                1
              </div>
              <span className="text-sm">Select NFTs</span>
            </div>
            <div className="flex-grow border-t border-theme-border mx-4 relative top-[-14px]"></div>
            <div className={`flex flex-col items-center ${step === 'price' ? 'text-theme-primary' : (step === 'review' || step === 'confirm') ? 'text-theme-primary' : 'text-theme-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'price' ? 'bg-theme-primary text-black' : (step === 'review' || step === 'confirm') ? 'bg-theme-primary/20 text-theme-primary' : 'bg-theme-card-highlight text-theme-text-secondary'}`}>
                2
              </div>
              <span className="text-sm">Set Prices</span>
            </div>
            <div className="flex-grow border-t border-theme-border mx-4 relative top-[-14px]"></div>
            <div className={`flex flex-col items-center ${step === 'review' ? 'text-theme-primary' : step === 'confirm' ? 'text-theme-primary' : 'text-theme-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'review' ? 'bg-theme-primary text-black' : step === 'confirm' ? 'bg-theme-primary/20 text-theme-primary' : 'bg-theme-card-highlight text-theme-text-secondary'}`}>
                3
              </div>
              <span className="text-sm">Review</span>
            </div>
            <div className="flex-grow border-t border-theme-border mx-4 relative top-[-14px]"></div>
            <div className={`flex flex-col items-center ${step === 'confirm' ? 'text-theme-primary' : 'text-theme-text-secondary'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'confirm' ? 'bg-theme-primary text-black' : 'bg-theme-card-highlight text-theme-text-secondary'}`}>
                4
              </div>
              <span className="text-sm">Confirm</span>
            </div>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500">{errorMessage}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-500">{successMessage}</p>
          </div>
        )}
        
        {/* Step 1: Select NFTs */}
        {step === 'select' && (
          <div>
            <div className="glass-card border border-theme-border rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your NFTs</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAll} 
                    className="px-3 py-1 bg-theme-surface border border-theme-border rounded-lg text-sm hover:bg-theme-card-highlight transition-colors"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={deselectAll} 
                    className="px-3 py-1 bg-theme-surface border border-theme-border rounded-lg text-sm hover:bg-theme-card-highlight transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-theme-card-highlight rounded-xl mb-2"></div>
                      <div className="h-4 bg-theme-card-highlight rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-theme-card-highlight rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-theme-text-secondary mb-4">You don't have any NFTs to list</p>
                  <Link 
                    href="/collection"
                    className="px-4 py-2 bg-theme-primary text-black rounded-lg hover:bg-theme-primary/90 transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {nfts.map(nft => (
                    <div 
                      key={nft.id} 
                      className={`glass-card rounded-xl overflow-hidden border-2 ${nft.selected ? 'border-theme-primary' : 'border-theme-border'} cursor-pointer transition-all`}
                      onClick={() => toggleNftSelection(nft.id)}
                    >
                      <div className="aspect-square relative">
                        <div 
                          className="w-full h-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${nft.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        {nft.selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-theme-primary flex items-center justify-center">
                            <CheckCircle size={16} className="text-black" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <p className="font-medium truncate">{nft.name}</p>
                        <p className="text-xs text-theme-text-secondary">{nft.collection.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 2: Set Prices */}
        {step === 'price' && (
          <div>
            <div className="glass-card border border-theme-border rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Set Listing Prices</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Bulk Mode</label>
                  <div 
                    className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${bulkMode ? 'bg-theme-primary' : 'bg-theme-text-secondary/30'}`}
                    onClick={() => setBulkMode(!bulkMode)}
                  >
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all ${bulkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
              
              {bulkMode && (
                <div className="mb-6 bg-theme-card-highlight rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="text-sm font-medium">Price for all selected NFTs:</label>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        className="px-3 py-2 rounded-lg border border-theme-border bg-theme-surface w-full sm:w-32"
                      />
                      <span>BASED</span>
                    </div>
                    <button 
                      onClick={applyBulkPrice}
                      className="px-4 py-2 bg-theme-primary text-black rounded-lg hover:bg-theme-primary/90 transition-colors"
                      disabled={!bulkPrice || isNaN(parseFloat(bulkPrice))}
                    >
                      Apply to All
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium">Expiration:</label>
                  <select 
                    value={expiryDays} 
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-theme-border bg-theme-surface"
                  >
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-theme-surface border border-theme-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-theme-background">
                    <tr className="border-b border-theme-border">
                      <th className="px-4 py-3 text-left text-sm font-medium">NFT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Collection</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Price (BASED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNfts.map(nft => (
                      <tr key={nft.id} className="border-b border-theme-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              <div 
                                className="w-full h-full bg-cover bg-center" 
                                style={{ 
                                  backgroundImage: `url(${nft.image})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            </div>
                            <span>{nft.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-theme-text-secondary">{nft.collection.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <input
                              type="text"
                              value={nft.price}
                              onChange={(e) => setNftPrice(nft.id, e.target.value)}
                              placeholder="0.00"
                              className="px-3 py-2 rounded-lg border border-theme-border bg-theme-surface w-24 text-right"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Review */}
        {step === 'review' && (
          <div>
            <div className="glass-card border border-theme-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Review Listings</h2>
              
              <div className="bg-theme-card-highlight rounded-lg p-4 mb-6 flex items-start gap-3">
                <Info className="text-theme-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-theme-text-primary mb-1">You are about to list {selectedNfts.length} NFT(s) for sale.</p>
                  <p className="text-theme-text-secondary text-sm">Please review the details below before confirming.</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Expiration</p>
                <p>{expiryDays} days</p>
              </div>
              
              <div className="bg-theme-surface border border-theme-border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-theme-background">
                    <tr className="border-b border-theme-border">
                      <th className="px-4 py-3 text-left text-sm font-medium">NFT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Collection</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Price (BASED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNfts.map(nft => (
                      <tr key={nft.id} className="border-b border-theme-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              <div 
                                className="w-full h-full bg-cover bg-center" 
                                style={{ 
                                  backgroundImage: `url(${nft.image})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            </div>
                            <span>{nft.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-theme-text-secondary">{nft.collection.name}</td>
                        <td className="px-4 py-3 text-right">{nft.price} BASED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-theme-card-highlight rounded-lg p-4 flex items-center gap-3">
                <div className="p-2 bg-theme-primary/20 rounded-full">
                  <Info size={16} className="text-theme-primary" />
                </div>
                <p className="text-sm text-theme-text-secondary">
                  Marketplace fee: {parseFloat(expiryDays) > 0 ? '1%' : '0.5%'} of sale price
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div className="glass-card border border-theme-border rounded-xl p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Listings Created Successfully!</h2>
            <p className="text-theme-text-secondary mb-6">
              You have successfully listed {selectedNfts.length} NFT(s) for sale on AfterMint.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/profile/me" 
                className="px-6 py-3 bg-theme-primary text-black font-bold rounded-lg hover:bg-theme-primary/90 transition-colors"
              >
                View My Listings
              </Link>
              
              <Link 
                href="/collection" 
                className="px-6 py-3 bg-theme-surface border border-theme-border text-theme-text-primary font-bold rounded-lg hover:bg-theme-card-highlight transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        {step !== 'confirm' && (
          <div className="flex justify-between">
            {step !== 'select' ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-card-highlight transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              onClick={nextStep}
              disabled={loading || (step === 'select' && selectedNfts.length === 0)}
              className={`px-6 py-3 bg-theme-primary text-black rounded-lg hover:bg-theme-primary/90 transition-colors ${(loading || (step === 'select' && selectedNfts.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : step === 'review' ? 'Create Listings' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 