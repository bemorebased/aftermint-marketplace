// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./MarketplaceStorage.sol"; // Assuming MarketplaceStorage.sol is in the same directory
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title Marketplace
 * @dev An upgradeable and pausable marketplace for buying and selling NFTs.
 *      Manages active listings, offers, and facilitates trades.
 *      Interacts with MarketplaceStorage for historical data recording.
 */
contract Marketplace is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    // --- Structs ---

    // As per ammplan.md:
    // paymentToken: address(0) for native $BASED, or ERC20 token address
    // expiresAt: 0 for no expiration
    // privateBuyer: address(0) for public
    struct Listing {
        address seller;
        uint256 price;
        address paymentToken;
        uint64 listedAt;
        uint64 expiresAt;
        address privateBuyer;
        uint256 historicalListingIndex; // Added to store index from MarketplaceStorage
    }

    // Offer struct will be refined in a later phase as per ammplan.md
    struct Offer {
        address bidder;
        uint256 amount;
        address paymentToken; // For this phase, will be address(0) for $BASED
        uint64 createdAt;
        uint64 expiresAt;      // Mandatory, between 1h and 30 days from creation
        uint256 historicalOfferIndex; // Added to store index from MarketplaceStorage
    }

    // Sale struct from AMM.sol - likely to be used for event emission or internal tracking
    // Historical sales are primarily managed by MarketplaceStorage.sol
    struct Sale {
        address nftContract;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        address paymentToken; // Added for consistency
        uint256 fee;
        uint64 timestamp;
    }

    struct SubscriptionTier {
        uint256 price;          // Price in $BASED or specified token
        address paymentToken;   // Token for this tier's price (address(0) for $BASED)
        uint64 durationSeconds;
        uint16 feeBps;         // Fee for subscribers of this tier (e.g., 0 for no fees)
        bool isActive;         // So tiers can be deactivated by admin
    }

    struct UserSubscription {
        uint256 tierId;         // Index in subscriptionTiers array, refers to a snapshot of the tier
        uint64 expiresAt;
        uint16 feeBpsApplied;  // The feeBps that was active for the tier when subscribed
        // Note: Storing feeBpsApplied makes user subscription benefits fixed at time of purchase,
        // even if admin later changes the tier's feeBps. This is generally fairer.
    }

    // --- Constants ---

    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10% (1000 bps)
    uint8 public constant MAX_BATCH_BUY_COUNT = 10; // Max NFTs in a single buyMultipleNFTs call
    // uint256 public constant MAX_SALES_LIMIT = 100; // For getRecentSales, may remove if recentSales array is removed

    // --- State Variables ---

    // Marketplace Fees
    uint256 public defaultFeePercentage; // e.g., 250 for 2.5%
    address public feeRecipient;
    mapping(address => uint256) public collectionSpecificFees; // nftContract => feeBps

    // LifeNodes Discount
    IERC721 public lifeNodesNFTContract; // Changed from address to IERC721
    // The LifeNodes discount is not a percentage off, but a fixed 1% fee (100 BPS).
    // This will be handled in the _getEffectiveFeeBps logic.

    // Subscriptions
    SubscriptionTier[] public subscriptionTiers;
    mapping(address => UserSubscription) public userSubscriptions;

    // Royalties
    bool public royaltiesDisabled;

    // Listings and Offers (Active Data)
    mapping(address => mapping(uint256 => Listing)) public listings; // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers; // nftContract => tokenId => bidder => Offer
    mapping(address => uint256) public escrowedForOffers; // bidder => totalAmountEscrowedInNativeToken for $BASED offers

    // External Contracts
    MarketplaceStorage public marketplaceStorage;

    // Chain ID for discount bypass on testnet (if needed, otherwise mainnet logic applies)
    // uint256 public mainnetChainId; // Store the target mainnet Chain ID
    // The existing testnetChainId might be re-purposed or clarified.
    // For BasedAI, Chain ID: 32323. This should be the primary operational chain.
    uint256 public operationalChainId;


    // --- Events ---

    // Listing Events
    event ListingCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        address paymentToken,
        uint64 expiresAt,
        address privateBuyer,
        uint256 historicalListingIndex
    );
    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 historicalListingIndex
    );
    event ListingPriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newPrice
        // address paymentToken // If payment token can also be updated
    ); // Consider if paymentToken can be updated too

    // Sale Event (Emitted by this contract upon successful sale)
    event NFTSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price,
        address paymentToken,
        uint256 marketplaceFee,
        uint256 royaltyAmount,
        address royaltyRecipient // Can be address(0) if no royalty
    );

    // Offer Events (To be detailed in Offer System phase)
    event OfferCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount,
        address paymentToken,
        uint64 expiresAt
    );
    event OfferCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed bidder);
    // OfferAccepted can use NFTSold event with a specific type if needed, or its own event.

    // Fee Management Events
    event DefaultFeePercentageUpdated(uint256 newFeePercentage);
    event FeeRecipientUpdated(address indexed newFeeRecipient);
    event CollectionFeeSet(address indexed nftContract, uint256 feeBps);
    event CollectionFeeRemoved(address indexed nftContract);

    // Subscription Events
    event SubscriptionTierAdded(
        uint256 indexed tierId,
        uint256 price,
        address indexed paymentToken,
        uint64 durationSeconds,
        uint16 feeBps,
        bool isActive
    );
    event SubscriptionTierUpdated(
        uint256 indexed tierId,
        uint256 price,
        address indexed paymentToken,
        uint64 durationSeconds,
        uint16 feeBps,
        bool isActive
    );
    event SubscriptionPurchased(
        address indexed user,
        uint256 indexed tierId,
        uint64 expiresAt,
        uint256 pricePaid,
        address paymentTokenUsed
    );
    event SubscriptionRenewed(
        address indexed user,
        uint256 indexed tierId,
        uint64 newExpiresAt,
        uint256 pricePaid,
        address paymentTokenUsed
    );

    // Admin Events
    event LifeNodesNFTContractUpdated(address indexed newLifeNodesContract);
    event RoyaltiesDisabledUpdated(bool isDisabled);
    event MarketplaceStorageUpdated(address indexed newMarketplaceStorage);
    event OperationalChainIdUpdated(uint256 newOperationalChainId);

    // New event for expired and reclaimed offers
    event OfferExpiredAndReclaimed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amountReclaimed
    );

    // --- Custom Errors ---
    error Marketplace__AlreadyListed(address nftContract, uint256 tokenId);
    error Marketplace__PriceMustBeGreaterThanZero();
    error Marketplace__InvalidPaymentToken();
    error Marketplace__NotApprovedForMarketplace();
    error Marketplace__CallerNotNFTOwner();
    error Marketplace__InvalidExpirationTimestamp();
    error Marketplace__CannotListForSelfAsPrivateBuyer();
    error Marketplace__MarketplaceStorageNotSet();
    error Marketplace__ListingNotFound(address nftContract, uint256 tokenId);
    error Marketplace__NotListingSeller(address nftContract, uint256 tokenId, address caller);
    error Marketplace__ListingExpired(address nftContract, uint256 tokenId);
    error Marketplace__PrivateListingNotForBuyer(address nftContract, uint256 tokenId, address buyer);
    error Marketplace__IncorrectPaymentToken();
    error Marketplace__WrongNativeValueSent(uint256 expected, uint256 sent);
    error Marketplace__InsufficientPriceForFeesAndRoyalty();
    error Marketplace__OfferAmountMustBeGreaterThanZero();
    error Marketplace__InvalidOfferExpirationTimestamp(uint64 minTimestamp, uint64 maxTimestamp);
    error Marketplace__OfferCallerCannotBeNFTOwnerIfListed();
    error Marketplace__OfferExists();
    error Marketplace__WrongNativeValueForOffer(uint256 expected, uint256 sent);
    error Marketplace__OfferNotFound(address nftContract, uint256 tokenId, address bidder);
    error Marketplace__OfferExpired(address nftContract, uint256 tokenId, address bidder);
    error Marketplace__OfferNotFromBidder(address nftContract, uint256 tokenId, address expectedBidder, address actualBidderOrNone);
    error Marketplace__CallerNotNFTOwnerForAcceptOffer(address nftContract, uint256 tokenId, address caller);
    error Marketplace__InsufficientEscrowForOfferAcceptance();
    error Marketplace__InvalidSubscriptionTierId(uint256 tierId);
    error Marketplace__SubscriptionTierNotActive(uint256 tierId);
    error Marketplace__SubscriptionPaymentTokenMismatch(address expected, address actual);
    error Marketplace__SubscriptionPriceMismatch(uint256 expected, uint256 actual);
    error Marketplace__MaxSubscriptionTiersReached(); // If we want to limit the number of tiers
    error Marketplace__BatchBuyTooManyItems(uint8 maxCount);
    error Marketplace__BatchBuyTotalPriceMismatch(uint256 expectedTotal, uint256 sentValue);
    error Marketplace__BatchBuyPriceExceedsMax(uint256 calculatedTotal, uint256 maxAllowed);
    error Marketplace__BatchBuyEmptyTokenIds();
    error Marketplace__OfferNotExpired(uint64 expiresAt);
    error Marketplace__NoEscrowToReclaim(); // Or re-use InsufficientEscrow
    error Marketplace__SellerCannotBeBuyer(); // Added new error

    // Added Errors for require statement replacements
    error Marketplace__FeeExceedsMax(uint256 current, uint256 max);
    error Marketplace__InvalidFeeRecipient();
    error Marketplace__InvalidNftContractAddress();
    error Marketplace__InvalidMarketplaceStorageAddress();
    error Marketplace__InvalidChainId();
    error Marketplace__InconsistentEscrowBalance(uint256 required, uint256 actual);
    error Marketplace__DeadlinePassed();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        uint256 initialDefaultFeePercentage,
        address initialFeeRecipient,
        address initialLifeNodesNFTContract,
        bool initialRoyaltiesDisabled,
        address initialMarketplaceStorageAddress,
        uint256 chainId // BasedAI Mainnet Chain ID: 32323
    ) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        setDefaultFeePercentage(initialDefaultFeePercentage);
        setFeeRecipient(initialFeeRecipient);
        setLifeNodesNFTContract(initialLifeNodesNFTContract);
        setRoyaltiesDisabled(initialRoyaltiesDisabled);
        setMarketplaceStorage(initialMarketplaceStorageAddress);
        setOperationalChainId(chainId);

        _initializeSubscriptionTiers(); // Call to set up default tiers
    }

    function _initializeSubscriptionTiers() internal {
        // Tier 0: 7 days, 2000 $BASED, 0 bps fee
        subscriptionTiers.push(SubscriptionTier({
            price: 2000 ether, 
            paymentToken: address(0),
            durationSeconds: 7 days,
            feeBps: 0,
            isActive: true
        }));
        emit SubscriptionTierAdded(0, 1000 ether, address(0), 7 days, 0, true);

        // Tier 1: 30 days, 5000 $BASED, 0 bps fee
        subscriptionTiers.push(SubscriptionTier({
            price: 5000 ether, 
            paymentToken: address(0),
            durationSeconds: 30 days,
            feeBps: 0,
            isActive: true
        }));
        emit SubscriptionTierAdded(1, 3000 ether, address(0), 30 days, 0, true);

        // Tier 2: 365 days, 30000 $BASED, 0 bps fee
        subscriptionTiers.push(SubscriptionTier({
            price: 30000 ether, 
            paymentToken: address(0),
            durationSeconds: 365 days,
            feeBps: 0,
            isActive: true
        }));
        emit SubscriptionTierAdded(2, 25000 ether, address(0), 365 days, 0, true);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    // --- Listing Management ---

    function getListing(address nftContract, uint256 tokenId) public view returns (Listing memory) {
        Listing memory listingData = listings[nftContract][tokenId];
        if (listingData.seller == address(0)) {
            revert Marketplace__ListingNotFound(nftContract, tokenId);
        }
        return listingData;
    }

    /**
     * @dev Calculates the effective fee in BPS for a transaction.
     * Order of precedence (lowest fee applies):
     * 1. Active Subscription
     * 2. LifeNodes Holder (1% = 100 BPS)
     * 3. Collection-Specific Fee
     * 4. Default Marketplace Fee
     * This function will be expanded as features are added.
     */
    function _getEffectiveFeeBps(address user, address nftContract) internal view returns (uint16) {
        uint16 currentLowestFeeBps = uint16(defaultFeePercentage); // Start with default

        // 1. Subscription Check
        UserSubscription memory sub = userSubscriptions[user];
        if (sub.expiresAt > block.timestamp) { // User has an active subscription
            // The feeBpsApplied was stored at the time of subscription purchase/renewal.
            if (sub.feeBpsApplied < currentLowestFeeBps) {
                currentLowestFeeBps = sub.feeBpsApplied;
            }
        }

        // 2. LifeNodes Holder Check (Target 1% = 100 BPS)
        // Only apply LifeNode discount if it's better than the subscription (or no active sub)
        if (lifeNodesNFTContract != IERC721(address(0))) {
            try lifeNodesNFTContract.balanceOf(user) returns (uint256 balance) {
                if (balance > 0) {
                    if (100 < currentLowestFeeBps) { // 100 BPS = 1% fee
                        currentLowestFeeBps = 100;
                    }
                }
            } catch {
                // If balanceOf call fails, assume no discount from LifeNodes.
            }
        }

        // 3. Collection-Specific Fee Check
        // Only apply if better than current lowest (which might be from sub or LifeNodes)
        uint256 collectionFee = collectionSpecificFees[nftContract]; // This is in BPS
        if (collectionFee > 0 && collectionFee < currentLowestFeeBps) { 
            currentLowestFeeBps = uint16(collectionFee);
        }

        // Ensure fee does not exceed MAX_FEE_PERCENTAGE (though individual setters should also check this)
        // This final check is a safeguard.
        if (currentLowestFeeBps > MAX_FEE_PERCENTAGE) {
            currentLowestFeeBps = uint16(MAX_FEE_PERCENTAGE);
        }
        return currentLowestFeeBps;
    }


    // --- Core Marketplace Functions ---

    /**
     * @notice Lists an NFT for sale on the marketplace.
     * @dev For Phase 1, paymentToken must be address(0) (native $BASED).
     *      The marketplace must be approved to transfer the NFT.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token to list.
     * @param price The price of the NFT in wei (for native $BASED).
     * @param paymentToken The token for payment (must be address(0) in Phase 1).
     * @param expirationTimestamp The timestamp when the listing expires (0 for no expiration).
     * @param targetBuyer The address of a specific buyer for a private listing (address(0) for public).
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken, // For now, assumed to be address(0) for $BASED
        uint64 expirationTimestamp,
        address targetBuyer
    ) public nonReentrant whenNotPaused {
        if (listings[nftContract][tokenId].seller != address(0)) {
            revert Marketplace__AlreadyListed(nftContract, tokenId);
        }
        if (price == 0) {
            revert Marketplace__PriceMustBeGreaterThanZero();
        }
        // Phase 1: Enforce native token only for now.
        if (paymentToken != address(0)) {
            revert Marketplace__InvalidPaymentToken();
        }
        if (expirationTimestamp != 0 && expirationTimestamp <= block.timestamp) {
            revert Marketplace__InvalidExpirationTimestamp();
        }
        if (targetBuyer == msg.sender && targetBuyer != address(0)) {
            revert Marketplace__CannotListForSelfAsPrivateBuyer();
        }

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert Marketplace__CallerNotNFTOwner();
        }
        if (nft.getApproved(tokenId) != address(this) && !nft.isApprovedForAll(msg.sender, address(this))) {
            revert Marketplace__NotApprovedForMarketplace();
        }

        if (address(marketplaceStorage) == address(0)) {
            revert Marketplace__MarketplaceStorageNotSet();
        }

        uint64 listedAt = uint64(block.timestamp);
        address actualPaymentToken = address(0); // $BASED only for V1

        uint256 listingIdx = marketplaceStorage.recordListing(
            nftContract,
            tokenId,
            msg.sender,
            price,
            actualPaymentToken, // Use actualPaymentToken
            listedAt,
            expirationTimestamp,
            targetBuyer
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            paymentToken: actualPaymentToken, // Use actualPaymentToken
            listedAt: listedAt,
            expiresAt: expirationTimestamp,
            privateBuyer: targetBuyer,
            historicalListingIndex: listingIdx
        });

        emit ListingCreated(
            nftContract,
            tokenId,
            msg.sender,
            price,
            actualPaymentToken, // Use actualPaymentToken
            expirationTimestamp,
            targetBuyer,
            listingIdx
        );
    }

    /**
     * @notice Cancels an active NFT listing.
     * @dev Only the seller of the NFT can cancel the listing.
     *      The listing must exist.
     *      Updates the listing status in MarketplaceStorage.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token in the listing.
     */
    function cancelListing(address nftContract, uint256 tokenId) public nonReentrant whenNotPaused {
        if (address(marketplaceStorage) == address(0)) {
            revert Marketplace__MarketplaceStorageNotSet();
        }

        Listing storage listingToCancel = listings[nftContract][tokenId];

        if (listingToCancel.seller == address(0)) {
            revert Marketplace__ListingNotFound(nftContract, tokenId);
        }
        if (msg.sender != listingToCancel.seller) {
            revert Marketplace__NotListingSeller(nftContract, tokenId, msg.sender);
        }

        uint256 listingIdx = listingToCancel.historicalListingIndex;

        // Clear listing fields instead of using 'delete' to mark as inactive
        // and potentially save gas, while ensuring historicalListingIndex was captured.
        listingToCancel.seller = address(0);
        listingToCancel.price = 0;
        // Optional: Clear other fields if it signifies inactive state more clearly
        // listing.paymentToken = address(0);
        // listing.listedAt = 0;
        // listing.expiresAt = 0;
        // listing.privateBuyer = address(0);


        marketplaceStorage.updateListingStatus(
            listingIdx, 
            MarketplaceStorage.ListingStatus.Cancelled, 
            uint64(block.timestamp) // Cast to uint64
        );

        emit ListingCancelled(
            nftContract,
            tokenId,
            msg.sender, // msg.sender is validated to be listing.seller
            listingIdx
        );
    }

    /**
     * @notice Updates the price of an active NFT listing.
     * @dev Only the seller of the listing can update its price.
     *      The new price must be greater than zero.
     *      For Phase 1, this assumes the paymentToken of the listing remains native $BASED.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token in the listing to be updated.
     * @param newPrice The new price for the NFT listing.
     */
    function updateListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) public nonReentrant whenNotPaused {
        if (newPrice == 0) revert Marketplace__PriceMustBeGreaterThanZero();

        Listing storage currentListing = listings[nftContract][tokenId]; // Use storage pointer for direct update

        if (currentListing.seller == address(0)) {
            revert Marketplace__ListingNotFound(nftContract, tokenId);
        }
        if (currentListing.seller != msg.sender) {
            revert Marketplace__NotListingSeller(nftContract, tokenId, msg.sender);
        }
        if (currentListing.expiresAt != 0 && currentListing.expiresAt < block.timestamp) {
            // Revert or handle as desired - for now, let's allow price updates on expired listings
            // as they might be reactivated or it might not matter. If it should be forbidden:
            // revert Marketplace__ListingExpired(nftContract, tokenId);
        }

        currentListing.price = newPrice;

        emit ListingPriceUpdated(nftContract, tokenId, newPrice);

        // As decided, MarketplaceStorage.sol will not be called for individual price updates of an active listing.
        // The ListingPriceUpdated event serves as the record for this change.
    }

    /**
     * @notice Allows a user to buy an NFT listed with native currency ($BASED).
     * @dev The function is payable and expects msg.value to be equal to the listing price.
     *      It handles fee calculation, royalty payments, NFT transfer, and fund distribution.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token to be purchased.
     */
    function buyNFTNative(
        address nftContract,
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
        Listing storage listingToBuy = listings[nftContract][tokenId];

        // --- Validation Checks ---
        if (listingToBuy.seller == address(0)) {
            revert Marketplace__ListingNotFound(nftContract, tokenId);
        }
        if (listingToBuy.seller == msg.sender) {
            revert Marketplace__SellerCannotBeBuyer();
        }
        if (listingToBuy.expiresAt != 0 && listingToBuy.expiresAt < block.timestamp) {
            revert Marketplace__ListingExpired(nftContract, tokenId);
        }
        if (listingToBuy.privateBuyer != address(0) && listingToBuy.privateBuyer != msg.sender) {
            revert Marketplace__PrivateListingNotForBuyer(nftContract, tokenId, msg.sender);
        }
        // This function is for native token purchases only
        if (listingToBuy.paymentToken != address(0)) {
            revert Marketplace__IncorrectPaymentToken();
        }
        if (msg.value != listingToBuy.price) {
            revert Marketplace__WrongNativeValueSent(listingToBuy.price, msg.value);
        }

        // --- Gather Payment Details ---
        address seller = listingToBuy.seller;
        uint256 price = listingToBuy.price;
        address paymentToken = listingToBuy.paymentToken; // Will be address(0)
        uint256 historicalStorageIndex = listingToBuy.historicalListingIndex;

        // --- Calculate Fees and Royalties ---
        uint16 effectiveFeeBps = _getEffectiveFeeBps(msg.sender, nftContract); // Fee based on buyer
        uint256 marketplaceFee = (price * effectiveFeeBps) / 10000;

        (uint256 royaltyAmount, address royaltyRecipient) = _handleRoyaltyPayment(nftContract, tokenId, price, paymentToken);

        if (price < marketplaceFee + royaltyAmount) {
            revert Marketplace__InsufficientPriceForFeesAndRoyalty();
        }
        uint256 sellerProceeds = price - marketplaceFee - royaltyAmount;

        // --- Execute Payments --- 
        // Order: Fee, Royalty, Seller (to mitigate reentrancy risks further, though nonReentrant helps)
        if (marketplaceFee > 0) {
            Address.sendValue(payable(feeRecipient), marketplaceFee);
        }
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            Address.sendValue(payable(royaltyRecipient), royaltyAmount);
        }
        if (sellerProceeds > 0) { // Seller could get 0 if fees+royalties equal price
            Address.sendValue(payable(seller), sellerProceeds);
        }

        // --- Transfer NFT --- 
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        // --- Update State --- 
        delete listings[nftContract][tokenId];

        // --- Emit Event --- 
        emit NFTSold(
            nftContract,
            tokenId,
            seller,
            msg.sender,
            price,
            paymentToken, // address(0)
            marketplaceFee,
            royaltyAmount,
            royaltyRecipient
        );

        // --- Record in Storage --- 
        if (address(marketplaceStorage) != address(0)) {
            MarketplaceStorage.SaleType saleType = MarketplaceStorage.SaleType.Regular;
            if (listingToBuy.privateBuyer != address(0)) {
                saleType = MarketplaceStorage.SaleType.PrivateSale;
            }

            marketplaceStorage.recordSale(
                nftContract,
                tokenId,
                seller,
                msg.sender,
                price,
                paymentToken, // address(0)
                marketplaceFee,
                royaltyAmount,
                royaltyRecipient,
                uint64(block.timestamp),
                saleType // Updated to use determined saleType
            );
            // Also update the original listing in storage as sold
            marketplaceStorage.updateListingStatus(historicalStorageIndex, MarketplaceStorage.ListingStatus.Sold, uint64(block.timestamp)); 
        } else {
             revert Marketplace__MarketplaceStorageNotSet();
        }
    }

    /**
     * @notice Allows a user to make an offer for an NFT using native $BASED token.
     * @dev The function is payable. msg.value must match the offer amount.
     *      The offer amount is escrowed by the contract.
     *      Expiration must be between 1 hour and 30 days from now.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token for which the offer is made.
     * @param amount The offer amount in wei ($BASED).
     * @param expirationTimestamp The timestamp when the offer expires.
     */
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint64 expirationTimestamp
    ) public payable nonReentrant whenNotPaused {
        address paymentToken = address(0); // Native $BASED for this phase

        if (amount == 0) {
            revert Marketplace__OfferAmountMustBeGreaterThanZero();
        }
        if (msg.value != amount) {
            revert Marketplace__WrongNativeValueForOffer(amount, msg.value);
        }

        uint64 minExpiration = uint64(block.timestamp + 1 hours);
        uint64 maxExpiration = uint64(block.timestamp + 30 days);
        if (expirationTimestamp < minExpiration || expirationTimestamp > maxExpiration) {
            revert Marketplace__InvalidOfferExpirationTimestamp(minExpiration, maxExpiration);
        }

        Listing memory currentListing = listings[nftContract][tokenId];
        if (currentListing.seller == msg.sender) {
            revert Marketplace__OfferCallerCannotBeNFTOwnerIfListed();
        }

        if (offers[nftContract][tokenId][msg.sender].bidder != address(0)) {
            revert Marketplace__OfferExists(); 
        }

        if (address(marketplaceStorage) == address(0)) {
            revert Marketplace__MarketplaceStorageNotSet();
        }
        uint256 storageIndex = marketplaceStorage.recordOffer(
            nftContract,
            tokenId,
            msg.sender,
            amount,
            paymentToken,
            uint64(block.timestamp),
            expirationTimestamp
        );

        offers[nftContract][tokenId][msg.sender] = Offer({
            bidder: msg.sender,
            amount: amount,
            paymentToken: paymentToken,
            createdAt: uint64(block.timestamp),
            expiresAt: expirationTimestamp,
            historicalOfferIndex: storageIndex // Store the index
        });

        escrowedForOffers[msg.sender] += amount;

        emit OfferCreated(
            nftContract,
            tokenId,
            msg.sender,
            amount,
            paymentToken,
            expirationTimestamp
        );
        // Note: Call to marketplaceStorage.recordOffer is now done before creating the local offer
        // to ensure we have the storageIndex.
    }

    /**
     * @notice Allows a bidder to cancel their active (or expired but not yet cleaned) offer.
     * @dev Refunds the escrowed $BASED to the bidder. Updates the historical offer in MarketplaceStorage.
     *      Only the original bidder can cancel their offer.
     * @param nftContract The address of the NFT contract of the offer.
     * @param tokenId The ID of the token of the offer.
     */
    function cancelOffer(
        address nftContract,
        uint256 tokenId
    ) public nonReentrant whenNotPaused {
        Offer storage offerToCancel = offers[nftContract][tokenId][_msgSender()];

        if (offerToCancel.bidder == address(0)) {
            revert Marketplace__OfferNotFound(nftContract, tokenId, _msgSender());
        }

        uint256 amountToRefund = offerToCancel.amount;
        address paymentToken = offerToCancel.paymentToken;
        uint256 storageIndex = offerToCancel.historicalOfferIndex;

        delete offers[nftContract][tokenId][_msgSender()];

        if (paymentToken == address(0) && amountToRefund > 0) { // Native $BASED offer
            if (escrowedForOffers[_msgSender()] < amountToRefund) {
                 revert Marketplace__InconsistentEscrowBalance(amountToRefund, escrowedForOffers[_msgSender()]); 
            }
            escrowedForOffers[_msgSender()] -= amountToRefund;
            Address.sendValue(payable(_msgSender()), amountToRefund);
        } else if (paymentToken != address(0)) {
            // Future ERC20 refund logic if applicable
        }

        emit OfferCancelled(nftContract, tokenId, _msgSender());

        if (address(marketplaceStorage) != address(0)) {
            marketplaceStorage.updateOfferStatus(storageIndex, MarketplaceStorage.OfferStatus.Cancelled, uint64(block.timestamp)); 
        } else {
            // This should ideally not be hit if marketplaceStorage is always set.
            // Consider if a revert is appropriate if it *can* be unset by an admin.
            // For now, relying on it being set.
        }
    }

    /**
     * @notice Allows the NFT owner to accept an offer made in native $BASED token.
     * @dev Transfers the NFT to the bidder and distributes funds from escrow.
     *      Calculates fees based on the seller (current NFT owner).
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token for which the offer is being accepted.
     * @param bidderToAccept The address of the bidder whose offer is being accepted.
     */
    function acceptOffer(
        address nftContract,
        uint256 tokenId,
        address bidderToAccept
    ) public nonReentrant whenNotPaused {
        IERC721 tokenContract = IERC721(nftContract);
        address currentNFTOwner = tokenContract.ownerOf(tokenId);

        if (currentNFTOwner != msg.sender) {
            revert Marketplace__CallerNotNFTOwnerForAcceptOffer(nftContract, tokenId, msg.sender);
        }

        Offer memory offerToAccept = offers[nftContract][tokenId][bidderToAccept];

        if (offerToAccept.bidder == address(0) || offerToAccept.bidder != bidderToAccept) { // Second check is redundant but safe
            revert Marketplace__OfferNotFound(nftContract, tokenId, bidderToAccept);
        }
        if (offerToAccept.expiresAt < block.timestamp) {
            revert Marketplace__OfferExpired(nftContract, tokenId, bidderToAccept);
        }
        // Assuming paymentToken is address(0) for $BASED offers in this phase
        if (offerToAccept.paymentToken != address(0)) {
            // This case should not be reachable if makeOffer only allows $BASED for now
            revert Marketplace__IncorrectPaymentToken(); 
        }
        if (escrowedForOffers[bidderToAccept] < offerToAccept.amount) {
            // This indicates an internal accounting error with escrow, should not happen.
            revert Marketplace__InsufficientEscrowForOfferAcceptance();
        }

        // --- Gather Details --- 
        uint256 price = offerToAccept.amount; // Sale price is the offer amount
        address paymentToken = offerToAccept.paymentToken; // address(0)
        uint256 offerHistoricalStorageIndex = offerToAccept.historicalOfferIndex;

        // --- Calculate Fees and Royalties (fee based on seller, i.e., msg.sender) ---
        uint16 effectiveFeeBps = _getEffectiveFeeBps(msg.sender, nftContract);
        uint256 marketplaceFee = (price * effectiveFeeBps) / 10000;
        (uint256 royaltyAmount, address royaltyRecipient) = _handleRoyaltyPayment(nftContract, tokenId, price, paymentToken);

        if (price < marketplaceFee + royaltyAmount) {
            revert Marketplace__InsufficientPriceForFeesAndRoyalty();
        }
        uint256 sellerProceeds = price - marketplaceFee - royaltyAmount;

        // --- Update Escrow --- 
        escrowedForOffers[bidderToAccept] -= price; // Deduct from bidder's total escrow

        // --- Distribute Funds (from contract's $BASED balance, which includes the escrowed amount) --- 
        if (marketplaceFee > 0) {
            Address.sendValue(payable(feeRecipient), marketplaceFee);
        }
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            Address.sendValue(payable(royaltyRecipient), royaltyAmount);
        }
        if (sellerProceeds > 0) {
            Address.sendValue(payable(msg.sender), sellerProceeds); // Send to NFT owner (seller)
        }

        // --- Transfer NFT (Caller msg.sender is the owner) --- 
        // Marketplace must be approved by the NFT owner (msg.sender)
        if (tokenContract.getApproved(tokenId) != address(this) && !tokenContract.isApprovedForAll(msg.sender, address(this))) {
            revert Marketplace__NotApprovedForMarketplace();
        }
        tokenContract.safeTransferFrom(msg.sender, bidderToAccept, tokenId);

        // --- Update State for Offers and Listings --- 
        delete offers[nftContract][tokenId][bidderToAccept];

        // If the NFT was also listed by the seller, cancel that active listing.
        Listing memory activeListing = listings[nftContract][tokenId];
        if (activeListing.seller == msg.sender) { // Check if the seller (current owner) had it listed
            uint256 activeListingHistoricalIndex = activeListing.historicalListingIndex;
            delete listings[nftContract][tokenId];
            emit ListingCancelled(nftContract, tokenId, msg.sender, activeListingHistoricalIndex);
            if (address(marketplaceStorage) != address(0)) {
                // Mark the active *listing* (if any) as sold because its NFT was sold via an offer.
                // Or, it could be marked as cancelled. "Sold" seems more appropriate for the listing's fate.
                marketplaceStorage.updateListingStatus(activeListingHistoricalIndex, MarketplaceStorage.ListingStatus.Sold, uint64(block.timestamp));
            }
        }
        // Note: Other offers for this NFT remain but will likely become invalid if bidders check ownership,
        // or they might try to get accepted by the new owner if the new owner lists it and they make new offers.
        // Aggressive cleanup of other offers can be gas-intensive.

        // --- Emit NFTSold Event --- 
        emit NFTSold(
            nftContract,
            tokenId,
            msg.sender,     // Seller is the one who accepted the offer (current NFT owner)
            bidderToAccept, // Buyer is the one whose offer was accepted
            price,
            paymentToken,
            marketplaceFee,
            royaltyAmount,
            royaltyRecipient
        );

        // --- Record Sale and Update Offer in Storage --- 
        if (address(marketplaceStorage) != address(0)) {
            marketplaceStorage.recordSale(
                nftContract,
                tokenId,
                msg.sender,    // Seller
                bidderToAccept, // Buyer
                price,
                paymentToken,
                marketplaceFee,
                royaltyAmount,
                royaltyRecipient,
                uint64(block.timestamp),
                MarketplaceStorage.SaleType.AcceptedOffer
            );
            // Mark the specific offer in storage as accepted
            marketplaceStorage.updateOfferStatus(offerHistoricalStorageIndex, MarketplaceStorage.OfferStatus.Accepted, uint64(block.timestamp)); 
        } else {
            revert Marketplace__MarketplaceStorageNotSet();
        }
    }

    /**
     * @notice Allows a user to buy multiple NFTs from a single collection in one transaction ($BASED only).
     * @dev The client is responsible for identifying the tokenIds to purchase (e.g., floor NFTs).
     *      The function is payable. msg.value must match the sum of all individual NFT prices.
     * @param nftContracts An array of NFT contract addresses.
     * @param tokenIds An array of token IDs to purchase from the given collections.
     */
    function buyMultipleNFTs(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds
    ) public payable nonReentrant whenNotPaused {
        if (nftContracts.length != tokenIds.length) {
            revert Marketplace__BatchBuyEmptyTokenIds();
        }
        if (nftContracts.length == 0) {
            revert Marketplace__BatchBuyEmptyTokenIds();
        }
        if (nftContracts.length > MAX_BATCH_BUY_COUNT) {
            revert Marketplace__BatchBuyTooManyItems(MAX_BATCH_BUY_COUNT);
        }

        uint256 calculatedTotalPrice = 0;
        // Temporary storage for listing details to avoid multiple storage reads for active listings
        // We can't declare dynamic arrays of structs in memory easily without ABI Coder V2 tricks, 
        // so we will re-fetch in the second loop. For a small MAX_BATCH_BUY_COUNT, this is acceptable.
        // If MAX_BATCH_BUY_COUNT were very large, optimizing this would be crucial.

        // First loop: Validate and calculate total price
        for (uint256 i = 0; i < nftContracts.length; i++) {
            address nftContract = nftContracts[i];
            uint256 tokenId = tokenIds[i];
            Listing memory currentListing = listings[nftContract][tokenId];

            if (currentListing.seller == address(0)) {
                revert Marketplace__ListingNotFound(nftContract, tokenId);
            }
            if (currentListing.expiresAt != 0 && currentListing.expiresAt < block.timestamp) {
                revert Marketplace__ListingExpired(nftContract, tokenId);
            }
            if (currentListing.privateBuyer != address(0)) {
                // Batch buy is generally for public floor sweeping, private listings don't fit well.
                revert Marketplace__PrivateListingNotForBuyer(nftContract, tokenId, msg.sender);
            }
            if (currentListing.paymentToken != address(0)) {
                revert Marketplace__IncorrectPaymentToken(); // Should be $BASED
            }
            if (currentListing.seller == msg.sender) {
                // Cannot buy your own listed NFT, even in a batch.
                revert Marketplace__CallerNotNFTOwner(); // Re-using error, implies cannot be buyer if you are seller
            }
            calculatedTotalPrice += currentListing.price;
        }

        if (calculatedTotalPrice > msg.value) {
            revert Marketplace__BatchBuyPriceExceedsMax(calculatedTotalPrice, msg.value);
        }

        // Second loop: Execute purchases
        for (uint256 i = 0; i < nftContracts.length; i++) {
            address nftContract = nftContracts[i];
            uint256 tokenId = tokenIds[i];
            Listing memory currentListing = listings[nftContract][tokenId]; // Re-fetch (see comment above)
            
            // Seller, price, paymentToken, historical index already validated or implicitly correct from first loop
            address seller = currentListing.seller;
            uint256 price = currentListing.price;
            address paymentToken = currentListing.paymentToken; // address(0)
            uint256 historicalStorageIndex = currentListing.historicalListingIndex;

            uint16 effectiveFeeBps = _getEffectiveFeeBps(msg.sender, nftContract);
            uint256 marketplaceFee = (price * effectiveFeeBps) / 10000;
            (uint256 royaltyAmount, address royaltyRecipient) = _handleRoyaltyPayment(nftContract, tokenId, price, paymentToken);

            if (price < marketplaceFee + royaltyAmount) {
                revert Marketplace__InsufficientPriceForFeesAndRoyalty(); // Should be for specific item
            }
            uint256 sellerProceeds = price - marketplaceFee - royaltyAmount;

            if (marketplaceFee > 0) {
                Address.sendValue(payable(feeRecipient), marketplaceFee);
            }
            if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                Address.sendValue(payable(royaltyRecipient), royaltyAmount);
            }
            if (sellerProceeds > 0) {
                Address.sendValue(payable(seller), sellerProceeds);
            }

            IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);
            delete listings[nftContract][tokenId];

            emit NFTSold(
                nftContract, tokenId, seller, msg.sender, price, paymentToken, 
                marketplaceFee, royaltyAmount, royaltyRecipient
            );

            if (address(marketplaceStorage) != address(0)) {
                MarketplaceStorage.SaleType saleType = currentListing.privateBuyer != address(0) ? 
                    MarketplaceStorage.SaleType.PrivateSale : MarketplaceStorage.SaleType.Regular;
                
                marketplaceStorage.recordSale(
                    nftContract, tokenId, seller, msg.sender, price, paymentToken, 
                    marketplaceFee, royaltyAmount, royaltyRecipient, uint64(block.timestamp), saleType
                );
                marketplaceStorage.updateListingStatus(historicalStorageIndex, MarketplaceStorage.ListingStatus.Sold, uint64(block.timestamp));
            } else {
                revert Marketplace__MarketplaceStorageNotSet();
            }
        }
    }

    // function buyNFTWithERC20(...) public whenNotPaused nonReentrant { ... }
    // function _executeBuy(...) internal { ... }

    // function makeOffer(...) public payable whenNotPaused { ... }
    // function cancelOffer(...) public whenNotPaused { ... }
    // function acceptOffer(...) public whenNotPaused nonReentrant { ... }

    // function _handleRoyaltyPayment(...) internal { ... } (Adapted from AMM.sol)
    // function _sendPayment(...) internal { ... } (Adapted from AMM.sol - ensure security for native and ERC20)


    // --- Fee Management Functions ---

    function setDefaultFeePercentage(uint256 _newFeePercentage) public onlyOwner {
        if (_newFeePercentage > MAX_FEE_PERCENTAGE) {
            revert Marketplace__FeeExceedsMax(_newFeePercentage, MAX_FEE_PERCENTAGE);
        }
        defaultFeePercentage = _newFeePercentage;
        emit DefaultFeePercentageUpdated(_newFeePercentage);
    }

    function setFeeRecipient(address _newFeeRecipient) public onlyOwner {
        if (_newFeeRecipient == address(0)) {
            revert Marketplace__InvalidFeeRecipient();
        }
        feeRecipient = _newFeeRecipient;
        emit FeeRecipientUpdated(_newFeeRecipient);
    }

    function setCollectionFee(address _nftContract, uint256 _feeBps) public onlyOwner {
        if (_nftContract == address(0)) {
            revert Marketplace__InvalidNftContractAddress();
        }
        if (_feeBps > MAX_FEE_PERCENTAGE) {
            revert Marketplace__FeeExceedsMax(_feeBps, MAX_FEE_PERCENTAGE);
        }
        collectionSpecificFees[_nftContract] = _feeBps;
        emit CollectionFeeSet(_nftContract, _feeBps);
    }

    function removeCollectionFee(address _nftContract) public onlyOwner {
        if (_nftContract == address(0)) {
            revert Marketplace__InvalidNftContractAddress();
        }
        delete collectionSpecificFees[_nftContract];
        emit CollectionFeeRemoved(_nftContract);
    }

    // --- Admin Functions ---

    function setLifeNodesNFTContract(address _newLifeNodesContract) public onlyOwner {
        // No zero address check, as owner might want to disable it by setting to address(0)
        // However, if it's address(0), balanceOf will fail. _getEffectiveFeeBps handles this.
        lifeNodesNFTContract = IERC721(_newLifeNodesContract);
        emit LifeNodesNFTContractUpdated(_newLifeNodesContract);
    }

    function setRoyaltiesDisabled(bool _isDisabled) public onlyOwner {
        royaltiesDisabled = _isDisabled;
        emit RoyaltiesDisabledUpdated(_isDisabled);
    }

    function setMarketplaceStorage(address _newMarketplaceStorageAddress) public onlyOwner {
        if (_newMarketplaceStorageAddress == address(0)) {
            revert Marketplace__InvalidMarketplaceStorageAddress();
        }
        marketplaceStorage = MarketplaceStorage(_newMarketplaceStorageAddress);
        emit MarketplaceStorageUpdated(_newMarketplaceStorageAddress);
    }
    
    function setOperationalChainId(uint256 _newChainId) public onlyOwner {
        if (_newChainId == 0) {
            revert Marketplace__InvalidChainId();
        }
        operationalChainId = _newChainId;
        emit OperationalChainIdUpdated(_newChainId);
    }

    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() public onlyOwner whenPaused {
        _unpause();
    }

    // --- Subscription Admin Functions ---

    /**
     * @notice Adds a new subscription tier.
     * @dev Only callable by the contract owner.
     * @param price Price of the tier.
     * @param paymentToken Token for payment (address(0) for native $BASED).
     * @param durationSeconds Duration of the subscription in seconds.
     * @param feeBps Fee percentage (in BPS) for subscribers of this tier.
     * @param isActive Whether the tier is initially active.
     * @return tierId The ID (index) of the newly added tier.
     */
    function addSubscriptionTier(
        uint256 price,
        address paymentToken,
        uint64 durationSeconds,
        uint16 feeBps,
        bool isActive
    ) external onlyOwner returns (uint256) {
        // Potential: require(subscriptionTiers.length < MAX_TIERS, "Max tiers reached");
        uint256 tierId = subscriptionTiers.length;
        subscriptionTiers.push(SubscriptionTier({
            price: price,
            paymentToken: paymentToken,
            durationSeconds: durationSeconds,
            feeBps: feeBps,
            isActive: isActive
        }));
        emit SubscriptionTierAdded(tierId, price, paymentToken, durationSeconds, feeBps, isActive);
        return tierId;
    }

    /**
     * @notice Updates an existing subscription tier.
     * @dev Only callable by the contract owner.
     * @param tierId ID of the tier to update.
     * @param price New price for the tier.
     * @param paymentToken New payment token for the tier.
     * @param durationSeconds New duration for the tier.
     * @param feeBps New fee percentage (BPS) for the tier.
     * @param isActive New active status for the tier.
     */
    function updateSubscriptionTier(
        uint256 tierId,
        uint256 price,
        address paymentToken,
        uint64 durationSeconds,
        uint16 feeBps,
        bool isActive
    ) external onlyOwner {
        if (tierId >= subscriptionTiers.length) {
            revert Marketplace__InvalidSubscriptionTierId(tierId);
        }

        SubscriptionTier storage tier = subscriptionTiers[tierId];
        tier.price = price;
        tier.paymentToken = paymentToken;
        tier.durationSeconds = durationSeconds;
        tier.feeBps = feeBps;
        tier.isActive = isActive;

        emit SubscriptionTierUpdated(tierId, price, paymentToken, durationSeconds, feeBps, isActive);
    }

    // --- User-Facing Subscription Functions ---

    /**
     * @notice Allows a user to purchase or renew a subscription tier.
     * @dev For Phase 1, only supports payment in native $BASED token.
     *      If the user already has an active subscription, its duration is extended.
     * @param tierId The ID of the subscription tier to purchase.
     */
    function purchaseSubscription(uint256 tierId) public payable nonReentrant whenNotPaused {
        if (tierId >= subscriptionTiers.length || !subscriptionTiers[tierId].isActive) {
            revert Marketplace__InvalidSubscriptionTierId(tierId);
        }

        SubscriptionTier storage tier = subscriptionTiers[tierId]; // Use storage pointer
        if (tier.paymentToken != address(0)) {
            // This error will be more relevant when ERC20 subscriptions are enabled.
            // For now, tiers are initialized with address(0), so this shouldn't hit.
            revert Marketplace__SubscriptionPaymentTokenMismatch(address(0), tier.paymentToken);
        }
        if (msg.value != tier.price) {
            revert Marketplace__SubscriptionPriceMismatch(tier.price, msg.value);
        }

        // If feeRecipient is configured to receive subscription payments, transfer funds.
        // Otherwise, the contract retains the funds (can be withdrawn by owner later).
        // For now, let's assume feeRecipient gets these payments too for simplicity.
        if (tier.price > 0 && feeRecipient != address(0)) {
            Address.sendValue(payable(feeRecipient), tier.price);
        }

        UserSubscription storage sub = userSubscriptions[msg.sender];
        uint64 newExpiresAt;
        bool isRenewal = false;

        if (sub.expiresAt > block.timestamp) { // Active subscription exists, extend it
            newExpiresAt = sub.expiresAt + tier.durationSeconds;
            isRenewal = true;
        } else { // New subscription or expired one
            newExpiresAt = uint64(block.timestamp + tier.durationSeconds);
        }

        sub.tierId = tierId;
        sub.expiresAt = newExpiresAt;
        sub.feeBpsApplied = tier.feeBps; // Store the fee benefit at time of purchase

        if (isRenewal) {
            emit SubscriptionRenewed(msg.sender, tierId, newExpiresAt, tier.price, tier.paymentToken);
        } else {
            emit SubscriptionPurchased(msg.sender, tierId, newExpiresAt, tier.price, tier.paymentToken);
        }
    }

    /**
     * @notice Gets the current subscription status of a user.
     * @param user The address of the user.
     * @return tierId The ID of the current active tier (or last tier if expired).
     * @return expiresAt The expiration timestamp of the current subscription.
     * @return feeBpsApplied The fee BPS applied for this subscription.
     * @return isActive True if the subscription is currently active, false otherwise.
     */
    function getUserSubscription(address user) 
        external 
        view 
        returns (
            uint256 tierId,
            uint64 expiresAt,
            uint16 feeBpsApplied,
            bool isActive
    ) {
        UserSubscription memory sub = userSubscriptions[user];
        isActive = sub.expiresAt > block.timestamp;
        // If no subscription ever, tierId will be 0 (default), expiresAt 0.
        // If they had a sub and it expired, it returns details of the last sub.
        return (sub.tierId, sub.expiresAt, sub.feeBpsApplied, isActive);
    }

    // --- Internal Helper Functions --- (Example from AMM.sol, to be reviewed/used)

    function _handleRoyaltyPayment(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address /*paymentToken*/ // Added paymentToken, currently unused for $BASED only royalties
    ) internal view returns (uint256 paidRoyaltyAmount_, address royaltyRecipient_) {
        paidRoyaltyAmount_ = 0;
        royaltyRecipient_ = address(0);
        if (royaltiesDisabled) return (0, address(0));

        try IERC165(nftContract).supportsInterface(type(IERC2981).interfaceId) returns (bool hasRoyaltyInterface) {
            if (hasRoyaltyInterface) {
                try IERC2981(nftContract).royaltyInfo(tokenId, price) returns (address receiver, uint256 royaltyAmount) {
                    if (receiver != address(0) && royaltyAmount > 0) {
                        if (royaltyAmount < price) { // Safety check: royalty shouldn't exceed price
                            // Payment sending will be handled by the calling function (_executeBuy or similar)
                            // This function just returns the amount and recipient.
                            paidRoyaltyAmount_ = royaltyAmount;
                            royaltyRecipient_ = receiver;
                            // Consider emitting an event if royaltyAmount >= price (anomaly)
                        }
                    }
                } catch {
                    // Royalty info call failed or reverted. No royalty paid.
                }
            }
        } catch {
            // supportsInterface call failed. No royalty paid.
        }
    }
    
    // _sendPayment from AMM.sol needs to be adapted to handle both native currency and ERC20 tokens
    // and used carefully within _executeBuy or similar functions.
    // Example:
    // function _transferPayment(address token, address to, uint256 amount) internal {
    //     if (amount == 0) return;
    //     if (token == address(0)) { // Native currency
    //         SafeTransferLib.safeTransferETH(to, amount); // Using a safe transfer library
    //     } else { // ERC20 token
    //         SafeTransferLib.safeTransfer(IERC20(token), to, amount); // Using a safe transfer library
    //     }
    // }
    // Note: SafeTransferLib is common, e.g., from Solmate or OpenZeppelin's SafeERC20.sol / Address.sol

    // --- Fallback and Receive Functions ---
    // receive() external payable {} // Only if needed for direct $BASED transfers not part of a function call.
                                   // For offers, msg.value will be tied to makeOffer.

    /**
     * @notice Allows a bidder to reclaim their escrowed $BASED from an expired offer.
     * @dev The offer must have passed its expiration time.
     * @param nftContract The address of the NFT contract of the expired offer.
     * @param tokenId The ID of the token of the expired offer.
     */
    function reclaimExpiredOfferEscrow(
        address nftContract,
        uint256 tokenId
    ) public nonReentrant whenNotPaused {
        Offer storage offerDetails = offers[nftContract][tokenId][_msgSender()];

        if (offerDetails.bidder == address(0)) {
            revert Marketplace__OfferNotFound(nftContract, tokenId, _msgSender());
        }
        // expirationTimestamp must be non-zero (enforced by makeOffer) and in the past.
        if (offerDetails.expiresAt == 0 || offerDetails.expiresAt >= block.timestamp) {
            revert Marketplace__OfferNotExpired(offerDetails.expiresAt);
        }

        uint256 amountToReclaim = offerDetails.amount;
        address paymentToken = offerDetails.paymentToken; // Should be address(0) for $BASED
        uint256 historicalOfferIndex = offerDetails.historicalOfferIndex;

        if (paymentToken != address(0) || amountToReclaim == 0) {
            // This case implies either not a $BASED offer (not possible in V1) or a zero amount offer (not possible)
            revert Marketplace__NoEscrowToReclaim(); 
        }

        if (escrowedForOffers[msg.sender] < amountToReclaim) {
            // This indicates an internal accounting error with escrow, should ideally not happen.
            revert Marketplace__InsufficientEscrowForOfferAcceptance(); // Re-using, contextually means not enough for this reclaim
        }

        delete offers[nftContract][tokenId][msg.sender];
        escrowedForOffers[msg.sender] -= amountToReclaim;
        Address.sendValue(payable(msg.sender), amountToReclaim); // Refund the bidder

        emit OfferExpiredAndReclaimed(nftContract, tokenId, msg.sender, amountToReclaim);

        // Update the offer status in MarketplaceStorage as effectively "cancelled" due to expiry/reclaim.
        if (address(marketplaceStorage) != address(0)) {
            // Using current block.timestamp as the "cancelledAt" time for the expired offer.
            marketplaceStorage.updateOfferStatus(historicalOfferIndex, MarketplaceStorage.OfferStatus.Reclaimed, uint64(block.timestamp)); 
        } else {
            // This should ideally not be hit if marketplaceStorage is always set.
        }
    }
}
