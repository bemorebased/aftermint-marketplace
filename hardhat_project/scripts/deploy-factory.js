const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Starting deployment with OpenZeppelin upgrades plugin...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  try {
    // Get implementation contract factory
    console.log("Loading implementation factory...");
    const marketplaceImplementationAddress = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
    console.log(`Using implementation at: ${marketplaceImplementationAddress}`);
    
    // Create a minimal ABI for the marketplace
    const minimalABI = [
      "function initialize(address,uint256,address,address,bool,address,uint256)"
    ];
    
    // Get factory for the implementation
    const MarketplaceFactory = await ethers.getContractFactory("AfterMintMarketplace");
    
    // Override the deploy transaction
    const overrides = {
      gasLimit: 10000000
    };
    
    // Prepare initialization parameters
    const initArgs = [
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialOwner
      250, // initialDefaultFeePercentage (2.5%)
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialFeeRecipient
      "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
      false, // initialRoyaltiesDisabled
      "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
      32323 // chainId
    ];
    
    console.log("Deploying proxy...");
    console.log("Init args:", JSON.stringify(initArgs, null, 2));
    
    // Deploy the proxy with an existing implementation
    const proxy = await upgrades.deployProxy(
      MarketplaceFactory, 
      initArgs, 
      { 
        constructorArgs: [],
        initializer: "initialize",
        unsafeAllow: ["constructor", "delegatecall", "state-variable-immutable"],
        kind: "transparent",
        Implementation: marketplaceImplementationAddress,
        gasLimit: overrides.gasLimit
      }
    );
    
    console.log("Waiting for confirmation...");
    await proxy.waitForDeployment();
    
    console.log(`Proxy deployed to: ${await proxy.getAddress()}`);
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Deployment failed:");
    console.error(`Error message: ${error.message}`);
    
    if (error.receipt) {
      console.error(`Transaction failed with status: ${error.receipt.status}`);
      console.error(`Gas used: ${error.receipt.gasUsed.toString()}`);
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 