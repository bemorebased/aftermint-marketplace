const hre = require("hardhat");

async function main() {
  // Addresses from your deployment logs
  const MOCK_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const MARKETPLACE_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  
  console.log(`Approving marketplace (${MARKETPLACE_ADDRESS}) to transfer NFTs from MockNFT (${MOCK_NFT_ADDRESS})`);
  
  // Get contract and signer
  const mockNFT = await hre.ethers.getContractAt("MockNFT", MOCK_NFT_ADDRESS);
  const [deployer] = await hre.ethers.getSigners();
  
  // Approve marketplace for all tokens (setApprovalForAll)
  console.log(`Setting approval from ${deployer.address}...`);
  const tx = await mockNFT.setApprovalForAll(MARKETPLACE_ADDRESS, true);
  await tx.wait();
  
  // Verify approval is set
  const isApproved = await mockNFT.isApprovedForAll(deployer.address, MARKETPLACE_ADDRESS);
  console.log(`Approval status: ${isApproved}`);
  
  if (isApproved) {
    console.log("✅ Marketplace approved to transfer NFTs!");
  } else {
    console.error("❌ Approval failed!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 