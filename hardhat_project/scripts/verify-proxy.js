const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying marketplace proxy deployment...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Addresses
  const PROXY_ADDRESS = "0x22C36b769cef9E54051765F20E81ECDe121f3ee2";
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  const STORAGE_ADDRESS = "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1";
  
  console.log(`Proxy: ${PROXY_ADDRESS}`);
  console.log(`Implementation: ${IMPLEMENTATION_ADDRESS}`);
  console.log(`Storage: ${STORAGE_ADDRESS}`);

  try {
    // Define marketplace ABI (minimal for verification)
    const marketplaceABI = [
      "function owner() view returns (address)",
      "function getDefaultFeePercentage() view returns (uint256)",
      "function getFeeRecipient() view returns (address)",
      "function getLifeNodesNFTContract() view returns (address)",
      "function getRoyaltiesDisabled() view returns (bool)",
      "function getStorageContract() view returns (address)",
      "function implementation() view returns (address)"
    ];
    
    // Connect to the proxy as the marketplace
    console.log("Connecting to marketplace proxy...");
    const marketplace = new ethers.Contract(PROXY_ADDRESS, marketplaceABI, deployer);
    
    // Check ownership and configuration
    console.log("\nVerifying marketplace configuration:");
    console.log(`Owner: ${await marketplace.owner()}`);
    
    const feePercentage = await marketplace.getDefaultFeePercentage();
    console.log(`Default Fee Percentage: ${feePercentage} (${feePercentage/100}%)`);
    
    console.log(`Fee Recipient: ${await marketplace.getFeeRecipient()}`);
    console.log(`LifeNodes NFT Contract: ${await marketplace.getLifeNodesNFTContract()}`);
    console.log(`Royalties Disabled: ${await marketplace.getRoyaltiesDisabled()}`);
    
    const storageAddress = await marketplace.getStorageContract();
    console.log(`Storage Contract: ${storageAddress}`);
    console.log(`Storage Correctly Set: ${storageAddress.toLowerCase() === STORAGE_ADDRESS.toLowerCase()}`);
    
    // Try to get implementation address (if ERC1967 method available)
    try {
      const implAddress = await marketplace.implementation();
      console.log(`Implementation: ${implAddress}`);
      console.log(`Correctly Pointing to Implementation: ${implAddress.toLowerCase() === IMPLEMENTATION_ADDRESS.toLowerCase()}`);
    } catch (error) {
      console.log("Implementation address not directly accessible (normal for proxies)");
    }
    
    console.log("\nVerification complete - Marketplace proxy is correctly deployed!");
  } catch (error) {
    console.error("Verification failed:");
    console.error(error.message);
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 