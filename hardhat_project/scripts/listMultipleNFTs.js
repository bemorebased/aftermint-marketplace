const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const MARKETPLACE_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  
  // List of NFTs to list with their details
  const nftsToList = [
    {
      tokenId: 1,
      price: hre.ethers.parseEther("0.5") // 0.5 ETH/BASED
    },
    {
      tokenId: 2,
      price: hre.ethers.parseEther("1.5") // 1.5 ETH/BASED
    },
    {
      tokenId: 3,
      price: hre.ethers.parseEther("0.75") // 0.75 ETH/BASED
    },
    {
      tokenId: 4,
      price: hre.ethers.parseEther("2.0") // 2.0 ETH/BASED
    }
  ];
  
  // Get contract and signer
  const marketplace = await hre.ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);
  const [seller] = await hre.ethers.getSigners();
  
  console.log(`Using seller account: ${seller.address}`);
  
  // List each NFT
  for (const nft of nftsToList) {
    console.log(`\nListing NFT #${nft.tokenId} for ${hre.ethers.formatEther(nft.price)} ETH/BASED`);
    
    try {
      // Standard values for all listings
      const PAYMENT_TOKEN = hre.ethers.ZeroAddress; // Native currency
      const EXPIRATION = 0; // No expiration
      const TARGET_BUYER = hre.ethers.ZeroAddress; // Public listing
      
      // List the NFT
      const tx = await marketplace.listNFT(
        MOCK_NFT_ADDRESS,
        nft.tokenId,
        nft.price,
        PAYMENT_TOKEN,
        EXPIRATION,
        TARGET_BUYER
      );
      
      const receipt = await tx.wait();
      console.log(`✅ NFT #${nft.tokenId} successfully listed!`);
      console.log(`Transaction hash: ${receipt.hash}`);
    } catch (error) {
      console.error(`❌ Error listing NFT #${nft.tokenId}:`);
      console.error(error.message);
    }
  }
  
  console.log("\nListing process completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 