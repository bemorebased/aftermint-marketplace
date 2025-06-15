const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log(`Checking MockNFT at ${MOCK_NFT_ADDRESS}...`);
  
  // Get contract instance
  const mockNFT = await hre.ethers.getContractAt("MockNFT", MOCK_NFT_ADDRESS);
  const [deployer] = await hre.ethers.getSigners();
  
  // Check basic information
  try {
    const name = await mockNFT.name();
    console.log(`Name: ${name}`);
  } catch (error) {
    console.log(`Could not get name: ${error.message}`);
  }
  
  try {
    const symbol = await mockNFT.symbol();
    console.log(`Symbol: ${symbol}`);
  } catch (error) {
    console.log(`Could not get symbol: ${error.message}`);
  }
  
  // Check token ownership for the first 10 token IDs
  console.log(`\nChecking token ownership for tokens 0-9:`);
  
  for (let i = 0; i < 10; i++) {
    try {
      const owner = await mockNFT.ownerOf(i);
      console.log(`Token #${i}: Owned by ${owner}`);
      
      // Try to get URI
      try {
        const uri = await mockNFT.tokenURI(i);
        console.log(`  URI: ${uri}`);
      } catch (error) {
        console.log(`  Could not get URI for token #${i}: ${error.message}`);
      }
    } catch (error) {
      console.log(`Token #${i}: Not minted or error: ${error.message}`);
    }
  }
  
  // Check if marketplace is approved
  try {
    const MARKETPLACE_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
    const isApproved = await mockNFT.isApprovedForAll(deployer.address, MARKETPLACE_ADDRESS);
    console.log(`\nMarketplace approved for all tokens: ${isApproved}`);
  } catch (error) {
    console.log(`Could not check marketplace approval: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 