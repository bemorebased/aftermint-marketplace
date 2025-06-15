const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log(`Minting NFTs to MockNFT (${MOCK_NFT_ADDRESS})`);
  
  // Get contract and signer
  const mockNFT = await hre.ethers.getContractAt("MockNFT", MOCK_NFT_ADDRESS);
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`Using account: ${deployer.address}`);
  
  // Mint 5 NFTs
  for (let i = 0; i < 5; i++) {
    console.log(`Minting NFT #${i} to ${deployer.address}...`);
    const tx = await mockNFT.safeMint(deployer.address);
    await tx.wait();
    console.log(`✅ NFT #${i} minted!`);
  }
  
  // Get total supply to verify
  try {
    const totalSupply = await mockNFT.totalSupply();
    console.log(`Total supply: ${totalSupply}`);
  } catch (error) {
    console.log(`Could not check totalSupply: ${error.message}`);
    console.log("You might need to check token balance by tokenId");
  }
  
  console.log("All NFTs minted successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 