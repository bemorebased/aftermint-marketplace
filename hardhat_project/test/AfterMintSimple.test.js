const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AfterMint Contracts Basic Test", function() {
  let owner, feeRecipient, seller, buyer;
  let afterMintStorage, afterMintMarketplace;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const DEFAULT_FEE_BPS = 250; // 2.5%
  const BASED_CHAIN_ID = 32323;

  beforeEach(async function() {
    // Get signers
    [owner, feeRecipient, seller, buyer] = await ethers.getSigners();
    
    // Deploy contracts using upgradeableProxy
    const AfterMintStorage = await ethers.getContractFactory("AfterMintStorage");
    afterMintStorage = await upgrades.deployProxy(AfterMintStorage, [owner.address], {
      initializer: 'initialize'
    });
    
    const AfterMintMarketplace = await ethers.getContractFactory("AfterMintMarketplace");
    afterMintMarketplace = await upgrades.deployProxy(
      AfterMintMarketplace, 
      [
        owner.address,
        DEFAULT_FEE_BPS,
        feeRecipient.address,
        ZERO_ADDRESS, // No LifeNodes contract
        afterMintStorage.address,
        BASED_CHAIN_ID
      ],
      { initializer: 'initialize' }
    );
    
    // Configure storage to recognize marketplace
    await afterMintStorage.setMarketplaceContract(afterMintMarketplace.address);
  });

  it("Should initialize AfterMintStorage correctly", async function() {
    expect(await afterMintStorage.owner()).to.equal(owner.address);
    expect(await afterMintStorage.marketplaceContract()).to.equal(afterMintMarketplace.address);
  });

  it("Should initialize AfterMintMarketplace correctly", async function() {
    expect(await afterMintMarketplace.owner()).to.equal(owner.address);
    expect(await afterMintMarketplace.defaultFeePercentage()).to.equal(DEFAULT_FEE_BPS);
    expect(await afterMintMarketplace.feeRecipient()).to.equal(feeRecipient.address);
    expect(await afterMintMarketplace.operationalChainId()).to.equal(BASED_CHAIN_ID);
    expect(await afterMintMarketplace.afterMintStorage()).to.equal(afterMintStorage.address);
  });
}); 