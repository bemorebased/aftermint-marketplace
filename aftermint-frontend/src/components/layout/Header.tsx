"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Search } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { basedCollections } from '@/data/collections';

// Transform collections data for search suggestions
const searchableCollections = basedCollections.map(collection => ({
  name: collection.name,
  address: collection.id,
  logo: collection.logoUrl
}));

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState<typeof searchableCollections>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useAccount();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/collection' },
    { name: 'Create', href: '/create' },
  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter collections when search query changes
  useEffect(() => {
    if (searchQuery) {
      const lcSearch = searchQuery.toLowerCase();
      const filtered = searchableCollections.filter(
        collection => collection.name.toLowerCase().includes(lcSearch)
      );
      setFilteredCollections(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredCollections([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const isActivePath = (path: string) => {
    if (!pathname) return false; // Handle null pathname
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // First try to find a collection that matches the search
      const lcSearch = searchQuery.toLowerCase();
      const matchedCollection = searchableCollections.find(
        collection => collection.name.toLowerCase().includes(lcSearch)
      );
      
      if (matchedCollection) {
        router.push(`/collection/${matchedCollection.address}`);
      } else {
        // If no specific collection match, go to the general collection search
        router.push(`/collection?search=${encodeURIComponent(searchQuery)}`);
      }
      
      // Clear the search and hide suggestions after navigating
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSelectCollection = (address: string) => {
    router.push(`/collection/${address}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as unknown as React.FormEvent);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions && filteredCollections.length > 0) {
      // This would normally handle keyboard navigation but we'll keep it simple
      document.querySelector('.search-suggestion')?.classList.add('highlighted');
    }
  };

  return (
    <header className="w-full border-b border-theme-border sticky top-0 z-50 bg-theme-background/80 backdrop-blur-lg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/am2.png" alt="AfterMint Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-theme-text-primary hidden sm:inline">AfterMint</span>
            </Link>
            
            {/* Desktop Navigation - Modified for better spacing */}
            <nav className="hidden md:ml-10 md:flex items-center md:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isActivePath(item.href)
                      ? 'text-theme-primary'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Search & Actions */}
          <div className="flex items-center gap-x-3 sm:gap-x-4">
            {/* Search Bar styled like homepage */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-theme-surface/60 border border-theme-border px-3 py-1.5 rounded-lg w-32 sm:w-48 md:w-64">
                  <Search size={16} className="text-theme-text-secondary mr-2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchQuery && setShowSuggestions(filteredCollections.length > 0)}
                    placeholder="Search collections..."
                    className="bg-transparent text-sm text-theme-text-primary focus:outline-none w-full placeholder-theme-text-secondary/70"
                  />
                  <button 
                    type="submit" 
                    className="ml-2 px-1.5 py-0.5 text-xs text-theme-text-secondary/70 border border-theme-border rounded hover:bg-theme-card-highlight"
                  >
                    /
                  </button>
                </div>
              </form>
              
              {/* Search suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute z-50 mt-1 w-full bg-theme-surface border border-theme-border rounded-lg shadow-lg overflow-hidden">
                  {filteredCollections.map((collection) => (
                    <div 
                      key={collection.address}
                      onClick={() => handleSelectCollection(collection.address)}
                      className="search-suggestion flex items-center gap-2 p-2 hover:bg-theme-card-highlight cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-theme-card-highlight flex-shrink-0">
                        <img src={collection.logo} alt={collection.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm text-theme-text-primary font-medium">{collection.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Custom Connect Button with chain toggle */}
            <ConnectButton />
            
            {/* Profile Icon */}
            {isConnected && (
              <Link href="/profile" className="p-2 rounded-md text-theme-text-secondary hover:text-theme-text-primary">
                <User size={20} />
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-theme-text-secondary hover:text-theme-text-primary focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-theme-border">
            {/* Mobile Search */}
            <div className="relative">
              <form onSubmit={handleSearch} className="w-full mb-2">
                <div className="flex items-center bg-theme-surface/60 border border-theme-border px-3 py-2 rounded-lg w-full">
                  <Search size={16} className="text-theme-text-secondary mr-2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchQuery && setShowSuggestions(filteredCollections.length > 0)}
                    placeholder="Search collections..."
                    className="bg-transparent text-sm text-theme-text-primary focus:outline-none w-full placeholder-theme-text-secondary/70"
                  />
                  <button 
                    type="submit" 
                    className="ml-2 px-1.5 py-0.5 text-xs text-theme-text-secondary/70 border border-theme-border rounded hover:bg-theme-card-highlight"
                  >
                    /
                  </button>
                </div>
              </form>
              
              {/* Mobile search suggestions */}
              {showSuggestions && (
                <div className="absolute z-50 left-0 right-0 bg-theme-surface border border-theme-border rounded-lg shadow-lg overflow-hidden">
                  {filteredCollections.map((collection) => (
                    <div 
                      key={collection.address}
                      onClick={() => handleSelectCollection(collection.address)}
                      className="search-suggestion flex items-center gap-2 p-2 hover:bg-theme-card-highlight cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-theme-card-highlight flex-shrink-0">
                        <img src={collection.logo} alt={collection.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm text-theme-text-primary font-medium">{collection.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(item.href)
                    ? 'bg-theme-primary/10 text-theme-primary'
                    : 'text-theme-text-secondary hover:bg-theme-card-highlight hover:text-theme-text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-theme-border">
              <div className="mt-2 flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;