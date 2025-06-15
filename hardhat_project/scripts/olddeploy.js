const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying AfterMint contracts...");

  // Get contract factories
  const AfterMintStorage = await ethers.getContractFactory("AfterMintStorage");
  const AfterMintMarketplace = await ethers.getContractFactory("AfterMintMarketplace");
  
  // Get deployment parameters
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Load configuration from environment or use defaults
  const owner = process.env.CONTRACT_OWNER || deployer.address;
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const initialFeePercentage = process.env.INITIAL_FEE_PERCENTAGE || 250; // 2.5% default fee
  const lifeNodesAddress = process.env.LIFENODES_NFT_ADDRESS || ethers.constants.AddressZero;
  const basedChainId = process.env.BASED_CHAIN_ID || 32323;
  
  console.log("Deployment parameters:");
  console.log(`- Owner: ${owner}`);
  console.log(`- Fee Recipient: ${feeRecipient}`);
  console.log(`- Initial Fee: ${initialFeePercentage} basis points`);
  console.log(`- LifeNodes NFT: ${lifeNodesAddress}`);
  console.log(`- Chain ID: ${basedChainId}`);
  
  // 1. Deploy AfterMintStorage
  console.log("Deploying AfterMintStorage...");
  const afterMintStorage = await upgrades.deployProxy(
    AfterMintStorage,
    [owner],
    { kind: "uups" }
  );
  await afterMintStorage.deployed();
  console.log(`AfterMintStorage deployed to: ${afterMintStorage.address}`);
  
  // 2. Deploy AfterMintMarketplace
  console.log("Deploying AfterMintMarketplace...");
  const afterMintMarketplace = await upgrades.deployProxy(
    AfterMintMarketplace,
    [
      owner,
      initialFeePercentage,
      feeRecipient,
      lifeNodesAddress,
      afterMintStorage.address,
      basedChainId
    ],
    { kind: "uups" }
  );
  await afterMintMarketplace.deployed();
  console.log(`AfterMintMarketplace deployed to: ${afterMintMarketplace.address}`);
  
  // 3. Configure AfterMintStorage to recognize the marketplace
  console.log("Setting marketplace in storage contract...");
  const setMarketplaceTx = await afterMintStorage.setMarketplaceContract(afterMintMarketplace.address);
  await setMarketplaceTx.wait();
  console.log("Configuration complete!");
  
  console.log("Verifying configuration...");
  const marketplaceInStorage = await afterMintStorage.marketplaceContract();
  const storageInMarketplace = await afterMintMarketplace.afterMintStorage();
  
  if (marketplaceInStorage === afterMintMarketplace.address) {
    console.log("✓ Storage contract correctly points to marketplace");
  } else {
    console.log("✗ Storage contract incorrectly configured");
  }
  
  if (storageInMarketplace === afterMintStorage.address) {
    console.log("✓ Marketplace contract correctly points to storage");
  } else {
    console.log("✗ Marketplace contract incorrectly configured");
  }
  
  console.log("\nDeployment Summary:");
  console.log(`- AfterMintStorage: ${afterMintStorage.address}`);
  console.log(`- AfterMintMarketplace: ${afterMintMarketplace.address}`);
  console.log(`- Owner: ${owner}`);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on BasedScan (if available)");
  console.log("2. Transfer ownership if needed");
  console.log("3. Configure collection-specific fees");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 