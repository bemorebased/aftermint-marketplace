'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bitcoin,
  DollarSign, 
  Leaf,       
  Cpu,        
  Twitter,
  Send,
  Eye,
  GalleryThumbnails,
} from 'lucide-react';

interface Coin {
  id: string; // CoinGecko ID
  name: string;
  icon: React.ReactNode; // Changed to React.ReactNode to allow <img>
  price?: string;
}

// Updated with correct CoinGecko IDs and image URLs
const initialCoinData: Coin[] = [
  { id: 'bitcoin', name: 'Bitcoin', icon: <img src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" alt="Bitcoin" width={16} height={16} /> },
  { id: 'ethereum', name: 'Ethereum', icon: <img src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628" alt="Ethereum" width={16} height={16} /> }, 
  { id: 'pepecoin-2', name: 'Pepecoin', icon: <img src="https://assets.coingecko.com/coins/images/30219/standard/pepecoin-icon_200x200.png?1735790725" alt="Pepecoin" width={16} height={16} /> }, 
  { id: 'basedai', name: 'BasedAI', icon: <img src="https://assets.coingecko.com/coins/images/36607/standard/1000004475.png?1711964332" alt="BasedAI" width={16} height={16} /> }, 
];

const Footer = () => {
  const [coinData, setCoinData] = useState<Coin[]>(initialCoinData);
  const [isTraderView, setIsTraderView] = React.useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      const ids = initialCoinData.map(coin => coin.id).join(',');
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        if (!response.ok) {
          console.warn(`Failed to fetch prices from CoinGecko. Status: ${response.status}`);
          // Set all to N/A if the overall request fails, or handle per coin if API supports partial success
          setCoinData(prevData => prevData.map(c => ({ ...c, price: 'N/A' })));
          return;
        }
        const data = await response.json();
        
        setCoinData(prevData => 
          prevData.map(coin => ({
            ...coin,
            price: data[coin.id] ? `$${data[coin.id].usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'
          }))
        );
      } catch (error) {
        console.error("Error fetching CoinGecko prices:", error);
        setCoinData(prevData => prevData.map(c => ({ ...c, price: 'N/A' })));
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className="z-50 bg-theme-surface border-t border-theme-border p-2 sm:p-3 text-theme-text-secondary">
      <div className="container mx-auto flex items-center justify-between text-xs">
        {/* Coin Prices - ensure it doesn't overflow on small screens */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto whitespace-nowrap">
          {coinData.map((coin) => (
            <div key={coin.id} className="flex items-center cursor-default p-1" title={`${coin.name}: ${coin.price || 'N/A'}`}>
              {coin.icon}
              <span className="ml-1">{coin.price || 'N/A'}</span> 
            </div>
          ))}
        </div>
        {/* View Switch and Social Links */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
          <button
            onClick={() => setIsTraderView(!isTraderView)} 
            className="p-1.5 hover:bg-theme-border rounded-md transition-colors"
            title={isTraderView ? 'Switch to Based View' : 'Switch to Trader View'}
          >
            {isTraderView ? <GalleryThumbnails size={18} /> : <Eye size={18} />}
          </button>
          <Link href="https://x.com/BasedUnleashed" target="_blank" rel="noopener noreferrer" className="hover:text-theme-text-primary">
            <Twitter size={18} />
          </Link>
          <Link href="https://t.me/lifenodes" target="_blank" rel="noopener noreferrer" className="hover:text-theme-text-primary">
            <Send size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 