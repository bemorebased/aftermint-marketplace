const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const MARKETPLACE_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  
  console.log(`\n=== Checking MockNFT at ${MOCK_NFT_ADDRESS} ===`);
  // Get contract instances
  const mockNFT = await hre.ethers.getContractAt("MockNFT", MOCK_NFT_ADDRESS);
  const marketplace = await hre.ethers.getContractAt("Marketplace", MARKETPLACE_ADDRESS);
  const [account] = await hre.ethers.getSigners();
  
  // Check basic NFT info
  const name = await mockNFT.name();
  const symbol = await mockNFT.symbol();
  
  console.log(`Collection Name: ${name}`);
  console.log(`Collection Symbol: ${symbol}`);
  
  // Check the first 10 token IDs
  console.log(`\nChecking NFT tokens:`);
  for (let i = 0; i < 10; i++) {
    try {
      const owner = await mockNFT.ownerOf(i);
      const tokenURI = await mockNFT.tokenURI(i);
      
      // Check if token is listed
      let listingInfo = { isListed: false, price: 0, seller: null };
      try {
        const listing = await marketplace.getListing(MOCK_NFT_ADDRESS, i);
        if (listing && listing.seller !== hre.ethers.ZeroAddress) {
          listingInfo = {
            isListed: true,
            price: hre.ethers.formatEther(listing.price), 
            seller: listing.seller
          };
        }
      } catch (e) {
        // Not listed or error
      }
      
      console.log(`\nToken #${i}:`);
      console.log(`  Owner: ${owner}`);
      console.log(`  TokenURI: ${tokenURI}`);
      console.log(`  Listed: ${listingInfo.isListed}`);
      if (listingInfo.isListed) {
        console.log(`  Price: ${listingInfo.price} ETH/BASED`);
        console.log(`  Seller: ${listingInfo.seller}`);
      }
      
      // Test fetching the metadata from the URI
      if (tokenURI) {
        try {
          console.log(`  Attempting to fetch metadata from: ${tokenURI}`);
          const response = await fetch(tokenURI);
          if (response.ok) {
            const metadata = await response.json();
            console.log(`  Metadata name: ${metadata.name}`);
            console.log(`  Metadata image: ${metadata.image}`);
          } else {
            console.log(`  Failed to fetch metadata, status: ${response.status}`);
          }
        } catch (error) {
          console.log(`  Error fetching metadata: ${error.message}`);
        }
      }
    } catch (e) {
      console.log(`Token #${i}: Not minted or error: ${e.message}`);
    }
  }
  
  console.log(`\n=== Frontend Debugging Data ===`);
  console.log(`Current RPC URL: http://localhost:8545`);
  console.log(`Use this data to verify frontend connection issues.`);
}

// Helper function to find active listings
async function getAllListings(marketplace, nftAddress) {
  // This is a simplified example, as getting all listings efficiently 
  // would require events or other methods
  const listings = [];
  
  // Check first 20 token IDs as an example
  for (let i = 0; i < 20; i++) {
    try {
      const listing = await marketplace.getListing(nftAddress, i);
      if (listing && listing.seller !== hre.ethers.ZeroAddress) {
        listings.push({
          tokenId: i,
          price: hre.ethers.formatEther(listing.price),
          seller: listing.seller
        });
      }
    } catch (e) {
      // Not listed or error
    }
  }
  
  return listings;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 