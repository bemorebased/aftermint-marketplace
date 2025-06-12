const { ethers } = require("hardhat");

async function main() {
  console.log("Checking recent successful contract deployment...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // From the explorer screenshot, there's a more recent successful contract creation
  // This could potentially be our marketplace proxy
  const CONTRACT_ADDRESS = "0xE87CcCcc3131dd4182A5F3CA8EE6B74408c1aBe6";
  
  console.log(`Checking contract: ${CONTRACT_ADDRESS}`);

  try {
    // ERC1967 implementation slot (standard for upgradeable proxies)
    const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    
    // Get the implementation address directly from storage
    const implementationData = await ethers.provider.getStorage(CONTRACT_ADDRESS, implementationSlot);
    
    // Convert to address
    const implementationAddress = "0x" + implementationData.substring(26);
    
    console.log(`Implementation Address: ${implementationAddress}`);
    
    // Define marketplace ABI (minimal for verification)
    const marketplaceABI = [
      "function owner() view returns (address)",
      "function getDefaultFeePercentage() view returns (uint256)",
      "function getFeeRecipient() view returns (address)",
      "function getLifeNodesNFTContract() view returns (address)",
      "function getRoyaltiesDisabled() view returns (bool)",
      "function getStorageContract() view returns (address)"
    ];
    
    // Try to connect to contract as marketplace
    console.log("\nAttempting to read marketplace data...");
    const marketplace = new ethers.Contract(CONTRACT_ADDRESS, marketplaceABI, deployer);
    
    try {
      const owner = await marketplace.owner();
      console.log(`Owner: ${owner}`);
      
      const feePercentage = await marketplace.getDefaultFeePercentage();
      console.log(`Default Fee Percentage: ${feePercentage} (${feePercentage/100}%)`);
      
      console.log(`Fee Recipient: ${await marketplace.getFeeRecipient()}`);
      console.log(`LifeNodes NFT Contract: ${await marketplace.getLifeNodesNFTContract()}`);
      console.log(`Royalties Disabled: ${await marketplace.getRoyaltiesDisabled()}`);
      console.log(`Storage Contract: ${await marketplace.getStorageContract()}`);
      
      console.log("\nYour marketplace is properly deployed and initialized!");
    } catch (error) {
      console.log(`Error reading marketplace data: ${error.message}`);
    }
    
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