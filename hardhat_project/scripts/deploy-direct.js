const { ethers } = require("hardhat");
const ERC1967ProxyJSON = require('@openzeppelin/contracts/build/contracts/ERC1967Proxy.json');

async function main() {
  console.log("Starting direct deployment...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Implementation address (already deployed)
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  console.log(`Implementation address: ${IMPLEMENTATION_ADDRESS}`);
  
  // Define initialization data
  const initABI = ["function initialize(address,uint256,address,address,bool,address,uint256)"];
  const initInterface = new ethers.Interface(initABI);
  const initData = initInterface.encodeFunctionData("initialize", [
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
    // Create a factory directly from the ABI and bytecode
    const factory = new ethers.ContractFactory(
      ERC1967ProxyJSON.abi,
      ERC1967ProxyJSON.bytecode,
      deployer
    );
    
    console.log("Deploying ERC1967Proxy...");
    
    // Deploy with constructor args 
    const proxy = await factory.deploy(
      IMPLEMENTATION_ADDRESS,
      initData,
      {
        gasLimit: 1000000,
        maxFeePerGas: ethers.parseUnits("25", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
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
        console.error(`Contract address: ${error.receipt.contractAddress}`);
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