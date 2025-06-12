const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment with raw transaction...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Implementation address 
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  console.log(`Implementation address: ${IMPLEMENTATION_ADDRESS}`);
  
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
  console.log(`Init data: ${initData}`);
  
  // Get ERC1967Proxy bytecode
  const ERC1967ProxyArtifact = require('@openzeppelin/contracts/build/contracts/ERC1967Proxy.json');
  const bytecode = ERC1967ProxyArtifact.bytecode;
  const abi = ERC1967ProxyArtifact.abi;
  
  // Encode constructor parameters
  const proxyInterface = new ethers.Interface(abi);
  const encodedParams = proxyInterface.encodeDeploy([IMPLEMENTATION_ADDRESS, initData]);
  
  console.log(`Encoded constructor params length: ${encodedParams.length - 2} bytes`);
  
  // Create deployment transaction
  console.log("Creating deployment transaction...");
  const fullData = bytecode + encodedParams.slice(2);
  console.log(`Full transaction data length: ${fullData.length} bytes`);
  
  const deployTx = {
    data: fullData, // Remove '0x' from encoded params
    gasLimit: 10000000, // Increased gas limit
    maxFeePerGas: ethers.parseUnits("25", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
  };
  
  console.log("Sending transaction...");
  try {
    const deploymentTx = await deployer.sendTransaction(deployTx);
    console.log(`Transaction hash: ${deploymentTx.hash}`);
    
    console.log("Waiting for confirmation...");
    const receipt = await deploymentTx.wait();
    
    console.log(`Proxy deployed at: ${receipt.contractAddress}`);
    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Deployment failed:");
    console.error(`Error message: ${error.message}`);
    
    if (error.receipt) {
      console.error(`Transaction failed with status: ${error.receipt.status}`);
      console.error(`Gas used: ${error.receipt.gasUsed.toString()}`);
      console.error(`Contract address (if created): ${error.receipt.contractAddress}`);
    }
    
    if (error.transaction) {
      console.error(`Transaction data: ${error.transaction.data.substring(0, 66)}...`);
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