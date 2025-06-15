const { ethers } = require("hardhat");

async function main() {
  console.log("Checking recent transaction from screenshot...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Transaction from screenshot
  const txHash = "0x7077ff6f5a65171d07656d8c91a828c355b37a9de580c95538573d8112657077";
  console.log(`Examining transaction: ${txHash}`);
  
  try {
    // Get transaction receipt
    console.log("Getting transaction receipt...");
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      console.log(`Transaction successful: ${receipt.status === 1}`);
      console.log(`Block number: ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      if (receipt.contractAddress) {
        console.log(`Contract created at: ${receipt.contractAddress}`);
        
        // Check the created contract
        const contractAddress = receipt.contractAddress;
        
        // Get the contract code
        const code = await ethers.provider.getCode(contractAddress);
        console.log(`Contract code size: ${(code.length - 2) / 2} bytes`);
        
        // Check implementation slots
        const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        const implementationData = await ethers.provider.getStorage(contractAddress, implementationSlot);
        
        // Convert to address
        const implementationAddress = "0x" + implementationData.substring(26);
        console.log(`Implementation address: ${implementationAddress}`);
        
        const expectedImplementation = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
        console.log(`Expected implementation: ${expectedImplementation}`);
        console.log(`Match: ${implementationAddress.toLowerCase() === expectedImplementation.toLowerCase()}`);
        
        // Test owner
        try {
          const abi = ["function owner() view returns (address)"];
          const contract = new ethers.Contract(contractAddress, abi, deployer);
          const owner = await contract.owner();
          console.log(`Owner: ${owner}`);
        } catch (error) {
          console.log(`Error getting owner: ${error.message}`);
        }
        
        // Full marketplace check
        try {
          const marketplaceABI = [
            "function owner() view returns (address)",
            "function getDefaultFeePercentage() view returns (uint256)",
            "function getFeeRecipient() view returns (address)",
            "function getLifeNodesNFTContract() view returns (address)",
            "function getRoyaltiesDisabled() view returns (bool)",
            "function getStorageContract() view returns (address)"
          ];
          
          const marketplace = new ethers.Contract(contractAddress, marketplaceABI, deployer);
          
          console.log("\nMarketplace configuration:");
          console.log(`Owner: ${await marketplace.owner()}`);
          const feePercentage = await marketplace.getDefaultFeePercentage();
          console.log(`Fee: ${feePercentage} (${feePercentage / 100}%)`);
          console.log(`Fee recipient: ${await marketplace.getFeeRecipient()}`);
          console.log(`LifeNodes NFT: ${await marketplace.getLifeNodesNFTContract()}`);
          console.log(`Royalties disabled: ${await marketplace.getRoyaltiesDisabled()}`);
          console.log(`Storage contract: ${await marketplace.getStorageContract()}`);
          
          console.log("\n✅ The marketplace is properly deployed and configured!");
        } catch (error) {
          console.log(`\n❌ Error interacting with marketplace: ${error.message}`);
        }
      } else {
        console.log("No contract created in this transaction");
      }
    } else {
      console.log("Transaction not found or still pending");
    }
  } catch (error) {
    console.error("Check failed:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 