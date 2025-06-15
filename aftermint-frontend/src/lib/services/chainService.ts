import { ethers } from 'ethers';

// BasedAI Chain configuration
export const BASEDAI_CHAIN_CONFIG = {
  chainId: 32323,
  name: 'BasedAI',
  nativeCurrency: {
    name: 'BASED',
    symbol: 'BASED',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.basedaibridge.com/rpc/'],
  blockExplorerUrls: ['https://explorer.bf1337.org/'],
};

/**
 * Check if user is connected to BasedAI chain
 */
export async function checkChainConnection(): Promise<{
  isConnected: boolean;
  currentChainId?: number;
  needsSwitch: boolean;
  error?: string;
}> {
  try {
    if (!window.ethereum) {
      return {
        isConnected: false,
        needsSwitch: false,
        error: 'No wallet detected. Please install MetaMask or another Web3 wallet.'
      };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);

    console.log(`[ChainService] 🔗 Current chain ID: ${currentChainId}, Expected: ${BASEDAI_CHAIN_CONFIG.chainId}`);

    if (currentChainId === BASEDAI_CHAIN_CONFIG.chainId) {
      return {
        isConnected: true,
        currentChainId,
        needsSwitch: false
      };
    }

    return {
      isConnected: false,
      currentChainId,
      needsSwitch: true,
      error: `Wrong network. Please switch to BasedAI (Chain ID: ${BASEDAI_CHAIN_CONFIG.chainId})`
    };

  } catch (error: any) {
    console.error('[ChainService] ❌ Error checking chain connection:', error);
    return {
      isConnected: false,
      needsSwitch: false,
      error: `Failed to check network: ${error.message}`
    };
  }
}

/**
 * Switch to BasedAI chain
 */
export async function switchToBasedAI(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }

    console.log('[ChainService] 🔄 Attempting to switch to BasedAI chain...');

    // Try to switch to the chain
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASEDAI_CHAIN_CONFIG.chainId.toString(16)}` }],
      });
      console.log('[ChainService] ✅ Successfully switched to BasedAI chain');
      return true;
    } catch (switchError: any) {
      // If the chain is not added, add it
      if (switchError.code === 4902) {
        console.log('[ChainService] 🔄 Chain not found, adding BasedAI chain...');
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${BASEDAI_CHAIN_CONFIG.chainId.toString(16)}`,
              chainName: BASEDAI_CHAIN_CONFIG.name,
              nativeCurrency: BASEDAI_CHAIN_CONFIG.nativeCurrency,
              rpcUrls: BASEDAI_CHAIN_CONFIG.rpcUrls,
              blockExplorerUrls: BASEDAI_CHAIN_CONFIG.blockExplorerUrls,
            },
          ],
        });
        
        console.log('[ChainService] ✅ Successfully added and switched to BasedAI chain');
        return true;
      }
      throw switchError;
    }
  } catch (error: any) {
    console.error('[ChainService] ❌ Error switching to BasedAI chain:', error);
    throw new Error(`Failed to switch to BasedAI chain: ${error.message}`);
  }
}

/**
 * Check if marketplace contracts are accessible
 */
export async function checkContractAccess(contractAddress: string): Promise<{
  accessible: boolean;
  error?: string;
}> {
  try {
    console.log(`[ChainService] 🔍 Checking contract access for: ${contractAddress}`);
    
    if (!window.ethereum) {
      return {
        accessible: false,
        error: 'No wallet provider available'
      };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Try to get contract code
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x' || code === '') {
      return {
        accessible: false,
        error: 'Contract not found at this address'
      };
    }

    console.log(`[ChainService] ✅ Contract accessible at: ${contractAddress}`);
    return { accessible: true };

  } catch (error: any) {
    console.error(`[ChainService] ❌ Error checking contract access:`, error);
    return {
      accessible: false,
      error: error.message
    };
  }
}

/**
 * Comprehensive chain and contract health check
 */
export async function performHealthCheck(): Promise<{
  chainConnected: boolean;
  contractsAccessible: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check chain connection
  const chainStatus = await checkChainConnection();
  if (!chainStatus.isConnected) {
    issues.push(chainStatus.error || 'Not connected to BasedAI chain');
    if (chainStatus.needsSwitch) {
      recommendations.push('Switch your wallet to the BasedAI network');
    }
  }

  // Check marketplace contract
  const marketplaceStatus = await checkContractAccess('0x8A791620dd6260079BF849Dc5567aDC3F2FdC318');
  if (!marketplaceStatus.accessible) {
    issues.push(`Marketplace contract not accessible: ${marketplaceStatus.error}`);
    recommendations.push('Check your network connection and try again');
  }

  console.log('[ChainService] 🏥 Health check completed:', {
    chainConnected: chainStatus.isConnected,
    contractsAccessible: marketplaceStatus.accessible,
    issues,
    recommendations
  });

  return {
    chainConnected: chainStatus.isConnected,
    contractsAccessible: marketplaceStatus.accessible,
    issues,
    recommendations
  };
} 