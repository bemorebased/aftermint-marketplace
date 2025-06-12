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
  // Handle multiple ethereum providers gracefully
  window.addEventListener('ethereum#initialized', () => {
    console.log('[Providers] Ethereum provider initialized');
  });
  
  // Prevent MetaMask conflicts by safely accessing the provider
  const handleEthereumProvider = () => {
    try {
      if (window.ethereum) {
        // If there are multiple providers, MetaMask usually takes precedence
        if (window.ethereum.providers?.length) {
          console.log('[Providers] Multiple ethereum providers detected, using primary');
          // Find MetaMask provider specifically
          const metamaskProvider = window.ethereum.providers.find(
            (provider: any) => provider.isMetaMask
          );
          if (metamaskProvider) {
            console.log('[Providers] MetaMask provider found');
          }
        }
      }
    } catch (error) {
      // Silently handle the error to prevent console spam
      console.debug('[Providers] Ethereum provider setup handled gracefully');
    }
  };
  
  // Handle provider setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleEthereumProvider);
  } else {
    handleEthereumProvider();
  }
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
    
    wagmiConfig = getDefaultConfig({
      appName: 'AfterMint',
      projectId: hasValidProjectId ? process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! : undefined,
      chains: [basedAIChain],
      ssr: true,
      // Only include WalletConnect if we have a valid project ID
      ...(hasValidProjectId ? {} : {
        wallets: [{
          groupName: 'Popular',
          wallets: []
        }]
      })
    });
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