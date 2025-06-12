const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying ERC1967 proxy deployment...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Addresses
  const PROXY_ADDRESS = "0x22C36b769cef9E54051765F20E81ECDe121f3ee2";
  const EXPECTED_IMPLEMENTATION = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  
  console.log(`Proxy Address: ${PROXY_ADDRESS}`);
  console.log(`Expected Implementation: ${EXPECTED_IMPLEMENTATION}`);

  try {
    // ERC1967 implementation slot (standard for upgradeable proxies)
    // _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
    const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    
    // Get the implementation address directly from storage
    const implementationData = await ethers.provider.getStorage(PROXY_ADDRESS, implementationSlot);
    
    // Convert storage data to address (implementation addresses are stored at the end of the 32-byte slot)
    const implementationAddress = "0x" + implementationData.substring(26);
    
    console.log(`\nActual Implementation: ${implementationAddress}`);
    console.log(`Implementation Match: ${implementationAddress.toLowerCase() === EXPECTED_IMPLEMENTATION.toLowerCase()}`);
    
    // Get storage if possible
    try {
      // Admin slot (for transparent upgradeable proxies)
      const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
      const adminData = await ethers.provider.getStorage(PROXY_ADDRESS, adminSlot);
      const adminAddress = "0x" + adminData.substring(26);
      console.log(`Admin Address: ${adminAddress}`);
    } catch (error) {
      console.log("Could not determine admin address");
    }
    
    // Try to verify if we can interact with the contract
    try {
      // Simple ABI to check if contract responds
      const minimalABI = [
        "function owner() view returns (address)"
      ];
      
      const proxyContract = new ethers.Contract(PROXY_ADDRESS, minimalABI, deployer);
      const owner = await proxyContract.owner();
      console.log(`\nOwner from contract call: ${owner}`);
      
      if (owner === ethers.ZeroAddress) {
        console.log("⚠️ Owner is zero address - contract may not be properly initialized");
      }
    } catch (error) {
      console.log(`\nCould not interact with contract: ${error.message}`);
    }
    
    console.log("\nNext steps:");
    console.log("1. If implementation is correct but contract isn't working, it may need to be initialized");
    console.log("2. You can try calling initialize() directly on the proxy address");
    
  } catch (error) {
    console.error("Verification failed:");
    console.error(error.message);
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 