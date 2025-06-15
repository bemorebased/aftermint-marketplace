const { ethers } = require("hardhat");

async function main() {
  console.log("Starting simplified deployment...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Implementation address (already deployed)
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  console.log(`Implementation address: ${IMPLEMENTATION_ADDRESS}`);
  
  // Get proxy factory
  const proxyFactory = await ethers.getContractFactory("@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
  
  // Encode initialization data - this is what gets passed to the implementation's initialize function
  const initData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256", "address", "address", "bool", "address", "uint256"],
    [
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialOwner
      250, // initialDefaultFeePercentage (2.5%)
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialFeeRecipient
      "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
      false, // initialRoyaltiesDisabled
      "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
      32323 // chainId
    ]
  );
  
  // Prepend the function selector for initialize
  const functionSelector = ethers.keccak256(ethers.toUtf8Bytes("initialize(address,uint256,address,address,bool,address,uint256)")).slice(0, 10);
  const fullInitData = functionSelector + initData.slice(2);
  
  console.log(`Function selector: ${functionSelector}`);
  console.log(`Init data length: ${fullInitData.length - 2} bytes`);
  
  try {
    // Deploy proxy with constructor arguments
    console.log("Deploying proxy...");
    const proxy = await proxyFactory.deploy(
      IMPLEMENTATION_ADDRESS,
      fullInitData,
      {
        gasLimit: 10000000
      }
    );
    
    console.log(`Deployment transaction hash: ${proxy.deploymentTransaction().hash}`);
    
    // Wait for deployment
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