'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useThemeStore, Theme } from '@/store/themeStore';
import { Sun, Moon, Sparkles } from 'lucide-react'; // Icons for themes
import React from 'react'; // Ensure React is imported

const Header = () => {
  const { theme, setTheme } = useThemeStore();

  const themes: { name: Theme; icon: JSX.Element }[] = [
    { name: 'dark', icon: <Moon size={18} /> },
    { name: 'kek', icon: <Sparkles size={18} /> },
    { name: 'based', icon: <Sun size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-theme-surface border-b border-theme-border p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-theme-text-primary hover:text-theme-primary transition-colors">
          AfterMint
        </Link>

        <div className="flex items-center space-x-4">
          {/* Theme Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-theme-background rounded-lg">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`p-1.5 rounded-md transition-colors 
                            ${theme === t.name 
                              ? 'bg-theme-primary text-white' 
                              : 'hover:bg-theme-border'}`}
                title={`Switch to ${t.name.charAt(0).toUpperCase() + t.name.slice(1)} theme`}
              >
                {t.icon}
              </button>
            ))}
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header; 