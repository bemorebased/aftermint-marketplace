"use client";

import React, { useEffect, useState } from 'react';
import { Tv2, Layers, Hexagon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeStore();

  // Ensure component is mounted before rendering to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
    
    // Force rehydration from localStorage
    const savedTheme = localStorage.getItem('aftermint-theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        console.log('[ThemeSwitcher] Rehydrating theme from localStorage:', parsed);
        if (parsed.state && parsed.state.theme) {
          setTheme(parsed.state.theme);
        }
      } catch (error) {
        console.warn('[ThemeSwitcher] Failed to parse saved theme:', error);
      }
    }
  }, [setTheme]);

  // Debug: Log theme changes
  useEffect(() => {
    if (mounted) {
      console.log(`[ThemeSwitcher] Current theme: ${theme}`);
      console.log(`[ThemeSwitcher] Store state:`, useThemeStore.getState());
    }
  }, [theme, mounted]);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove all existing theme classes from both html and body
    ['theme-dark', 'theme-kek', 'theme-based'].forEach(theme => {
      html.classList.remove(theme);
      body.classList.remove(theme);
    });
    
    // Add the new theme class to both html and body
    const themeClass = `theme-${newTheme}`;
    html.classList.add(themeClass);
    body.classList.add(themeClass);
    
    // Force immediate re-render by updating a CSS variable
    html.style.setProperty('--theme-force-update', Date.now().toString());
    
    console.log(`[ThemeSwitcher] Applied theme: ${themeClass} to both html and body`);
    console.log(`[ThemeSwitcher] HTML classes:`, html.className);
    console.log(`[ThemeSwitcher] Body classes:`, body.className);
  };

  const handleThemeChange = (newTheme: 'dark' | 'kek' | 'based') => {
    console.log(`[ThemeSwitcher] Switching to: ${newTheme}`);
    setTheme(newTheme);
    
    // Force apply theme immediately
    applyTheme(newTheme);
  };

  // Don't render during SSR to avoid hydration mismatches
  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-surface border border-theme-border">
        <div className="w-8 h-8 bg-theme-card-highlight rounded-md animate-pulse"></div>
        <div className="w-8 h-8 bg-theme-card-highlight rounded-md animate-pulse"></div>
        <div className="w-8 h-8 bg-theme-card-highlight rounded-md animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-surface border border-theme-border">
      <button
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-in-out
            ${theme === 'dark' 
              ? 'bg-theme-primary text-black' 
              : 'text-theme-text-secondary hover:bg-theme-card-highlight hover:text-theme-text-primary'
            }`}
        onClick={() => handleThemeChange('dark')}
        aria-label="Switch to Night theme"
        title="Night"
      >
        <Tv2 size={18} />
      </button>
      <button
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-in-out
            ${theme === 'kek' 
              ? 'bg-theme-primary text-black' 
              : 'text-theme-text-secondary hover:bg-theme-card-highlight hover:text-theme-text-primary'
            }`}
        onClick={() => handleThemeChange('kek')}
        aria-label="Switch to Kek theme"
        title="Kek"
      >
        <Layers size={18} />
      </button>
      <button
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ease-in-out
            ${theme === 'based' 
              ? 'bg-theme-primary text-black' 
              : 'text-theme-text-secondary hover:bg-theme-card-highlight hover:text-theme-text-primary'
            }`}
        onClick={() => handleThemeChange('based')}
        aria-label="Switch to Based theme"
        title="Based"
      >
        <Hexagon size={18} />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
