const { ethers } = require("hardhat");

async function main() {
  console.log("Interacting with proxy contract...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Contract addresses
  const PROXY_ADDRESS = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  
  console.log(`Proxy: ${PROXY_ADDRESS}`);
  console.log(`Implementation: ${IMPLEMENTATION_ADDRESS}`);
  
  // Try checking common admin-related functions
  const adminFunctions = [
    "function admin() view returns (address)",
    "function implementation() view returns (address)",
    "function upgradeTo(address newImplementation)",
    "function owner() view returns (address)",
    "function initialized() view returns (bool)",
    "function initializing() view returns (bool)"
  ];
  
  try {
    console.log("\nChecking admin-related functions...");
    const adminContract = new ethers.Contract(PROXY_ADDRESS, adminFunctions, deployer);
    
    // Try each function
    for (const func of adminFunctions) {
      const functionName = func.split(" ")[1].split("(")[0];
      
      if (functionName.includes("upgrade") || !functionName.endsWith(")")) {
        console.log(`Skipping non-view function: ${functionName}`);
        continue;
      }
      
      console.log(`Checking ${functionName}...`);
      try {
        const result = await adminContract[functionName]();
        console.log(`${functionName} result: ${result}`);
      } catch (error) {
        console.log(`${functionName} error: ${error.message}`);
      }
    }
    
    // Try to get and log contract state
    console.log("\nAttempting to read contract state...");
    
    // Try to get implementation without proxy forwarding
    try {
      // Access storage slot directly
      const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
      const implData = await ethers.provider.getStorage(PROXY_ADDRESS, implementationSlot);
      console.log(`Implementation from storage: 0x${implData.substring(26)}`);
    } catch (error) {
      console.log(`Error getting implementation from storage: ${error.message}`);
    }
    
    // Try to initialize one more time 
    console.log("\nAttempting initialization again with different parameters...");
    const initABI = ["function initialize(address,uint256,address,address,bool,address,uint256)"];
    const initContract = new ethers.Contract(PROXY_ADDRESS, initABI, deployer);
    
    try {
      const initTx = await initContract.initialize(
        deployer.address, // initialOwner - using deployer account directly
        250, // initialDefaultFeePercentage (2.5%)
        deployer.address, // initialFeeRecipient - using deployer account directly
        "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
        false, // initialRoyaltiesDisabled
        "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
        32323, // chainId
        {
          gasLimit: 1000000
        }
      );
      
      console.log(`Initialization tx: ${initTx.hash}`);
      
      const receipt = await initTx.wait();
      console.log(`Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      console.log(`Initialization error: ${error.message}`);
      
      // Since initialization is failing, let's check storage slots directly
      // Common storage slots in upgradeable contracts
      console.log("\nReading storage slots directly...");
      
      // Check first few storage slots to see what's inside
      for (let i = 0; i < 10; i++) {
        try {
          const slot = ethers.toBeHex(i);
          const data = await ethers.provider.getStorage(PROXY_ADDRESS, slot);
          console.log(`Slot ${i}: ${data}`);
        } catch (error) {
          console.log(`Error reading slot ${i}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Interaction failed:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 