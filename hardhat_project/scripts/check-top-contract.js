const { ethers } = require("hardhat");

async function main() {
  console.log("Checking top successful contract from screenshot...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Looking at the top success transaction in the screenshot
  // From transaction hash 0x7077ff6f5a65171d07656d8c91a828c355b37a9de580c95538573d8112657077
  const CONTRACT_ADDRESS = "0xEd..."; // Replace with the actual contract address once known
  
  console.log("Looking up recent successful transactions for your account...");
  
  // Get the latest transactions for the deployer
  const startBlock = 1343000;
  const endBlock = 1344000;
  
  console.log(`Scanning blocks ${startBlock} to ${endBlock}...`);
  
  try {
    for (let i = endBlock; i >= startBlock; i -= 100) {
      const fromBlock = Math.max(startBlock, i - 100);
      const toBlock = i;
      
      console.log(`Scanning blocks ${fromBlock} to ${toBlock}...`);
      
      // Get transaction history
      const history = await ethers.provider.getHistory(deployer.address, fromBlock, toBlock);
      
      console.log(`Found ${history.length} transactions`);
      
      // Look for contract creations
      for (const tx of history) {
        const receipt = await tx.getReceipt();
        
        if (receipt && receipt.contractAddress) {
          console.log(`\nFound contract creation at tx ${tx.hash}`);
          console.log(`Contract address: ${receipt.contractAddress}`);
          console.log(`Block: ${receipt.blockNumber}`);
          
          // Check if this contract is a proxy
          try {
            const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const implementationData = await ethers.provider.getStorage(receipt.contractAddress, implementationSlot);
            const implementationAddress = "0x" + implementationData.substring(26);
            
            console.log(`Implementation: ${implementationAddress}`);
            
            if (implementationAddress !== "0x0000000000000000000000000000000000000000") {
              console.log("✅ This is an ERC1967 proxy");
            } else {
              console.log("❌ Not an ERC1967 proxy or implementation slot is empty");
            }
          } catch (error) {
            console.log(`Error checking implementation: ${error.message}`);
          }
          
          // Try to get owner
          try {
            const minimalABI = ["function owner() view returns (address)"];
            const contract = new ethers.Contract(receipt.contractAddress, minimalABI, deployer);
            const owner = await contract.owner();
            console.log(`Owner: ${owner}`);
            
            if (owner !== "0x0000000000000000000000000000000000000000") {
              console.log("✅ Contract has an owner set");
            } else {
              console.log("❌ Owner is zero address");
            }
          } catch (error) {
            console.log(`Error checking owner: ${error.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Scan failed:");
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