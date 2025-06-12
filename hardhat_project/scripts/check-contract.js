const { ethers } = require("hardhat");

async function main() {
  console.log("Checking marketplace proxy contract...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // From the screenshot, this is the contract address created in block 1343081
  const CONTRACT_ADDRESS = "0x22C36b769cef9E54051765F20E81ECDe121f3ee2";
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  
  try {
    // Try to get the contract code first to verify it exists
    console.log("Getting contract code...");
    const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
    
    if (code === "0x") {
      console.log("❌ No code at this address - contract not deployed");
      return;
    }
    
    console.log(`✅ Contract exists (code length: ${(code.length - 2) / 2} bytes)`);
    
    // Try common proxy patterns
    const implementationSlots = [
      // ERC1967 proxy
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
      // OpenZeppelin TransparentUpgradeableProxy & AdminUpgradeabilityProxy
      "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
      // Minimal proxy (clone)
      "0x00"
    ];
    
    console.log("\nChecking proxy implementation slots:");
    for (const slot of implementationSlots) {
      try {
        const data = await ethers.provider.getStorage(CONTRACT_ADDRESS, slot);
        console.log(`Slot ${slot}: ${data}`);
        
        if (data && data !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          // Extract potential address from the data
          const potentialAddress = "0x" + data.substring(26);
          if (potentialAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
            console.log(`Potential implementation: ${potentialAddress}`);
          }
        }
      } catch (error) {
        console.log(`Error reading slot ${slot}: ${error.message}`);
      }
    }
    
    // Try to interact with contract as marketplace
    console.log("\nTrying to interact with contract as marketplace:");
    const marketplaceABI = [
      "function owner() view returns (address)",
      "function getDefaultFeePercentage() view returns (uint256)",
      "function getFeeRecipient() view returns (address)",
      "function getLifeNodesNFTContract() view returns (address)",
      "function getRoyaltiesDisabled() view returns (bool)",
      "function getStorageContract() view returns (address)"
    ];
    
    const marketplace = new ethers.Contract(CONTRACT_ADDRESS, marketplaceABI, deployer);
    
    try {
      const owner = await marketplace.owner();
      console.log(`Owner: ${owner}`);
    } catch (error) {
      console.log(`Error reading owner: ${error.message}`);
    }
    
    // Try to verify the bytecode
    console.log("\nBytecode analysis:");
    if (code.length > 100) {
      console.log(`Bytecode first 100 bytes: ${code.substring(0, 100)}...`);
      
      // Check for minimal proxy pattern (EIP-1167)
      if (code.startsWith("0x363d3d373d3d3d363d73")) {
        console.log("✅ Bytecode matches minimal proxy pattern (EIP-1167)");
        
        // Extract target contract address from minimal proxy
        const targetStart = 2 + 10 * 2; // 0x + 10 bytes
        const targetAddress = "0x" + code.substring(targetStart, targetStart + 40).toLowerCase();
        console.log(`Minimal proxy target: ${targetAddress}`);
        
        // Check if this matches our expected implementation
        const expectedImplementation = "0x0bA94EE4F91203471A37C2cC36be04872671C22e".toLowerCase();
        console.log(`Expected implementation: ${expectedImplementation}`);
        console.log(`Implementation match: ${targetAddress === expectedImplementation}`);
      } else {
        console.log("❌ Not a minimal proxy");
      }
    }
    
    console.log("\nAnalysis complete!");
  } catch (error) {
    console.error("Contract check failed:");
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 