// Script to update subscription tier prices in the AfterMintMarketplace contract
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting update of subscription tier prices...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Updating with the account:", deployer.address);

  // Get the deployed AfterMintMarketplace contract
  const marketplaceAddress = "0xEdD719ECA832b667ec537D9c4d9e846FEAee7Ccc"; // Replace with actual address if different
  const AfterMintMarketplace = await ethers.getContractFactory("AfterMintMarketplace");
  const marketplace = await AfterMintMarketplace.attach(marketplaceAddress);

  console.log("Connected to marketplace at", marketplaceAddress);

  // Set the new subscription tier prices
  try {
    // We need to create a function to update the tiers
    // Since there's no direct method to modify existing tiers, we'll need to add a function to the contract
    // For now, we'll print instructions since we would need to upgrade the contract
    
    console.log("\nNOTE: To update subscription tier prices, we need to upgrade the contract with a function like:");
    console.log(`
    function updateSubscriptionTierPrice(uint256 tierId, uint256 newPrice) external onlyOwner {
        require(tierId < subscriptionTiers.length, "Invalid tier ID");
        
        subscriptionTiers[tierId].price = newPrice;
        
        emit SubscriptionTierUpdated(
            tierId,
            newPrice,
            subscriptionTiers[tierId].paymentToken,
            subscriptionTiers[tierId].durationSeconds,
            subscriptionTiers[tierId].feeBps,
            subscriptionTiers[tierId].isActive
        );
    }
    `);
    
    console.log("\nNew prices to set:");
    console.log("Tier 0 (7 days): 5,000 BASED (5000 ether)");
    console.log("Tier 1 (30 days): 15,000 BASED (15000 ether)");
    console.log("Tier 2 (365 days): 77,000 BASED (77000 ether)");
    
    console.log("\nAlternatively, you can deploy a new implementation with updated _initializeSubscriptionTiers function.");
    
  } catch (error) {
    console.error("Error updating subscription tiers:", error);
    process.exit(1);
  }

  console.log("Subscription tier price update instructions complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 