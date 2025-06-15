const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment with TransparentUpgradeableProxy...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Implementation address (already deployed)
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  console.log(`Implementation address: ${IMPLEMENTATION_ADDRESS}`);
  
  // Admin address
  const ADMIN_ADDRESS = "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B";
  console.log(`Admin address: ${ADMIN_ADDRESS}`);
  
  // Encode initialization data
  const ABI = ["function initialize(address,uint256,address,address,bool,address,uint256)"];
  const interface = new ethers.Interface(ABI);
  const initData = interface.encodeFunctionData("initialize", [
    "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialOwner
    250, // initialDefaultFeePercentage (2.5%)
    "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialFeeRecipient
    "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
    false, // initialRoyaltiesDisabled
    "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
    32323 // chainId
  ]);
  
  console.log(`Init data length: ${initData.length - 2} bytes`);
  
  try {
    // Get TransparentUpgradeableProxy factory
    console.log("Creating factory for TransparentUpgradeableProxy...");
    const TransparentUpgradeableProxyFactory = await ethers.getContractFactory(
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy"
    );
    
    console.log("Deploying TransparentUpgradeableProxy...");
    const proxy = await TransparentUpgradeableProxyFactory.deploy(
      IMPLEMENTATION_ADDRESS,
      ADMIN_ADDRESS,
      initData,
      {
        gasLimit: 10000000
      }
    );
    
    console.log(`Deployment transaction hash: ${proxy.deploymentTransaction().hash}`);
    
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
      
      if (error.receipt.contractAddress) {
        console.error(`Contract address (if created): ${error.receipt.contractAddress}`);
      }
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