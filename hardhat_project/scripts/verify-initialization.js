const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying marketplace initialization...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Contract addresses
  const PROXY_ADDRESS = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
  console.log(`Proxy address: ${PROXY_ADDRESS}`);
  
  try {
    // Define marketplace ABI
    const marketplaceABI = [
      "function owner() view returns (address)",
      "function getDefaultFeePercentage() view returns (uint256)",
      "function getFeeRecipient() view returns (address)",
      "function getLifeNodesNFTContract() view returns (address)",
      "function getRoyaltiesDisabled() view returns (bool)",
      "function getStorageContract() view returns (address)"
    ];
    
    // Connect to the contract
    const marketplace = new ethers.Contract(PROXY_ADDRESS, marketplaceABI, deployer);
    
    // Get and display configuration
    console.log("\n--- Marketplace Configuration ---");
    
    const owner = await marketplace.owner();
    console.log(`Owner: ${owner}`);
    
    const feePercentage = await marketplace.getDefaultFeePercentage();
    console.log(`Default Fee Percentage: ${feePercentage} (${feePercentage/100}%)`);
    
    const feeRecipient = await marketplace.getFeeRecipient();
    console.log(`Fee Recipient: ${feeRecipient}`);
    
    const lifeNodesNFT = await marketplace.getLifeNodesNFTContract();
    console.log(`LifeNodes NFT Contract: ${lifeNodesNFT}`);
    
    const royaltiesDisabled = await marketplace.getRoyaltiesDisabled();
    console.log(`Royalties Disabled: ${royaltiesDisabled}`);
    
    const storageContract = await marketplace.getStorageContract();
    console.log(`Storage Contract: ${storageContract}`);
    
    // Verify expected values
    const expectedOwner = deployer.address;
    const expectedFeePercentage = 250; // 2.5%
    const expectedFeeRecipient = deployer.address;
    const expectedLifeNodesNFT = "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21";
    const expectedRoyaltiesDisabled = false;
    const expectedStorageContract = "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1";
    
    console.log("\n--- Verification Results ---");
    console.log(`Owner correctly set: ${owner.toLowerCase() === expectedOwner.toLowerCase()}`);
    console.log(`Fee percentage correctly set: ${feePercentage.toString() === expectedFeePercentage.toString()}`);
    console.log(`Fee recipient correctly set: ${feeRecipient.toLowerCase() === expectedFeeRecipient.toLowerCase()}`);
    console.log(`LifeNodes NFT correctly set: ${lifeNodesNFT.toLowerCase() === expectedLifeNodesNFT.toLowerCase()}`);
    console.log(`Royalties disabled correctly set: ${royaltiesDisabled === expectedRoyaltiesDisabled}`);
    console.log(`Storage contract correctly set: ${storageContract.toLowerCase() === expectedStorageContract.toLowerCase()}`);
    
    // Final result
    if (
      owner.toLowerCase() === expectedOwner.toLowerCase() &&
      feePercentage.toString() === expectedFeePercentage.toString() &&
      feeRecipient.toLowerCase() === expectedFeeRecipient.toLowerCase() &&
      lifeNodesNFT.toLowerCase() === expectedLifeNodesNFT.toLowerCase() &&
      royaltiesDisabled === expectedRoyaltiesDisabled &&
      storageContract.toLowerCase() === expectedStorageContract.toLowerCase()
    ) {
      console.log("\n🎉 SUCCESS! The marketplace is properly initialized and configured!");
      console.log(`Marketplace address: ${PROXY_ADDRESS}`);
    } else {
      console.log("\n⚠️ Some values were not set as expected. Check the verification results above.");
    }
  } catch (error) {
    console.error("Verification failed:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 