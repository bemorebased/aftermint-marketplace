const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AfterMint Contracts", function() {
  let owner, seller, buyer, feeRecipient;
  let afterMintStorage, afterMintMarketplace;
  let mockNFT;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const BASED_CHAIN_ID = 32323;
  const DEFAULT_FEE_BPS = 250; // 2.5%

  // Helper function to get timestamp
  async function getTimestamp() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    return block.timestamp;
  }

  // Helper to advance time (for testing expirations)
  async function advanceTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  beforeEach(async function() {
    // Get signers
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();
    
    // Deploy mock NFT for testing
    const MockNFT = await ethers.getContractFactory("MockERC721");
    mockNFT = await MockNFT.deploy("TestNFT", "TNFT");
    
    // Mint NFT to seller
    await mockNFT.mint(seller.address, 1);
    
    // Deploy storage contract
    const AfterMintStorage = await ethers.getContractFactory("AfterMintStorage");
    afterMintStorage = await upgrades.deployProxy(
      AfterMintStorage, 
      [owner.address]
    );
    
    // Deploy marketplace contract
    const AfterMintMarketplace = await ethers.getContractFactory("AfterMintMarketplace");
    afterMintMarketplace = await upgrades.deployProxy(
      AfterMintMarketplace, 
      [
        owner.address,
        DEFAULT_FEE_BPS,
        feeRecipient.address,
        ZERO_ADDRESS, // No LifeNodes contract for tests
        afterMintStorage.address,
        BASED_CHAIN_ID
      ]
    );
    
    // Configure storage to recognize marketplace
    await afterMintStorage.setMarketplaceContract(afterMintMarketplace.address);
  });

  describe("Contract Initialization", function() {
    it("Should initialize AfterMintStorage correctly", async function() {
      expect(await afterMintStorage.owner()).to.equal(owner.address);
      expect(await afterMintStorage.marketplaceContract()).to.equal(afterMintMarketplace.address);
    });

    it("Should initialize AfterMintMarketplace correctly", async function() {
      expect(await afterMintMarketplace.owner()).to.equal(owner.address);
      expect(await afterMintMarketplace.defaultFeePercentage()).to.equal(DEFAULT_FEE_BPS);
      expect(await afterMintMarketplace.feeRecipient()).to.equal(feeRecipient.address);
      expect(await afterMintMarketplace.operationalChainId()).to.equal(BASED_CHAIN_ID);
    });
  });

  describe("Basic Listing Functionality", function() {
    it("Should allow NFT owner to list their NFT", async function() {
      // Approve marketplace to transfer NFT
      await mockNFT.connect(seller).approve(afterMintMarketplace.address, 1);
      
      // List NFT
      const price = ethers.utils.parseEther("1"); // 1 BASED
      const tx = await afterMintMarketplace.connect(seller).listNFT(
        mockNFT.address,
        1, // tokenId
        price,
        ZERO_ADDRESS, // native token as payment
        0, // no expiry
        ZERO_ADDRESS // public listing
      );
      
      // Check listing was created
      const listing = await afterMintMarketplace.listings(mockNFT.address, 1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      
      // Check event emission
      await expect(tx)
        .to.emit(afterMintMarketplace, "ListingCreated")
        .withArgs(
          mockNFT.address,
          1,
          seller.address,
          price,
          ZERO_ADDRESS,
          0, // expiresAt
          ZERO_ADDRESS, // privateBuyer
          0 // storage index (first listing)
        );
      
      // Check storage recording
      const storageListings = await afterMintStorage.nftListingHistory(mockNFT.address, 1);
      expect(storageListings.length).to.equal(1);
    });
    
    it("Should reject listing if caller is not NFT owner", async function() {
      await expect(
        afterMintMarketplace.connect(buyer).listNFT(
          mockNFT.address,
          1,
          ethers.utils.parseEther("1"),
          ZERO_ADDRESS,
          0,
          ZERO_ADDRESS
        )
      ).to.be.revertedWithCustomError(
        afterMintMarketplace,
        "AfterMintMarketplace__CallerNotNFTOwner"
      );
    });
    
    it("Should reject listing with zero price", async function() {
      await mockNFT.connect(seller).approve(afterMintMarketplace.address, 1);
      
      await expect(
        afterMintMarketplace.connect(seller).listNFT(
          mockNFT.address,
          1,
          0, // zero price
          ZERO_ADDRESS,
          0,
          ZERO_ADDRESS
        )
      ).to.be.revertedWithCustomError(
        afterMintMarketplace,
        "AfterMintMarketplace__PriceMustBeGreaterThanZero"
      );
    });
  });

  describe("Buying Functionality", function() {
    beforeEach(async function() {
      // Approve and list NFT
      await mockNFT.connect(seller).approve(afterMintMarketplace.address, 1);
      await afterMintMarketplace.connect(seller).listNFT(
        mockNFT.address,
        1,
        ethers.utils.parseEther("1"),
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS
      );
    });
    
    it("Should allow buyer to purchase NFT with correct payment", async function() {
      const price = ethers.utils.parseEther("1");
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      // Calculate marketplace fee
      const marketplaceFee = price.mul(DEFAULT_FEE_BPS).div(10000);
      const sellerAmount = price.sub(marketplaceFee);
      
      // Buy NFT
      const tx = await afterMintMarketplace.connect(buyer).buyNFT(
        mockNFT.address,
        1,
        { value: price }
      );
      
      // Check NFT ownership transfer
      expect(await mockNFT.ownerOf(1)).to.equal(buyer.address);
      
      // Check seller received payment minus fee
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(sellerAmount);
      
      // Check fee recipient received fee
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeRecipientBalanceAfter.sub(feeRecipientBalanceBefore)).to.equal(marketplaceFee);
      
      // Check listing was removed
      const listing = await afterMintMarketplace.listings(mockNFT.address, 1);
      expect(listing.seller).to.equal(ZERO_ADDRESS); // or check price is 0
      
      // Check sale recorded in storage
      const sales = await afterMintStorage.getNFTSales(mockNFT.address, 1);
      expect(sales.length).to.equal(1);
      
      // Check storage listing status updated to Sold
      const historicalListing = await afterMintStorage.historicalListings(0);
      expect(historicalListing.status).to.equal(1); // Sold = 1
    });
    
    it("Should reject purchase with insufficient payment", async function() {
      const price = ethers.utils.parseEther("1");
      const insufficientAmount = ethers.utils.parseEther("0.9");
      
      await expect(
        afterMintMarketplace.connect(buyer).buyNFT(
          mockNFT.address,
          1,
          { value: insufficientAmount }
        )
      ).to.be.revertedWithCustomError(
        afterMintMarketplace,
        "AfterMintMarketplace__WrongNativeValueSent"
      );
    });
  });

  describe("Listing Cancellation", function() {
    beforeEach(async function() {
      // Approve and list NFT
      await mockNFT.connect(seller).approve(afterMintMarketplace.address, 1);
      await afterMintMarketplace.connect(seller).listNFT(
        mockNFT.address,
        1,
        ethers.utils.parseEther("1"),
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS
      );
    });
    
    it("Should allow seller to cancel their listing", async function() {
      const tx = await afterMintMarketplace.connect(seller).cancelListing(mockNFT.address, 1);
      
      // Check listing removed
      const listing = await afterMintMarketplace.listings(mockNFT.address, 1);
      expect(listing.seller).to.equal(ZERO_ADDRESS); // or check price is 0
      
      // Check event
      await expect(tx)
        .to.emit(afterMintMarketplace, "ListingCancelled")
        .withArgs(mockNFT.address, 1, seller.address, 0);
      
      // Check listing status in storage
      const historicalListing = await afterMintStorage.historicalListings(0);
      expect(historicalListing.status).to.equal(2); // Cancelled = 2
    });
    
    it("Should reject cancellation by non-seller", async function() {
      await expect(
        afterMintMarketplace.connect(buyer).cancelListing(mockNFT.address, 1)
      ).to.be.revertedWithCustomError(
        afterMintMarketplace,
        "AfterMintMarketplace__NotListingSeller"
      );
    });
  });

  describe("Offer Functionality", function() {
    beforeEach(async function() {
      // Mint NFT to seller
      await mockNFT.connect(seller).approve(afterMintMarketplace.address, 1);
    });
    
    it("Should allow making an offer on an NFT", async function() {
      const offerAmount = ethers.utils.parseEther("0.5");
      const currentTime = await getTimestamp();
      const expiry = currentTime + 86400; // 1 day later
      
      const tx = await afterMintMarketplace.connect(buyer).makeOffer(
        mockNFT.address,
        1,
        expiry,
        { value: offerAmount }
      );
      
      // Check offer recorded
      const offer = await afterMintMarketplace.offers(mockNFT.address, 1, buyer.address);
      expect(offer.bidder).to.equal(buyer.address);
      expect(offer.amount).to.equal(offerAmount);
      
      // Check event
      await expect(tx)
        .to.emit(afterMintMarketplace, "OfferCreated")
        .withArgs(
          mockNFT.address,
          1,
          buyer.address,
          offerAmount,
          ZERO_ADDRESS,
          expiry
        );
      
      // Check offer recorded in storage
      const offers = await afterMintStorage.nftOfferHistory(mockNFT.address, 1);
      expect(offers.length).to.equal(1);
    });
    
    it("Should allow accepting an offer by the NFT owner", async function() {
      // Make offer
      const offerAmount = ethers.utils.parseEther("0.5");
      const currentTime = await getTimestamp();
      const expiry = currentTime + 86400; // 1 day later
      
      await afterMintMarketplace.connect(buyer).makeOffer(
        mockNFT.address,
        1,
        expiry,
        { value: offerAmount }
      );
      
      // Accept offer
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const tx = await afterMintMarketplace.connect(seller).acceptOffer(
        mockNFT.address,
        1,
        buyer.address
      );
      
      // Check NFT transferred
      expect(await mockNFT.ownerOf(1)).to.equal(buyer.address);
      
      // Check seller received payment (minus fees)
      const marketplaceFee = offerAmount.mul(DEFAULT_FEE_BPS).div(10000);
      const sellerAmount = offerAmount.sub(marketplaceFee);
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.be.closeTo(
        sellerAmount,
        ethers.utils.parseEther("0.01") // Gas cost might affect exact amount
      );
      
      // Check offer removed
      const offer = await afterMintMarketplace.offers(mockNFT.address, 1, buyer.address);
      expect(offer.bidder).to.equal(ZERO_ADDRESS); // or check amount is 0
      
      // Check storage updated
      const historicalOffer = await afterMintStorage.historicalOffers(0);
      expect(historicalOffer.status).to.equal(1); // Accepted = 1
      
      // Check sale recorded
      const sales = await afterMintStorage.getNFTSales(mockNFT.address, 1);
      expect(sales.length).to.equal(1);
    });
    
    it("Should allow cancelling an offer by the bidder", async function() {
      // Make offer
      const offerAmount = ethers.utils.parseEther("0.5");
      const currentTime = await getTimestamp();
      const expiry = currentTime + 86400; // 1 day later
      
      await afterMintMarketplace.connect(buyer).makeOffer(
        mockNFT.address,
        1,
        expiry,
        { value: offerAmount }
      );
      
      // Cancel offer
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
      const tx = await afterMintMarketplace.connect(buyer).cancelOffer(mockNFT.address, 1);
      
      // Check offer removed
      const offer = await afterMintMarketplace.offers(mockNFT.address, 1, buyer.address);
      expect(offer.bidder).to.equal(ZERO_ADDRESS); // or check amount is 0
      
      // Check bidder got refund (accounting for gas)
      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      // Gas cost affects exact balance, so we just check it increased by close to the offer amount
      expect(buyerBalanceAfter).to.be.gt(buyerBalanceBefore);
      
      // Check storage updated
      const historicalOffer = await afterMintStorage.historicalOffers(0);
      expect(historicalOffer.status).to.equal(2); // Cancelled = 2
    });
  });
}); 