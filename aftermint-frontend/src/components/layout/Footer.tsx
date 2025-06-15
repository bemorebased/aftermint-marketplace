"use client";

import React, { useState, useEffect } from 'react';
import ThemeSwitcher from '../ThemeSwitcher';
import { Twitter, Send, ExternalLink, TrendingUp, Bitcoin as BitcoinIcon, Droplets } from 'lucide-react';

// Helper for formatting prices
const formatPrice = (price: number | undefined) => {
  if (price === undefined) return 'N/A';
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

interface CoinPrice {
  usd: number;
}

interface CoinGeckoResponse {
  bitcoin: CoinPrice;
  ethereum: CoinPrice;
  'pepecoin-2': CoinPrice;
  basedai: CoinPrice;
}

const Footer = () => {
  const [prices, setPrices] = useState<Partial<CoinGeckoResponse>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Use local API route instead of directly calling CoinGecko to avoid CORS
        const response = await fetch('/api/prices');
        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.status}`);
        }
        const data: CoinGeckoResponse = await response.json();
        setPrices(data);
      } catch (error) {
        console.error("Error fetching CoinGecko prices:", error);
        // Set all to undefined on error so they show N/A
        setPrices({ bitcoin: undefined, ethereum: undefined, 'pepecoin-2': undefined, basedai: undefined });
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 300000); // Refresh prices every 5 minutes to avoid rate limits

    return () => clearInterval(interval);
  }, []);

  const PriceDisplay: React.FC<{ name: string; price: number | undefined; icon?: React.ReactNode }> = ({ name, price, icon }) => (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      {icon && <span className="text-theme-text-secondary">{icon}</span>}
      <span className="text-theme-text-primary">{name}:</span>
      <span className="font-medium text-theme-secondary">{formatPrice(price)}</span>
    </div>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-theme-surface/90 backdrop-blur-md border-t border-theme-border shadow-lg z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left side: Price Tickers */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
          <PriceDisplay name="OG Memecoin" price={prices.bitcoin?.usd} icon={<img src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" alt="BTC" className="w-4 h-4" />} />
          <PriceDisplay name="AltCoin" price={prices.ethereum?.usd} icon={<img src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628" alt="ETH" className="w-4 h-4" />} />
          <PriceDisplay name="RareCoin" price={prices['pepecoin-2']?.usd} icon={<img src="https://assets.coingecko.com/coins/images/30219/standard/pepecoin-icon_200x200.png?1735790725" alt="PEPE" className="w-4 h-4" />} /> 
          <PriceDisplay name="BasedAI" price={prices.basedai?.usd} icon={<img src="https://assets.coingecko.com/coins/images/36607/standard/1000004475.png?1711964332" alt="BASED" className="w-4 h-4" />} />
        </div>

        {/* Right side: Social Links then ThemeSwitcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a 
            href="https://x.com/BasedUnleashed" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Follow on X"
            className="text-theme-text-secondary hover:text-theme-primary transition-colors"
          >
            <Twitter size={20} />
          </a>
          <a 
            href="https://t.me/lifenodes" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Join Telegram"
            className="text-theme-text-secondary hover:text-theme-primary transition-colors"
          >
            <Send size={20} />
          </a>
          <span className="text-theme-border text-xl font-light hidden sm:inline">|</span>
          <ThemeSwitcher /> 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
