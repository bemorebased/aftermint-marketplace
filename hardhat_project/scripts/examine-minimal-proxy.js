const { ethers } = require("hardhat");

async function main() {
  console.log("Examining minimal proxy contract in detail...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Contract address from the last transaction
  const CONTRACT_ADDRESS = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc";
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  
  try {
    // Get the contract code
    const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
    console.log(`Contract code size: ${(code.length - 2) / 2} bytes`);
    console.log(`Full bytecode: ${code}`);
    
    // Check if this is a minimal proxy (EIP-1167)
    if (code.startsWith("0x363d3d373d3d3d363d73")) {
      console.log("\n✅ This is a minimal proxy (EIP-1167)");
      
      // Extract target address from bytecode
      const targetStart = 2 + 10 * 2; // 0x + 10 bytes
      const targetAddress = "0x" + code.substring(targetStart, targetStart + 40).toLowerCase();
      console.log(`Target implementation: ${targetAddress}`);
      
      const expectedImplementation = "0x0bA94EE4F91203471A37C2cC36be04872671C22e".toLowerCase();
      console.log(`Expected implementation: ${expectedImplementation}`);
      console.log(`Correct implementation: ${targetAddress === expectedImplementation}`);
      
      if (targetAddress === expectedImplementation) {
        console.log(`\nThe minimal proxy is correctly pointing to the implementation contract!`);
        
        // Try to initialize it
        console.log("\nAttempting to initialize the minimal proxy...");
        const initABI = ["function initialize(address,uint256,address,address,bool,address,uint256)"];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, initABI, deployer);
        
        try {
          const initTx = await contract.initialize(
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
          console.log("Waiting for confirmation...");
          
          const receipt = await initTx.wait();
          console.log(`Initialization status: ${receipt.status === 1 ? "Success" : "Failed"}`);
          console.log(`Gas used: ${receipt.gasUsed.toString()}`);
          
          // Verify initialization
          console.log("\nVerifying initialization...");
          const marketplaceABI = [
            "function owner() view returns (address)",
            "function getDefaultFeePercentage() view returns (uint256)",
            "function getFeeRecipient() view returns (address)",
            "function getLifeNodesNFTContract() view returns (address)",
            "function getRoyaltiesDisabled() view returns (bool)",
            "function getStorageContract() view returns (address)"
          ];
          
          const marketplace = new ethers.Contract(CONTRACT_ADDRESS, marketplaceABI, deployer);
          console.log(`Owner: ${await marketplace.owner()}`);
          
          const feePercentage = await marketplace.getDefaultFeePercentage();
          console.log(`Fee: ${feePercentage} (${feePercentage / 100}%)`);
          
          console.log(`Fee recipient: ${await marketplace.getFeeRecipient()}`);
          console.log(`LifeNodes NFT: ${await marketplace.getLifeNodesNFTContract()}`);
          console.log(`Royalties disabled: ${await marketplace.getRoyaltiesDisabled()}`);
          console.log(`Storage contract: ${await marketplace.getStorageContract()}`);
          
          console.log("\n🎉 SUCCESS: Your marketplace is properly deployed and initialized!");
          console.log(`Marketplace address: ${CONTRACT_ADDRESS}`);
        } catch (error) {
          console.log(`\n❌ Initialization failed: ${error.message}`);
          
          // Check if already initialized
          console.log("\nChecking if already initialized...");
          
          try {
            const marketplaceABI = [
              "function owner() view returns (address)",
              "function getDefaultFeePercentage() view returns (uint256)"
            ];
            
            const marketplace = new ethers.Contract(CONTRACT_ADDRESS, marketplaceABI, deployer);
            const owner = await marketplace.owner();
            console.log(`Owner: ${owner}`);
            
            if (owner !== "0x0000000000000000000000000000000000000000") {
              console.log("✅ Contract appears to be already initialized!");
              
              // Get more data
              try {
                const feePercentage = await marketplace.getDefaultFeePercentage();
                console.log(`Fee: ${feePercentage} (${feePercentage / 100}%)`);
                
                console.log("\n🎉 Good news! Your marketplace is already properly initialized!");
                console.log(`Marketplace address: ${CONTRACT_ADDRESS}`);
              } catch (error) {
                console.log(`Error getting fee: ${error.message}`);
              }
            } else {
              console.log("❌ Contract owner is still zero address - not properly initialized");
            }
          } catch (error) {
            console.log(`Error checking initialization: ${error.message}`);
          }
        }
      }
    } else {
      console.log("\n❌ Not a minimal proxy");
      console.log("This contract does not appear to be a properly deployed proxy");
    }
  } catch (error) {
    console.error("Examination failed:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 