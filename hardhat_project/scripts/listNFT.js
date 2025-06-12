const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const MARKETPLACE_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  
  // NFT details to list
  const TOKEN_ID = 0; // First NFT minted
  const PRICE = hre.ethers.parseEther("1.0"); // 1 ETH/BASED
  const PAYMENT_TOKEN = hre.ethers.ZeroAddress; // Native currency (ETH/BASED)
  const EXPIRATION = 0; // No expiration
  const TARGET_BUYER = hre.ethers.ZeroAddress; // Public listing
  
  console.log(`Listing NFT on marketplace:`);
  console.log(`- NFT Contract: ${MOCK_NFT_ADDRESS}`);
  console.log(`- Token ID: ${TOKEN_ID}`);
  console.log(`- Price: ${hre.ethers.formatEther(PRICE)} ETH/BASED`);
  
  // Get contract and signer
  const marketplace = await hre.ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);
  const [seller] = await hre.ethers.getSigners();
  
  console.log(`Using seller account: ${seller.address}`);
  
  try {
    // List the NFT - using the correct parameter order from the contract
    const tx = await marketplace.listNFT(
      MOCK_NFT_ADDRESS,
      TOKEN_ID,
      PRICE,
      PAYMENT_TOKEN,
      EXPIRATION,
      TARGET_BUYER
    );
    
    const receipt = await tx.wait();
    
    console.log(`NFT successfully listed!`);
    console.log(`Transaction hash: ${receipt.hash}`);
  } catch (error) {
    console.error("Error listing NFT:");
    console.error(error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 