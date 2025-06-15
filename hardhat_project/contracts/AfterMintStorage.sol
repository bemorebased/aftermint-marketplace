// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title AfterMintStorage
 * @dev Stores historical marketplace data (listings, sales, offers) and collection statistics.
 *      Designed to be an upgradeable contract (UUPS).
 */
contract AfterMintStorage is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    // --- Enums ---

    enum ListingStatus {
        Active,     // Initial status when listed
        Sold,
        Cancelled,
        Expired     // If explicit expiration tracking is added here too
    }

    enum OfferStatus {
        Active,     // Initial status when offered
        Accepted,
        Cancelled,
        Expired,    // If an offer expires and is not accepted/cancelled
        Reclaimed   // If an expired offer's escrow is reclaimed by bidder
    }

    // Enum to differentiate types of sales for analytics
    enum SaleType {
        Regular,        // Direct buy of a public listing
        PrivateSale,    // Direct buy of a private listing
        AcceptedOffer   // Sale resulting from an offer being accepted
    }

    // --- Structs ---

    struct HistoricalListing {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        address paymentToken; // address(0) for native $BASED
        uint64 listedAt;
        uint64 expiresAt;      // 0 for no expiration
        address privateBuyer; // address(0) for public
        ListingStatus status;
        uint64 cancelledAt;    // Timestamp of cancellation, 0 if not cancelled
        uint64 soldAt;         // Timestamp of sale, 0 if not sold
    }

    struct HistoricalSale {
        address nftContract;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        address paymentToken;        // address(0) for native $BASED
        uint256 marketplaceFee;
        uint256 royaltyAmountPaid;
        address royaltyRecipient;    // address(0) if no royalty or not applicable
        uint64 timestamp;
        SaleType saleType;
    }

    struct HistoricalOffer {
        address nftContract;
        uint256 tokenId;
        address bidder;
        uint256 amount;
        address paymentToken; // address(0) for native $BASED
        uint64 createdAt;
        uint64 expiresAt;
        OfferStatus status;
        uint64 cancelledAt;    // Timestamp of cancellation, 0 if not cancelled
        uint64 acceptedAt;     // Timestamp of acceptance, 0 if not accepted
        // uint64 reclaimedAt; // If tracking reclaim specifically
    }

    // --- State Variables ---

    // Historical Data Storage
    HistoricalListing[] public historicalListings;
    HistoricalSale[] public historicalSales;
    HistoricalOffer[] public historicalOffers;

    // Mappings for direct access if needed, though arrays are source of truth for enumeration
    mapping(address => mapping(uint256 => uint256[])) public listingHistoryIndices; // nftContract => tokenId => array of historicalListings indices
    mapping(address => mapping(uint256 => uint256[])) public offerHistoryIndices;   // nftContract => tokenId => array of historicalOffers indices

    // Additional mappings for querying by user, collection, and specific NFT
    mapping(address => uint256[]) public userBuys;     // buyer => historicalSales indices
    mapping(address => uint256[]) public userSells;    // seller => historicalSales indices
    mapping(address => uint256[]) public userListings; // seller => historicalListings indices
    mapping(address => uint256[]) public userOffers;   // bidder => historicalOffers indices
    
    mapping(address => uint256[]) public collectionSales;    // nftContract => historicalSales indices
    mapping(address => uint256[]) public collectionListings; // nftContract => historicalListings indices
    mapping(address => uint256[]) public collectionOffers;   // nftContract => historicalOffers indices
    
    mapping(address => mapping(uint256 => uint256[])) public nftSaleHistory;   // nftContract => tokenId => historicalSales indices
    mapping(address => mapping(uint256 => uint256[])) public nftListingHistory; // nftContract => tokenId => historicalListings indices
    mapping(address => mapping(uint256 => uint256[])) public nftOfferHistory;  // nftContract => tokenId => historicalOffers indices

    // Collection Statistics (V1: $BASED only, so paymentToken dimension might be simplified if only one is tracked)
    mapping(address => mapping(address => uint256)) public collectionTradeVolume; // nftContract => paymentToken => totalVolume
    mapping(address => mapping(address => uint256)) public collectionHighestSale; // nftContract => paymentToken => highestSalePrice
    mapping(address => uint256) public collectionSalesCount;       // nftContract => totalSales

    // --- Events ---

    // Events mirroring the main marketplace actions, but for storage recording
    event ListingRecorded(
        uint256 indexed historicalListingIndex,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        address paymentToken
    );

    event ListingStatusUpdated(
        uint256 indexed historicalListingIndex,
        ListingStatus newStatus,
        uint64 actionTimestamp
    );

    event SaleRecorded(
        uint256 indexed historicalSaleIndex,
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        uint256 price,
        address paymentToken,
        SaleType saleType
    );

    event OfferRecorded(
        uint256 indexed historicalOfferIndex,
        address indexed nftContract,
        uint256 indexed tokenId,
        address bidder,
        uint256 amount,
        address paymentToken
    );

    event OfferStatusUpdated(
        uint256 indexed historicalOfferIndex,
        OfferStatus newStatus,
        uint64 actionTimestamp
    );
    
    // Admin events
    // event TrustedMarketplaceContractUpdated(address indexed newMarketplace); (If we want to restrict callers)

    // Debug events - only needed during development and testing
    event DebugListingStatusUpdated(uint256 indexed listingIndex, ListingStatus newStatus, ListingStatus statusAfterUpdate, uint64 actionTimestamp);
    event RichDebugListingStatusUpdated(
        uint256 indexed listingIndex,
        ListingStatus newStatus,
        ListingStatus statusAfterUpdateInStorage,
        uint64 actionTimestamp,
        address nftContractInStorage,
        uint256 tokenIdInStorage,
        address privateBuyerInStorage
    );
    event DebugRecordListing(
        uint256 newIndex,
        address nftContract,
        uint256 tokenId,
        address seller,
        uint256 price,
        address privateBuyer,
        ListingStatus status
    );

    // Main marketplace contract that's allowed to record data
    address public marketplaceContract;

    // Modifier to restrict functions to marketplace contract only
    modifier onlyMarketplace() {
        require(msg.sender == marketplaceContract, "Caller is not the marketplace");
        _;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializes the contract
     * @param initialOwner Initial owner of the contract
     */
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }
    
    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}
    
    /**
     * @dev Sets the marketplace contract address
     * @param _marketplaceContract Address of the marketplace contract
     */
    function setMarketplaceContract(address _marketplaceContract) external onlyOwner {
        require(_marketplaceContract != address(0), "Invalid marketplace address");
        marketplaceContract = _marketplaceContract;
    }
    
    /**
     * @dev Records a new sale in the storage
     */
    function recordSale(
        address nftContract,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price,          // Total price paid by the buyer
        address paymentToken,   // Token used for payment
        uint256 marketplaceFee, // Marketplace fee collected
        uint256 royaltyAmountPaid, // Royalty amount paid
        address royaltyRecipient, // Recipient of the royalty
        uint64 timestamp,
        SaleType saleType
    ) external onlyMarketplace nonReentrant returns (uint256) {
        uint256 saleIndex = historicalSales.length;
        
        historicalSales.push(HistoricalSale({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: seller,
            buyer: buyer,
            price: price,
            paymentToken: paymentToken,
            marketplaceFee: marketplaceFee,
            royaltyAmountPaid: royaltyAmountPaid,
            royaltyRecipient: royaltyRecipient,
            timestamp: timestamp,
            saleType: saleType
        }));
        
        // Update collection statistics
        collectionTradeVolume[nftContract][paymentToken] += price;
        if (price > collectionHighestSale[nftContract][paymentToken]) {
            collectionHighestSale[nftContract][paymentToken] = price;
        }
        collectionSalesCount[nftContract]++;
        
        // Populate index mappings
        userBuys[buyer].push(saleIndex);
        userSells[seller].push(saleIndex);
        collectionSales[nftContract].push(saleIndex);
        nftSaleHistory[nftContract][tokenId].push(saleIndex);

        emit SaleRecorded(saleIndex, nftContract, tokenId, buyer, price, paymentToken, saleType);
        
        return saleIndex;
    }
    
    /**
     * @dev Records a new listing in the storage
     */
    function recordListing(
        address nftContract,
        uint256 tokenId,
        address seller,
        uint256 price,
        address paymentToken,
        uint64 listedAt,
        uint64 expiresAt,
        address privateBuyer
    ) external onlyMarketplace nonReentrant returns (uint256) {
        uint256 listingIndex = historicalListings.length;
        
        historicalListings.push(HistoricalListing({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: seller,
            price: price,
            paymentToken: paymentToken,
            listedAt: listedAt,
            expiresAt: expiresAt,
            privateBuyer: privateBuyer,
            status: ListingStatus.Active, // Initial status
            cancelledAt: 0,
            soldAt: 0
        }));
        
        // Debug event - commented out for production
        // HistoricalListing memory pushedListing = historicalListings[listingIndex];
        // emit DebugRecordListing(
        //     listingIndex,
        //     pushedListing.nftContract,
        //     pushedListing.tokenId,
        //     pushedListing.seller,
        //     pushedListing.price,
        //     pushedListing.privateBuyer,
        //     pushedListing.status
        // );
        
        // Populate index mappings
        userListings[seller].push(listingIndex);
        collectionListings[nftContract].push(listingIndex);
        nftListingHistory[nftContract][tokenId].push(listingIndex); // This replaces listingHistoryIndices

        emit ListingRecorded(listingIndex, nftContract, tokenId, seller, price, paymentToken);
        
        return listingIndex;
    }
    
    /**
     * @dev Updates a listing status when cancelled or sold
     */
    function updateListingStatus(
        uint256 listingIndex,
        ListingStatus newStatus,
        uint64 actionTimestamp
    ) external onlyMarketplace nonReentrant {
        require(listingIndex < historicalListings.length, "AfterMintStorage: Index out of bounds");

        // DIRECT ACCESS TO ARRAY ELEMENT INSTEAD OF USING A STORAGE POINTER
        // This ensures updates are reliably written to storage
        historicalListings[listingIndex].status = newStatus;

        if (newStatus == ListingStatus.Cancelled) {
            historicalListings[listingIndex].cancelledAt = actionTimestamp;
        } else if (newStatus == ListingStatus.Sold) {
            historicalListings[listingIndex].soldAt = actionTimestamp;
        } else if (newStatus == ListingStatus.Expired) {
            // Handled by checking original expiresAt if needed; this status is for marking it as such.
        }

        // Debug events - commented out for production
        // ListingStatus statusReadAfterUpdate = historicalListings[listingIndex].status;
        // emit DebugListingStatusUpdated(listingIndex, newStatus, statusReadAfterUpdate, actionTimestamp);
        // emit RichDebugListingStatusUpdated(
        //     listingIndex,
        //     newStatus,
        //     historicalListings[listingIndex].status,
        //     actionTimestamp,
        //     historicalListings[listingIndex].nftContract,
        //     historicalListings[listingIndex].tokenId,
        //     historicalListings[listingIndex].privateBuyer
        // );

        emit ListingStatusUpdated(listingIndex, newStatus, actionTimestamp);
    }
    
    /**
     * @dev Records a new offer in the storage
     */
    function recordOffer(
        address nftContract,
        uint256 tokenId,
        address bidder,
        uint256 amount,
        address paymentToken,
        uint64 createdAt,
        uint64 expiresAt
    ) external onlyMarketplace nonReentrant returns (uint256) {
        uint256 offerIndex = historicalOffers.length;
        
        historicalOffers.push(HistoricalOffer({
            nftContract: nftContract,
            tokenId: tokenId,
            bidder: bidder,
            amount: amount,
            paymentToken: paymentToken,
            createdAt: createdAt,
            expiresAt: expiresAt,
            status: OfferStatus.Active,
            cancelledAt: 0,
            acceptedAt: 0
        }));
        
        // Populate index mappings
        userOffers[bidder].push(offerIndex);
        collectionOffers[nftContract].push(offerIndex);
        nftOfferHistory[nftContract][tokenId].push(offerIndex); // This replaces offerHistoryIndices

        emit OfferRecorded(offerIndex, nftContract, tokenId, bidder, amount, paymentToken);
        
        return offerIndex;
    }
    
    /**
     * @dev Updates an offer status when cancelled or accepted
     */
    function updateOfferStatus(
        uint256 offerIndex,
        OfferStatus newStatus,
        uint64 actionTimestamp
    ) external onlyMarketplace nonReentrant {
        require(offerIndex < historicalOffers.length, "Invalid offer index");

        HistoricalOffer storage offer = historicalOffers[offerIndex];
        offer.status = newStatus;

        if (newStatus == OfferStatus.Cancelled) {
            offer.cancelledAt = actionTimestamp;
        } else if (newStatus == OfferStatus.Accepted) {
            offer.acceptedAt = actionTimestamp;
        } else if (newStatus == OfferStatus.Expired) {
            // This status could be set if AfterMintMarketplace.sol explicitly calls to mark an offer as Expired in storage.
            // Currently, reclaimExpiredOfferEscrow implies a cancellation/final state.
        } else if (newStatus == OfferStatus.Reclaimed) {
            // This implies it was expired and then funds reclaimed. We can set cancelledAt as the action timestamp.
            offer.cancelledAt = actionTimestamp; // Or a dedicated reclaimedAt if needed.
        }

        emit OfferStatusUpdated(offerIndex, newStatus, actionTimestamp);
    }
    
    // ---------- Query Functions ----------
    
    /**
     * @dev Get collection sales volume within a timeframe
     * @param nftContract Collection address
     * @param startTime Start of timeframe (Unix timestamp)
     * @param endTime End of timeframe (Unix timestamp)
     * @return volume Total volume in wei
     * @return salesCount Number of sales
     */
    function getCollectionVolume(
        address nftContract,
        uint64 startTime,
        uint64 endTime
    ) external view returns (uint256 volume, uint256 salesCount) {
        if (startTime == 0) {
            startTime = 1; // Avoid 0 timestamp
        }
        
        if (endTime == 0) {
            endTime = uint64(block.timestamp);
        }
        
        uint256[] memory saleIndices = collectionSales[nftContract];
        volume = 0;
        salesCount = 0;
        
        for (uint256 i = 0; i < saleIndices.length; i++) {
            HistoricalSale memory sale = historicalSales[saleIndices[i]];
            
            if (sale.timestamp >= startTime && sale.timestamp <= endTime) {
                volume += sale.price;
                salesCount++;
            }
        }
        
        return (volume, salesCount);
    }
    
    /**
     * @dev Get user sales history
     * @param user User address
     * @param isBuyer Whether to get buys or sells
     * @param limit Maximum number of results
     * @param offset Pagination offset
     * @return sales Array of user's recent sales
     */
    function getUserSalesHistory(
        address user,
        bool isBuyer,
        uint256 limit,
        uint256 offset
    ) external view returns (HistoricalSale[] memory) {
        uint256[] storage indices = isBuyer ? userBuys[user] : userSells[user];
        
        // Calculate actual result size
        uint256 resultSize = indices.length > offset ? 
            (indices.length - offset < limit ? indices.length - offset : limit) : 0;
            
        HistoricalSale[] memory result = new HistoricalSale[](resultSize);
        
        // Start from the end to get most recent first
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 fetchIndex = indices.length - 1 - (i + offset);
            result[i] = historicalSales[indices[fetchIndex]];
        }
        
        return result;
    }
    
    /**
     * @dev Get NFT price history
     * @param nftContract Collection address
     * @param tokenId Token ID
     * @param limit Maximum number of results
     * @return sales Array of sales for the NFT
     */
    function getNFTPriceHistory(
        address nftContract,
        uint256 tokenId,
        uint256 limit
    ) external view returns (HistoricalSale[] memory) {
        uint256[] storage indices = nftSaleHistory[nftContract][tokenId];
        
        // Calculate actual result size
        uint256 resultSize = indices.length < limit ? indices.length : limit;
            
        HistoricalSale[] memory result = new HistoricalSale[](resultSize);
        
        // Start from the end to get most recent first
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 fetchIndex = indices.length - 1 - i;
            result[i] = historicalSales[indices[fetchIndex]];
        }
        
        return result;
    }
    
    /**
     * @dev Get active offers for a user (ones they've made)
     * @param user User address
     * @param limit Maximum number of results
     * @return offers Array of active offers made by the user
     */
    function getUserActiveOffers(
        address user,
        uint256 limit
    ) external view returns (HistoricalOffer[] memory) {
        uint256[] storage indices = userOffers[user];
        
        // We need to count active offers first
        uint256 activeCount = 0;
        for (uint256 i = 0; i < indices.length; i++) {
            HistoricalOffer memory offer = historicalOffers[indices[i]];
            if (offer.status == OfferStatus.Active && offer.expiresAt > block.timestamp) {
                activeCount++;
            }
        }
        
        uint256 resultSize = activeCount < limit ? activeCount : limit;
        HistoricalOffer[] memory result = new HistoricalOffer[](resultSize);
        
        // Fill results
        uint256 resultIndex = 0;
        for (uint256 i = indices.length; i > 0 && resultIndex < resultSize; i--) {
            HistoricalOffer memory offer = historicalOffers[indices[i-1]];
            if (offer.status == OfferStatus.Active && offer.expiresAt > block.timestamp) {
                result[resultIndex] = offer;
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get active offers for an NFT
     * @param nftContract Collection address
     * @param tokenId Token ID
     * @param limit Maximum number of results
     * @return offers Array of active offers for the NFT
     */
    function getNFTActiveOffers(
        address nftContract,
        uint256 tokenId,
        uint256 limit
    ) external view returns (HistoricalOffer[] memory) {
        uint256[] storage indices = nftOfferHistory[nftContract][tokenId];
        
        // We need to count active offers first
        uint256 activeCount = 0;
        for (uint256 i = 0; i < indices.length; i++) {
            HistoricalOffer memory offer = historicalOffers[indices[i]];
            if (offer.status == OfferStatus.Active && offer.expiresAt > block.timestamp) {
                activeCount++;
            }
        }
        
        uint256 resultSize = activeCount < limit ? activeCount : limit;
        HistoricalOffer[] memory result = new HistoricalOffer[](resultSize);
        
        // Fill results
        uint256 resultIndex = 0;
        for (uint256 i = indices.length; i > 0 && resultIndex < resultSize; i--) {
            HistoricalOffer memory offer = historicalOffers[indices[i-1]];
            if (offer.status == OfferStatus.Active && offer.expiresAt > block.timestamp) {
                result[resultIndex] = offer;
                resultIndex++;
            }
        }
        
        return result;
    }

    // Add a simple view function to get a listing's status directly
    function getListingStatus(uint256 listingIndex) external view returns (ListingStatus) {
        require(listingIndex < historicalListings.length, "AfterMintStorage: Index out of bounds");
        return historicalListings[listingIndex].status;
    }
} 