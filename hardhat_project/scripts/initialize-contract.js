const { ethers } = require("hardhat");

async function main() {
  console.log("Initializing marketplace contract...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Connected with: ${deployer.address}`);
  
  // Contract address
  const CONTRACT_ADDRESS = "0x22C36b769cef9E54051765F20E81ECDe121f3ee2";
  console.log(`Target Contract: ${CONTRACT_ADDRESS}`);
  
  try {
    // Define initialization ABI
    const initABI = [
      "function initialize(address,uint256,address,address,bool,address,uint256)"
    ];
    
    // Connect to contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, initABI, deployer);
    
    // Call initialize
    console.log("Calling initialize function...");
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
    
    console.log(`Initialization complete!`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
    
  } catch (error) {
    console.error("Initialization failed:");
    console.error(`Error message: ${error.message}`);
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 