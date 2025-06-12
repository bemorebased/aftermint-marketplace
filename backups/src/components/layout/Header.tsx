"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeSwitcher from '../ThemeSwitcher';
import Notifications from '../Notifications';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-theme-surface/80 backdrop-blur-md border-b border-theme-border/50 px-4">
      <div className="container mx-auto flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-theme-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-theme-text-primary">AfterMint</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/marketplace" className="text-theme-text-secondary hover:text-theme-text-primary transition">
            Marketplace
          </Link>
          <Link href="/collections" className="text-theme-text-secondary hover:text-theme-text-primary transition">
            Collections
          </Link>
          <Link href="/activity" className="text-theme-text-secondary hover:text-theme-text-primary transition">
            Activity
          </Link>
          <Link href="/subscription" className="text-theme-text-secondary hover:text-theme-text-primary transition">
            Subscribe
          </Link>
        </nav>
        
        {/* Action Items */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Notifications />
          <div className="hidden md:block">
            <CustomConnectButton />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-1 text-theme-text-secondary hover:text-theme-text-primary" 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-theme-surface border-t border-theme-border/50 absolute left-0 right-0 top-16 shadow-xl">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/marketplace" 
              className="text-theme-text-secondary hover:text-theme-text-primary transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="/collections" 
              className="text-theme-text-secondary hover:text-theme-text-primary transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              href="/activity" 
              className="text-theme-text-secondary hover:text-theme-text-primary transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Activity
            </Link>
            <Link 
              href="/subscription" 
              className="text-theme-text-secondary hover:text-theme-text-primary transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Subscribe
            </Link>
            <div className="pt-2">
              <CustomConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 