'use client';

import * as React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme as rainbowDarkTheme, lightTheme as rainbowLightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { wagmiConfig } from '@/lib/wagmi';
import { useThemeStore, Theme } from '@/store/themeStore';

// Create a react-query client
const queryClient = new QueryClient();

// RainbowKit theme mapping
const getRainbowKitTheme = (appTheme: Theme) => {
  switch (appTheme) {
    case 'dark':
      return rainbowDarkTheme();
    case 'kek': // Customize Kek theme for RainbowKit if needed, or use dark/light
      return rainbowDarkTheme({ accentColor: '#246043', accentColorForeground: '#B0F3D5' }); 
    case 'based': // Customize Based theme for RainbowKit if needed, or use dark/light
      return rainbowDarkTheme({ accentColor: '#64FFDA', accentColorForeground: '#03070C' });
    default:
      return rainbowDarkTheme();
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    console.log('[Providers.tsx] useEffect - Current theme from store:', theme);
    // Remove all theme classes
    document.documentElement.classList.remove('theme-dark', 'theme-kek', 'theme-based');
    // Add the current theme class
    const themeClass = `theme-${theme}`;
    document.documentElement.classList.add(themeClass);
    console.log('[Providers.tsx] useEffect - Applied theme class to documentElement:', themeClass);
  }, [theme]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={getRainbowKitTheme(theme)}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 