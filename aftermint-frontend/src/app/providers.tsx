'use client';

import React, { useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { useThemeStore } from '@/store/themeStore';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Fix MetaMask provider conflicts on component mount
if (typeof window !== 'undefined') {
  // Suppress MetaMask provider conflicts completely
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out MetaMask provider conflict errors
    const message = args[0]?.toString() || '';
    if (message.includes('MetaMask encountered an error setting the global Ethereum provider') ||
        message.includes('Cannot set property ethereum') ||
        message.includes('which has only a getter')) {
      // Silently ignore these specific MetaMask conflicts
      return;
    }
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Handle ethereum provider setup gracefully
  const handleEthereumProvider = () => {
    try {
      if (window.ethereum) {
        // Check for multiple providers without triggering errors
        const hasMultipleProviders = Array.isArray(window.ethereum.providers) && window.ethereum.providers.length > 0;
        
        if (hasMultipleProviders) {
          console.debug('[Providers] Multiple wallet providers detected - using default');
        } else {
          console.debug('[Providers] Single wallet provider detected');
        }
      }
    } catch (error) {
      // Completely silent - no logging to avoid console pollution
    }
  };
  
  // Handle provider setup after DOM is ready
  setTimeout(handleEthereumProvider, 100);
}

// Define the BasedAI chain
const basedAIChain = defineChain({
  id: 32323,
  name: 'BasedAI',
  nativeCurrency: {
    name: 'BASED',
    symbol: 'BASED',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.basedaibridge.com/rpc/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BasedAI Explorer',
      url: 'https://explorer.bf1337.org',
    },
  },
});

// Create wagmi config and query client only once to prevent double initialization
let wagmiConfig: any = null;
let queryClient: QueryClient | null = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    const hasValidProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && 
                             process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID !== 'YOUR_PROJECT_ID_HERE';
    
    const configOptions: any = {
      appName: 'AfterMint',
      chains: [basedAIChain],
      ssr: true,
    };

    // Only add projectId if it's valid
    if (hasValidProjectId) {
      configOptions.projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
    } else {
      // Add empty wallets config when no project ID
      configOptions.wallets = [{
        groupName: 'Popular',
        wallets: []
      }];
    }

    wagmiConfig = getDefaultConfig(configOptions);
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}

// Improved theme component that prevents white background flash
function ThemeApplier({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [isClient, setIsClient] = useState(false);

  // Apply theme immediately on client side, before hydration
  useEffect(() => {
    const applyTheme = (themeName: string) => {
      const themeClassMap: Record<string, string> = {
        'dark': 'theme-dark',
        'kek': 'theme-kek', 
        'based': 'theme-based'
      };
      
      const themeClass = themeClassMap[themeName] || 'theme-dark';
      
      // Apply to both html and body for complete coverage
      const html = document.documentElement;
      const body = document.body;
      
      // Remove all theme classes
      ['theme-dark', 'theme-kek', 'theme-based'].forEach(cls => {
        html.classList.remove(cls);
        body.classList.remove(cls);
      });
      
      // Apply the correct theme class immediately
      html.classList.add(themeClass);
      body.classList.add(themeClass);
      
      // Force style recalculation to prevent white flash
      html.style.backgroundColor = `hsl(var(--theme-background))`;
      body.style.backgroundColor = `hsl(var(--theme-background))`;
      body.style.color = `hsl(var(--theme-text-primary))`;
      
      console.log(`[ThemeApplier] Applied theme: ${themeClass}`);
    };

    // Apply theme immediately when component mounts
    applyTheme(theme);
    setIsClient(true);
  }, [theme]);

  // Pre-apply theme class during SSR to prevent flash
  const themeClassMap: Record<string, string> = {
    'dark': 'theme-dark',
    'kek': 'theme-kek', 
    'based': 'theme-based'
  };
  const themeClass = themeClassMap[theme] || 'theme-dark';

  // Apply theme class directly to wrapper
  return (
    <div className={`${themeClass} min-h-screen bg-theme-background text-theme-text-primary`}>
      {children}
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider>
      <Theme>
        <WagmiProvider config={getWagmiConfig()}>
          <QueryClientProvider client={getQueryClient()}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: '#7b3ff2',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              })}
            >
              <ThemeApplier>
                {children}
              </ThemeApplier>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </Theme>
    </NextThemesProvider>
  );
} 