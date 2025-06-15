# NFT Marketplace Development Plan (Based on AMM.sol and MarketplaceStorage.sol)

## 1. Project Setup & Refinements

*   **Rename `AMM.sol`**: Rename to `Marketplace.sol` for clarity.
*   **Review `MarketplaceStorage.sol`**:
    *   It currently stores historical data.
    *   Assess if active marketplace data (listings, offers) should also be moved here for better separation of concerns and to simplify `Marketplace.sol`, or if `Marketplace.sol` should continue to manage its own active state. For now, assume active state remains in `Marketplace.sol` and `MarketplaceStorage.sol` is for historical/analytics.
    *   Ensure `Marketplace.sol` correctly calls `MarketplaceStorage.sol` to record all relevant events (listings, cancellations, sales, offers, offer updates).
*   **Chain Information**:
    *   Network Name: BasedAI
    *   RPC URL: `https://mainnet.basedaibridge.com/rpc/`
    *   Chain ID: 32323
    *   Symbol: BASED
    *   Explorer: `https://explorer.bf1337.org/`
    *   LifeNodes NFT Contract: `0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21`

## 2. Core `Marketplace.sol` Enhancements

### 2.1. Listing Management
    *   **Data Structures**:
        *   `Listing` struct (already present in `AMM.sol`):
            ```solidity
            struct Listing {
                address seller;
                uint256 price; // in $BASED or specified payment token
                uint64 listedAt;
                uint64 expiresAt;      // 0 for no expiration
                address privateBuyer;  // address(0) for public
                address paymentToken; // address(0) for native $BASED, or ERC20 token address
            }
            ```
        *   `listings`: `mapping(address nftContract => mapping(uint256 tokenId => Listing)) public listings;` (already present)
    *   **Functions**:
        *   `listNFT(address nftContract, uint256 tokenId, uint256 price, uint64 expirationTimestamp, address targetBuyer, address paymentToken)`
            *   `expirationTimestamp`: 0 for no expiry.
            *   `targetBuyer`: `address(0)` for public.
            *   `paymentToken`: `address(0)` for $BASED, else ERC20 contract address.
            *   Requires NFT approval to marketplace.
            *   Emits `ListingCreated` (and potentially specific events for private/expiring).
            *   Records in `MarketplaceStorage.sol`.
        *   `cancelListing(address nftContract, uint256 tokenId)`
            *   Only seller or contract owner (if emergency).
            *   Emits `ListingCancelled`.
            *   Updates status in `MarketplaceStorage.sol`.
        *   `updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice)`
            *   Only seller.
            *   Emits `ListingPriceUpdated`.
            *   Updates record in `MarketplaceStorage.sol`.

### 2.2. Purchasing
    *   **Functions**:
        *   `buyNFT(address nftContract, uint256 tokenId)` payable (for $BASED)
        *   `buyNFTWithToken(address nftContract, uint256 tokenId, address paymentToken, uint256 maxPrice)` (for ERC20, user approves marketplace for token)
            *   Handles public, private (check `msg.sender == privateBuyer`), and expired listings.
            *   Calculates marketplace fee (considering global, collection-specific, LifeNodes, and subscription discounts).
            *   Calculates and handles ERC2981 royalties.
            *   Transfers NFT to buyer.
            *   Distributes funds (seller, fee recipient, royalty recipient).
            *   Emits `NFTSold`.
            *   Records sale in `MarketplaceStorage.sol`.

### 2.3. Offer System (Bidding)
    *   **Data Structures**:
        *   `Offer` struct (already present in `AMM.sol`):
            ```solidity
            struct Offer {
                address bidder;
                uint256 amount;         // in $BASED or specified payment token
                uint64 createdAt;
                uint64 expiresAt;      // Mandatory, between 1h and 30 days from now
                address paymentToken; // address(0) for $BASED, or ERC20 token address
            }
            ```
        *   `offers`: `mapping(address nftContract => mapping(uint256 tokenId => mapping(address bidder => Offer))) public offers;` (already present, consider if a list of offers per NFT is better for UI, e.g., `mapping(address nftContract => mapping(uint256 tokenId => Offer[])) public nftOffers;` - requires managing array). For now, stick to existing.
        *   Users making offers with ERC20 tokens must have approved the marketplace to spend their tokens. For $BASED offers, the $BASED can be escrowed by the marketplace contract.
    *   **Functions**:
        *   `makeOffer(address nftContract, uint256 tokenId, uint256 amount, uint64 expirationTimestamp, address paymentToken)` (payable if `paymentToken` is `address(0)`)
            *   `expirationTimestamp` must be within 1h to 30 days.
            *   If `paymentToken` is $BASED, contract escrows `amount`.
            *   If `paymentToken` is ERC20, bidder must have approved marketplace for `amount`.
            *   Emits `OfferCreated`.
            *   Records in `MarketplaceStorage.sol`.
        *   `cancelOffer(address nftContract, uint256 tokenId)`
            *   Only bidder.
            *   Refunds escrowed $BASED if applicable.
            *   Emits `OfferCancelled`.
            *   Updates status in `MarketplaceStorage.sol`.
        *   `acceptOffer(address nftContract, uint256 tokenId, address bidder)`
            *   Only NFT owner.
            *   NFT must be approved to marketplace or marketplace has `setApprovalForAll`.
            *   Checks offer validity (not expired, bidder has funds/allowance).
            *   Performs sale logic (fees, royalties, transfer NFT, transfer payment).
            *   Emits `OfferAccepted` (could be same as `NFTSold` with a specific type).
            *   Records sale in `MarketplaceStorage.sol`.
            *   Invalidates/removes other offers for that NFT if necessary.
    *   **Trait-Based Offers**:
        *   Initial approach: UI assists users in finding NFTs with desired traits. Users then make *specific* offers on those `tokenIds` using the standard `makeOffer` function.
        *   The contract itself will not initially support generic "open offers for any NFT with X trait."

### 2.4. Fee Management
    *   **Default Fee**:
        *   `feePercentage`: `uint256` (e.g., 250 for 2.5%, as in `AMM.sol`).
        *   `feeRecipient`: `address`.
        *   Functions `setFeePercentage`, `setFeeRecipient` (already in `AMM.sol`).
    *   **Collection-Specific Fees**:
        *   `collectionFees`: `mapping(address nftContract => uint256 feeBps) public collectionSpecificFees;`
        *   `setCollectionFee(address nftContract, uint256 feeBps)` (onlyOwner)
        *   `removeCollectionFee(address nftContract)` (onlyOwner)
        *   Fee calculation logic needs to check for collection fee first, then default. Max fee of 10% (1000 bps) still applies.
    *   **LifeNodes NFT Discount**:
        *   `lifeNodesNFTContract`: `IERC721 public lifeNodesNFTContract;` (update from `address` to `IERC721`)
        *   Target fee for LifeNodes holders: 1% (100 bps).
        *   Modify `getEffectiveFee` (or its equivalent) in `Marketplace.sol`:
            *   If `lifeNodesNFTContract.balanceOf(buyerOrBidder) > 0`, the fee for that transaction is 100 bps, *unless* a subscription or collection-specific fee offers an even lower rate.
    *   **Subscription Model**:
        *   **Data Structures**:
            ```solidity
            struct SubscriptionTier {
                uint256 price;          // Price in $BASED or specified token
                address paymentToken;   // Token for this tier's price
                uint64 durationSeconds; // e.g., 7*24*60*60 for 7 days
                uint256 feeBps;         // Fee for subscribers of this tier (e.g., 0 for no fees)
            }
            struct UserSubscription {
                uint256 tierId;
                uint64 expiresAt;
            }
            ```
        *   `subscriptionTiers`: `SubscriptionTier[] public subscriptionTiers;`
        *   `userSubscriptions`: `mapping(address user => UserSubscription) public userSubscriptions;`
        *   **Hardcoded Tiers (initially, using $BASED as paymentToken `address(0)`)**:
            1.  7 days, 1 $BASED (1e18 wei), 0 bps fee.
            2.  30 days, 7 $BASED (7e18 wei), 0 bps fee.
            3.  365 days, 30 $BASED (30e18 wei), 0 bps fee.
        *   **Functions**:
            *   `addSubscriptionTier(uint256 price, address paymentToken, uint64 durationSeconds, uint256 feeBps)` (onlyOwner)
            *   `updateSubscriptionTier(uint256 tierId, uint256 price, address paymentToken, uint64 durationSeconds, uint256 feeBps)` (onlyOwner)
            *   `purchaseSubscription(uint256 tierId)` (payable if $BASED, or requires token approval)
            *   `getUserSubscriptionStatus(address user) returns (bool isActive, uint64 expiresAt, uint256 feeBps)`
        *   Fee calculation logic needs to check for active subscription and apply its `feeBps` if it's the most favorable. Order of precedence for fees (lowest applies): Subscription -> LifeNode -> Collection-Specific -> Default.

### 2.5. Floor Sweeping
    *   **Function**: `sweepFloor(address nftContract, uint8 count, uint256 maxTotalPrice)` payable (for $BASED). Max `count` is 10, min 2.
    *   **Challenge**: Efficiently finding the `count` cheapest NFTs on-chain.
        *   **Initial Simplification**: This function might be very gas-intensive if it has to iterate many listings.
        *   A more robust solution might involve off-chain indexing to identify the cheapest items, then passing their `tokenIds` to a `batchBuyNFTs(address nftContract, uint256[] tokenIds, uint256 maxTotalPrice)` function.
        *   For V1, `sweepFloor` could iterate a limited number of listings or rely on users/bots to find the cheapest ones and call a batch buy function.
        *   Given the constraints, if implementing `sweepFloor` directly, it will need to iterate active listings for the given `nftContract`. The `listings` mapping is not sorted. This is a complex feature to make gas-efficient.
        *   **Alternative**: A function `buyMultipleNFTs(address nftContract, uint256[] calldata tokenIdsToBuy)` where the client identifies the floor NFTs. This shifts discovery off-chain.

### 2.6. Contract Features
    *   **Upgradeable**: UUPS (already in place).
    *   **Emergency Pause**: Pausable (already in place).
    *   **Reentrancy Guard**: (already in place).
    *   **ERC721Receiver**: Implement `onERC721Received` if the marketplace ever needs to hold NFTs directly (e.g., for escrow in certain complex scenarios, though approval method is generally preferred). The current `AMM.sol` does not seem to implement `ERC721HolderUpgradeable`, implying it uses approvals, which is good.

## 3. `MarketplaceStorage.sol` Enhancements

*   **Review Structs**:
    *   `HistoricalSale`, `HistoricalListing`, `HistoricalOffer` are good. Ensure they capture all necessary fields including `paymentToken`, any discount types applied.
*   **Functions**:
    *   `recordListing`: Ensure `expiresAt`, `privateBuyer`, `paymentToken` are parameters.
    *   `updateListingStatus`: Add parameters for updates like price changes, expiration changes if allowed.
    *   `recordOffer`: Ensure `paymentToken`, `expiresAt` are parameters.
    *   `updateOfferStatus`: For cancellations, acceptances.
    *   `recordSale`: Ensure `paymentToken`, `fee`, `saleType` (Regular, OfferAccepted, PrivateSale) are parameters.
*   **Data for Stats**:
    *   The current array-based storage with index mappings is good for querying history.
    *   `collectionSales`, `userBuys`, `userSells` will help with analytics.
    *   On-chain calculation of `volume`, `highestSale`, `floor` can be gas-intensive. `MarketplaceStorage` can provide raw data for off-chain services to compute these.
    *   Floor price: Not directly stored. Best computed off-chain from active listings in `Marketplace.sol`.
    *   Collection Volume: `mapping(address nftContract => uint256 totalVolume)` could be added and updated with each sale.
    *   Collection Highest Sale: `mapping(address nftContract => uint256 highestSalePrice)` could be added.

## 4. Other Considerations

*   **Events**: Emit comprehensive events for all state changes to support off-chain indexing for UI (activity, holders, offers, stats, trending collections).
*   **Gas Efficiency**: Pay attention to loops and storage access, especially for features like floor sweeping or stat calculation.
*   **Security**: Follow best practices, use ReentrancyGuard, check for correct callers, validate inputs.
*   **Off-Chain Components**:
    *   UI will rely heavily on events.
    *   Explorer APIs (`explorer.bf1337.org/api-docs`) for NFT metadata, trait data.
    *   Your full node can be used for a dedicated indexer if explorer APIs are insufficient for real-time stats, trending, floor prices.
*   **Trending/Top Collections**: This logic will primarily live off-chain, based on volume, sales count, unique users, etc., over time. The smart contract might have a feature for the owner to *pin* or *highlight* collections based on off-chain analysis.

## 5. Development Phases (High-Level)

1.  **Phase 1: Foundation & Core Trading**
    *   Refactor `AMM.sol` to `Marketplace.sol`.
    *   Implement robust listing (public, private, expiration, $BASED payment).
    *   Implement robust buying ($BASED payment).
    *   Integrate with `MarketplaceStorage.sol` for historical recording.
    *   Basic fee structure (default fee).
    *   LifeNodes NFT 1% fee.
    *   Pausable, Upgradeable.
2.  **Phase 2: Offers & Advanced Fees**
    *   Offer system (make, cancel, accept for $BASED offers, escrow $BASED).
    *   Collection-specific fees.
3.  **Phase 3: Subscriptions & ERC20 Support**
    *   Subscription model (tiers, purchase, fee benefits - initially with $BASED).
    *   Extend listing, buying, offers to support specified ERC20 payment tokens.
4.  **Phase 4: Advanced Features & Analytics Support**
    *   Floor sweeping (consider `buyMultipleNFTs` first for simplicity).
    *   On-chain support for collection stats (e.g., `totalVolume`, `highestSalePrice` in `MarketplaceStorage.sol`).
    *   Refine events for rich off-chain indexing.
5.  **Phase 5: Iteration & Optimization**
    *   Gas optimization.
    *   Security audits.
    *   Further enhancements based on feedback.

This plan provides a detailed roadmap. We will start by modifying `AMM.sol` (to be `Marketplace.sol`) and `MarketplaceStorage.sol` according to Phase 1, focusing on getting the core listing/buying functionality robust with the new fee structures and requirements.
