const hre = require("hardhat");

async function main() {
  const NAME = "My Mock NFT";
  const SYMBOL = "MOCK";
  // This will be the base for token URIs.
  // It assumes your Next.js app runs on port 3000.
  // And we'll create an API route at /api/mock-metadata/[id]
  const BASE_URI = "http://localhost:3000/api/mock-metadata/";

  const MockNFT = await hre.ethers.getContractFactory("MockNFT");
  const mockNft = await MockNFT.deploy(NAME, SYMBOL, BASE_URI);
  await mockNft.waitForDeployment();

  const deployerAddress = await mockNft.runner.getAddress();
  console.log(`MockNFT deployed to: ${await mockNft.getAddress()}`);
  console.log(`   with Name: ${NAME}, Symbol: ${SYMBOL}, baseURI: "${BASE_URI}"`);
  console.log(`   Owner (and minter): ${deployerAddress}`);

  // Mint a few NFTs to the deployer
  const numToMint = 5;
  console.log(`\\nMinting ${numToMint} NFTs to ${deployerAddress}...`);
  for (let i = 0; i < numToMint; i++) {
    const mintTx = await mockNft.safeMint(deployerAddress);
    await mintTx.wait();
    console.log(`  Minted token ID: ${i}`);
  }
  console.log(`Minting complete. Owner of tokens 0-${numToMint-1} should be ${deployerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
