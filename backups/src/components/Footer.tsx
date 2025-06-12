'use client';

import Link from 'next/link';
import {
  Bitcoin,
  Coins, // Generic for Ethereum/BasedAI if specific not found easily, or use custom SVGs later
  Twitter, // Lucide uses 'Twitter' for X
  Send,    // Lucide uses 'Send' for Telegram
  // Replace with actual icons if you have specific SVGs for Pepecoin/BasedAI
  // For now, using Coins for them.
  Image as ImageIcon, // Placeholder for coin icons
  Eye, // For Trader view
  GalleryThumbnails, // For Based view
} from 'lucide-react';
import React from 'react';

// TODO: Fetch actual prices from CoinGecko
const coinData = [
  { name: 'Bitcoin', icon: <Bitcoin size={18} />, price: 'N/A' },
  { name: 'Ethereum', icon: <Coins size={18} />, price: 'N/A' }, // Replace with Ethereum icon later
  { name: 'Pepecoin', icon: <ImageIcon size={18} />, price: 'N/A' }, // Replace with Pepe icon later
  { name: 'BasedAI', icon: <ImageIcon size={18} />, price: 'N/A' }, // Replace with BasedAI icon later
];

const Footer = () => {
  // TODO: Implement view state (e.g., using Zustand)
  const [isTraderView, setIsTraderView] = React.useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-theme-surface border-t border-theme-border p-2 sm:p-3 text-theme-text-secondary">
      <div className="container mx-auto flex items-center justify-between text-xs sm:text-sm">
        {/* Coin Prices */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {coinData.map((coin) => (
            <div key={coin.name} className="flex items-center" title={`${coin.name}: ${coin.price}`}>
              {coin.icon}
              {/* <span className="ml-1 hidden sm:inline">{coin.price}</span> */}
            </div>
          ))}
        </div>

        {/* View Switch and Social Links */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Based/Trader View Switch */}
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