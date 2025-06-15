"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Contrast, Trash2, Eye, SlidersHorizontal, ShieldCheck, CreditCard, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';

// Mock subscription data - replace with actual data fetching later
interface UserSubscription {
  tierName: string;
  expiresAt: string; // ISO date string or human-readable
  feeBps: number;
  isActive: boolean;
}

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [viewMode, setViewMode] = useState<'collector' | 'trader'>('collector');
  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedViewMode = localStorage.getItem('defaultViewMode') as 'collector' | 'trader';
    if (storedViewMode) {
      setViewMode(storedViewMode);
    }
    // Mock fetching subscription status
    // In a real app, you'd fetch this from your backend based on the connected user
    const mockSub: UserSubscription = {
      tierName: 'Gold Tier',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Expires in 30 days
      feeBps: 0,
      isActive: true,
    };
    // To simulate a user without a subscription, set to null or isActive: false
    // setSubscription(null);
    setSubscription(mockSub); 

  }, []);

  const handleViewModeChange = (mode: 'collector' | 'trader') => {
    setViewMode(mode);
    if (mounted) {
      localStorage.setItem('defaultViewMode', mode);
    }
  };

  const handleClearSettings = () => {
    if (mounted) {
      localStorage.removeItem('theme');
      localStorage.removeItem('defaultViewMode');
      // Reset to defaults
      setTheme('dark'); // Or your absolute default theme
      setViewMode('collector');
      alert('Cached settings cleared!');
    }
  };

  if (!mounted) {
    return <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-3xl animate-pulse"><div className="h-10 bg-theme-surface rounded w-1/2 mb-8"></div><div className="h-40 bg-theme-surface rounded-xl mb-10"></div><div className="h-40 bg-theme-surface rounded-xl mb-10"></div><div className="h-40 bg-theme-surface rounded-xl"></div></div>; // Basic skeleton loader
  }

  const themeOptions = [
    { name: 'Dark', value: 'dark', icon: <Moon className="w-4 h-4 mr-2" /> },
    { name: 'Kek', value: 'kek', icon: <Contrast className="w-4 h-4 mr-2" /> },
    { name: 'Based', value: 'based', icon: <Sun className="w-4 h-4 mr-2" /> },
  ];

  const viewModeOptions = [
    { name: 'Collector View', value: 'collector', icon: <Eye className="w-4 h-4 mr-2" /> },
    { name: 'Trader View', value: 'trader', icon: <SlidersHorizontal className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <SlidersHorizontal className="w-7 h-7 text-theme-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-theme-text-primary">Settings</h1>
      </div>

      {/* Theme Settings */}
      <div className="mb-6 p-5 bg-theme-surface rounded-lg border border-theme-border shadow-md">
        <h2 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Appearance</h2>
        <div className="space-y-3 pt-2">
          <p className="text-xs text-theme-text-secondary">Select your preferred theme:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as 'dark' | 'kek' | 'based')}
                className={`flex items-center justify-center p-3 rounded-md border-2 transition-all duration-200 text-sm 
                            ${theme === option.value 
                              ? 'border-theme-primary bg-theme-primary/10 text-theme-primary scale-105 shadow-sm'
                              : 'border-theme-border hover:border-theme-primary/70 hover:bg-theme-surface'}`}
              >
                {option.icon}
                <span className="font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* General Preferences */}
      <div className="mb-6 p-5 bg-theme-surface rounded-lg border border-theme-border shadow-md">
        <h2 className="text-lg font-semibold text-theme-text-primary mb-3 border-b border-theme-border pb-2">Preferences</h2>
        <div className="space-y-3 pt-2">
          <p className="text-xs text-theme-text-secondary">Default Homepage View:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {viewModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleViewModeChange(option.value as 'collector' | 'trader')}
                className={`flex items-center justify-center p-3 rounded-md border-2 transition-all duration-200 text-sm 
                            ${viewMode === option.value 
                              ? 'border-theme-primary bg-theme-primary/10 text-theme-primary scale-105 shadow-sm'
                              : 'border-theme-border hover:border-theme-primary/70 hover:bg-theme-surface'}`}
              >
                {option.icon}
                <span className="font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-6 p-5 bg-theme-surface rounded-lg border border-theme-border shadow-md">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-theme-border">
            <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-theme-primary mr-2" />
                <h2 className="text-lg font-semibold text-theme-text-primary">Subscription Status</h2>
            </div>
            <Link href="/subscription" passHref>
                <button
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-theme-primary hover:bg-theme-primary-hover text-theme-on_primary font-medium rounded-md transition-colors duration-200 border border-theme-primary-hover shadow-sm hover:shadow-md text-xs"
                >
                <CreditCard className="w-3 h-3" />
                {subscription && subscription.isActive ? 'Manage' : 'View Plans'}
                </button>
            </Link>
        </div>
        <div className="pt-1 text-sm space-y-1">
          {subscription && subscription.isActive ? (
            <>
              <p className="text-theme-text-primary">
                Status: <span className="font-semibold text-green-400">Active - {subscription.tierName}</span>
              </p>
              <p className="text-xs text-theme-text-secondary">
                Expires on: {subscription.expiresAt}
              </p>
              <p className="text-xs text-theme-text-secondary">
                Marketplace Fee: <span className="font-medium">{subscription.feeBps / 100}%</span>
              </p>
            </>
          ) : (
            <p className="text-theme-text-secondary">
              You do not have an active subscription.
            </p>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="p-5 bg-theme-surface rounded-lg border border-theme-border shadow-md">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-theme-border">
            <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-red-500 mr-2" />
                <h2 className="text-lg font-semibold text-theme-text-primary">Data Management</h2>
            </div>
            <button
                onClick={handleClearSettings}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white font-medium rounded-md transition-colors duration-200 border border-red-700 hover:border-red-600 shadow-sm hover:shadow-md text-xs"
            >
                <Trash2 className="w-3 h-3" />
                Clear Cached
            </button>
        </div>
        <div className="pt-1 text-sm space-y-1">
          <p className="text-xs text-theme-text-secondary">
            Clear locally stored settings (theme, default view). This resets to application defaults.
          </p>
        </div>
      </div>

      {/* Back to Profile Link */}
      <div className="mt-8 text-center">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-theme-primary hover:underline">
            <ArrowLeft size={16} />
            Back to Profile
        </Link>
      </div>

    </div>
  );
};

export default SettingsPage; 