const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying proxy...");
  
  // Implementation address on BasedAI
  const IMPLEMENTATION_ADDRESS = "0x0bA94EE4F91203471A37C2cC36be04872671C22e";
  
  // Create initialization data for the initialize function
  const ABI = ["function initialize(address,uint256,address,address,bool,address,uint256)"];
  const interface = new ethers.Interface(ABI);
  
  const encodedInitData = interface.encodeFunctionData("initialize", [
    "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialOwner
    250, // initialDefaultFeePercentage (2.5%)
    "0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B", // initialFeeRecipient
    "0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21", // initialLifeNodesNFTContract
    false, // initialRoyaltiesDisabled
    "0x22456dA8e1CaCB25edBA86403267B4F13900AdF1", // initialAfterMintStorageAddress
    32323 // chainId
  ]);
  
  console.log("Initialization data:", encodedInitData);
  
  // Get the contract factory
  const ProxyFactory = await ethers.getContractFactory("MyERC1967Proxy");
  
  // Deploy with initialization data
  console.log("Deploying proxy with proper arguments...");
  const constructorArgs = [
    IMPLEMENTATION_ADDRESS,
    encodedInitData
  ];
  
  console.log("Constructor arguments:", constructorArgs);
  
  const proxy = await ProxyFactory.deploy(...constructorArgs);
  
  console.log("Waiting for deployment...");
  const receipt = await proxy.deploymentTransaction().wait();
  
  console.log(`Proxy deployed to: ${await proxy.getAddress()}`);
  console.log(`Transaction hash: ${receipt.hash}`);
  console.log("Proxy initialized during deployment!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
