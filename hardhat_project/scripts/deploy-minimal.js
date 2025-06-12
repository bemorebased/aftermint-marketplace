const { ethers } = require("hardhat");

async function main() {
  console.log("Starting minimal implementation with custom data...");
  
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
    // Create minimal proxy bytecode
    // This is a custom proxy implementation that delegates to the implementation address
    const minimalProxyBytecode = createMinimalProxy(IMPLEMENTATION_ADDRESS);
    
    // Deploy the contract directly with the bytecode
    console.log("Deploying minimal proxy...");
    
    const tx = await deployer.sendTransaction({
      data: minimalProxyBytecode, 
      gasLimit: 500000,  // Lower gas limit for a simpler proxy
    });
    
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`Proxy deployed to: ${receipt.contractAddress}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Now initialize the proxy
    console.log("Initializing proxy...");
    const proxyContract = new ethers.Contract(
      receipt.contractAddress,
      initABI,
      deployer
    );
    
    const initTx = await proxyContract.initialize(
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialOwner
      250, // initialDefaultFeePercentage (2.5%)
      "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialFeeRecipient
      "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
      false, // initialRoyaltiesDisabled
      "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
      32323, // chainId
      {
        gasLimit: 5000000
      }
    );
    
    console.log(`Initialization transaction hash: ${initTx.hash}`);
    
    console.log("Waiting for initialization confirmation...");
    const initReceipt = await initTx.wait();
    
    console.log(`Initialization complete, gas used: ${initReceipt.gasUsed.toString()}`);
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

// Function to create minimal proxy bytecode 
function createMinimalProxy(targetAddress) {
  // The minimal proxy is a very small contract that delegates all calls to another contract
  // Reference: EIP-1167 Minimal Proxy Standard
  
  // Remove 0x prefix and ensure the address is valid
  if (targetAddress.startsWith('0x')) {
    targetAddress = targetAddress.slice(2);
  }
  
  // Ensure address is valid format
  if (!/^[0-9a-fA-F]{40}$/.test(targetAddress)) {
    throw new Error('Invalid address format');
  }
  
  // Create the minimal proxy bytecode
  // Format: 0x363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3
  // Where "bebebebebebebebebebebebebebebebebebebebe" is replaced with the target address
  
  return (
    "0x" +
    "3d602d80600a3d3981f3363d3d373d3d3d363d73" +
    targetAddress.toLowerCase() +
    "5af43d82803e903d91602b57fd5bf3"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 