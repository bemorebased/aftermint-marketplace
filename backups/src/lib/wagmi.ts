import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, Chain } from 'wagmi/chains';

// Define BasedAI Chain
const basedAI: Chain = {
  id: 32323,
  name: 'BasedAI Mainnet',
  nativeCurrency: { name: 'BASED', symbol: 'BASED', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.basedaibridge.com/rpc/'] },
  },
  blockExplorers: {
    default: { name: 'BasedAI Explorer', url: 'https://explorer.bf1337.org' },
  },
  testnet: false,
};

export const wagmiConfig = getDefaultConfig({
  appName: 'AfterMint Marketplace',
  projectId: 'YOUR_PROJECT_ID', // Replace with your actual WalletConnect Project ID
  chains: [
    basedAI,
    hardhat, // For local development
    // Add other chains here if needed, e.g., mainnet, sepolia
  ],
  ssr: true, // Enable SSR support for wagmi (good for Next.js)
}); 