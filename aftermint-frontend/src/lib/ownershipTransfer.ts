import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS, MARKETPLACE_OWNER, CURRENT_OWNER } from './services/nftService';

// The necessary ABI fragment for transferring ownership
const OWNERSHIP_ABI = [
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner) external",
];

/**
 * Checks if ownership transfer is needed
 */
export async function checkOwnership(
  provider: ethers.Provider
): Promise<{currentOwner: string, needsTransfer: boolean}> {
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, OWNERSHIP_ABI, provider);
  
  try {
    const currentOwner = await contract.owner();
    console.log(`Current marketplace owner: ${currentOwner}`);
    console.log(`Intended marketplace owner: ${MARKETPLACE_OWNER}`);
    
    return {
      currentOwner,
      needsTransfer: currentOwner.toLowerCase() !== MARKETPLACE_OWNER.toLowerCase()
    };
  } catch (error) {
    console.error("Error checking ownership:", error);
    throw error;
  }
}

/**
 * Transfers ownership of the marketplace to the intended owner
 */
export async function transferOwnership(
  signer: ethers.Signer
): Promise<ethers.TransactionResponse> {
  // First check current owner
  const provider = signer.provider;
  if (!provider) {
    throw new Error("Signer must have a provider");
  }
  const { currentOwner, needsTransfer } = await checkOwnership(provider);
  
  // Make sure the signer is the current owner
  const signerAddress = await signer.getAddress();
  if (signerAddress.toLowerCase() !== currentOwner.toLowerCase()) {
    throw new Error(`Only the current owner can transfer ownership. Current owner is ${currentOwner}`);
  }
  
  if (!needsTransfer) {
    throw new Error("Ownership transfer not needed - the intended owner is already set.");
  }
  
  console.log(`Transferring ownership from ${currentOwner} to ${MARKETPLACE_OWNER}...`);
  
  const contract = new ethers.Contract(MARKETPLACE_ADDRESS, OWNERSHIP_ABI, signer);
  return await contract.transferOwnership(MARKETPLACE_OWNER);
} 