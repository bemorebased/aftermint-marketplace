// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol"; // Not used, listings are approval-based
import "@openzeppelin/contracts/token/common/ERC2981.sol"; // For royalty support
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./MarketplaceStorage.sol";

/**
 * @title AMM
 * @dev An upgradeable and pausable marketplace for buying and selling NFTs on BasedAI Chain
 */
contract AMM is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
    // ERC721HolderUpgradeable // Not used
{
    struct Listing {
        address seller;
        uint256 price;
        uint64 listedAt;
        uint64 expiresAt;      // New: expiration timestamp (0 means no expiration)
        address privateBuyer;  // New: specific buyer address (address(0) for public listing)
    }
    
    struct Sale {
        address nftContract;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 fee;
        uint64 timestamp;
    }

    struct Offer {
        address bidder;
        uint256 amount;
        uint64 createdAt;
        uint64 expiresAt;
    }

    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10%
    uint256 public constant MAX_SALES_LIMIT = 100;

    address public lifeNodesContract;
    // address public dankPepesContract; // Removed

    uint256 public feePercentage; // e.g., 250 for 2.5%
    uint256 public lifeNodesDiscount; // e.g., 10000 for 100%
    // uint256 public dankPepesDiscount; // Removed

    address public feeRecipient;
    bool public royaltiesDisabled;
    uint256 public testnetChainId; // Chain ID for testnet where discounts are bypassed

    mapping(address => mapping(uint256 => Listing)) public listings;
    Sale[] public recentSales;
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;

    event ListingCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId);
    event ListingPriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event NFTSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address indexed buyer,
        uint256 price,
        uint256 fee
    );
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    event FeePercentageUpdated(uint256 newFeePercentage);
    event FeeRecipientUpdated(address indexed newFeeRecipient);
    event LifeNodesContractUpdated(address indexed newLifeNodesContract);
    // event DankPepesContractUpdated(address indexed newDankPepesContract); // Removed
    event LifeNodesDiscountUpdated(uint256 newDiscount);
    // event DankPepesDiscountUpdated(uint256 newDiscount); // Removed
    event RoyaltiesDisabledUpdated(bool isDisabled);
    event TestnetChainIdUpdated(uint256 newTestnetChainId);
    event ListingCreatedWithExpiration(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint64 expiresAt
    );
    event PrivateListingCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        address privateBuyer,
        uint64 expiresAt
    );
    event OfferCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount,
        uint64 expiresAt
    );
    event OfferCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed bidder
    );
    event OfferAccepted(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address indexed bidder,
        uint256 amount,
        uint256 fee
    );
    event StorageContractUpdated(address indexed newStorageContract);

    address public storageContract;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        uint256 initialFeePercentage,
        address initialFeeRecipient,
        address initialLifeNodesContract,
        // address initialDankPepesContract, // Removed
        uint256 initialTestnetChainId,
        bool initialRoyaltiesDisabled,
        address initialStorageContract
    ) public initializer {
        __Ownable_init(initialOwner);
        __Pausable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        // __ERC721Holder_init(); // Removed

        setFeePercentage(initialFeePercentage);
        setFeeRecipient(initialFeeRecipient);
        setLifeNodesContract(initialLifeNodesContract);
        // setDankPepesContract(initialDankPepesContract); // Removed
        setLifeNodesDiscount(10000); // 100% discount for LifeNodes (0% fee)
        // setDankPepesDiscount(2500); // Removed
        setTestnetChainId(initialTestnetChainId);
        setRoyaltiesDisabled(initialRoyaltiesDisabled);
        
        // Set the storage contract
        if (initialStorageContract != address(0)) {
            setStorageContract(initialStorageContract);
        }
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // --- View Functions ---
    function getListing(address nftContract, uint256 tokenId) public view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    function getEffectiveFee(address buyer, uint256 price) public view returns (uint256) {
        if (block.chainid == testnetChainId && testnetChainId != 0) {
            return 0;
        }

        uint256 currentDiscountBps = 0;

        if (lifeNodesContract != address(0)) {
            // Check if buyer holds a LifeNode NFT
            // This requires lifeNodesContract to be an ERC721 contract with balanceOf
            // If it uses a different interface (e.g. ERC1155 or custom), this check needs to be adapted
            try IERC721(lifeNodesContract).balanceOf(buyer) returns (uint256 balance) {
                if (balance > 0) {
                    currentDiscountBps = lifeNodesDiscount;
                }
            } catch {
                // If balanceOf call fails (e.g. not an ERC721 contract or other issue), assume no discount
                // Or handle specific errors if needed
            }
        }

        if (currentDiscountBps >= 10000) { // 10000 bps = 100%
            return 0; // Full discount means 0 fee
        }

        uint256 feeAfterDiscount = (price * feePercentage * (10000 - currentDiscountBps)) / 10000 / 10000;
        return feeAfterDiscount;
    }

    function getRecentSales(uint256 limit) public view returns (Sale[] memory) {
        require(limit <= MAX_SALES_LIMIT, "Limit exceeds maximum");
        uint256 count = recentSales.length;
        uint256 numToReturn = count < limit ? count : limit;
        if (numToReturn == 0) {
            return new Sale[](0);
        }
        Sale[] memory salesToReturn = new Sale[](numToReturn);
        for (uint i = 0; i < numToReturn; i++) {
            salesToReturn[i] = recentSales[count - 1 - i];
        }
        return salesToReturn;
    }

    // --- Core Marketplace Functions ---
    function _handleRoyaltyPayment(address nftContract, uint256 tokenId, uint256 price) internal {
        if (royaltiesDisabled) return;

        try IERC165(nftContract).supportsInterface(type(IERC2981).interfaceId) returns (bool supportsInterfaceSuccess) {
            if (supportsInterfaceSuccess) {
                try IERC2981(nftContract).royaltyInfo(tokenId, price) returns (address receiver, uint256 royaltyAmount) {
                    if (receiver != address(0) && royaltyAmount > 0) {
                        // Ensure royalty does not exceed price (safety check)
                        if (royaltyAmount <= price) {
                             _sendPayment(receiver, royaltyAmount);
                        } else {
                            // This case should ideally not happen if ERC2981 is implemented correctly
                            // Consider emitting an event for such anomalies
                        }
                    }
                } catch {
                    // Royalty info call failed or reverted
                }
            }
        } catch {
            // supportsInterface call failed (e.g. not a contract or no fallback)
        }
    }

    function _sendPayment(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool success, ) = to.call{value: amount}("");
        require(success, "Payment failed");
    }

    function createListing(address nftContract, uint256 tokenId, uint256 price) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[nftContract][tokenId] = Listing(msg.sender, price, uint64(block.timestamp), 0, address(0));
        emit ListingCreated(nftContract, tokenId, msg.sender, price);
        
        // Record listing in storage contract if available
        if (storageContract != address(0)) {
            try MarketplaceStorage(storageContract).recordListing(
                nftContract,
                tokenId,
                msg.sender,
                price,
                uint64(block.timestamp),
                0, // No expiration
                address(0) // Not a private listing
            ) {} catch {}
        }
    }

    function cancelListing(address nftContract, uint256 tokenId) external whenNotPaused nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.price > 0, "Listing does not exist");
        require(listing.seller == msg.sender, "Not lister");
        
        // Store the listing index before deleting
        uint256 listingIndex = 0;
        
        if (storageContract != address(0)) {
            // Find the latest listing for this NFT
            try MarketplaceStorage(storageContract).nftListingHistory(nftContract, tokenId, 0) returns (uint256 index) {
                listingIndex = index;
            } catch {}
        }
        
        delete listings[nftContract][tokenId];
        emit ListingCancelled(nftContract, tokenId);
        
        // Update listing status in storage contract if available
        if (storageContract != address(0)) {
            try MarketplaceStorage(storageContract).updateListingStatus(
                listingIndex,
                uint64(block.timestamp), // Cancelled timestamp
                0 // Not sold
            ) {} catch {}
        }
    }

    function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice) external whenNotPaused nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.seller == msg.sender, "Not lister");
        require(newPrice > 0, "Price must be greater than zero");
        require(listing.price > 0, "Listing does not exist");

        listing.price = newPrice;
        emit ListingPriceUpdated(nftContract, tokenId, newPrice);
    }

    function buyNFT(address nftContract, uint256 tokenId) external payable whenNotPaused nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.price > 0, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        
        // Check if the listing has expired
        if (listing.expiresAt > 0 && uint64(block.timestamp) > listing.expiresAt) {
            revert("Listing has expired");
        }
        
        // Check if it's a private listing and verify the buyer
        if (listing.privateBuyer != address(0)) {
            require(msg.sender == listing.privateBuyer, "Not authorized for this private listing");
        }

        IERC721 nft = IERC721(nftContract);
        address seller = listing.seller;

        // Re-validate ownership and approval before proceeding
        require(nft.ownerOf(tokenId) == seller, "Seller no longer owns NFT");
        require(
            nft.isApprovedForAll(seller, address(this)) || nft.getApproved(tokenId) == address(this),
            "Marketplace not approved for this token"
        );
        
        // Store the listing index before deleting
        uint256 listingIndex = 0;
        
        if (storageContract != address(0)) {
            // Find the latest listing for this NFT
            try MarketplaceStorage(storageContract).nftListingHistory(nftContract, tokenId, 0) returns (uint256 index) {
                listingIndex = index;
            } catch {}
        }

        // Clear listing before transfers
        delete listings[nftContract][tokenId];

        uint256 fee = getEffectiveFee(msg.sender, listing.price);
        uint256 paymentToSeller = listing.price - fee;

        // Handle ERC2981 Royalties (if applicable and not disabled)
        _handleRoyaltyPayment(nftContract, tokenId, listing.price);

        // Transfer NFT
        nft.safeTransferFrom(seller, msg.sender, tokenId);

        // Send payment to seller
        _sendPayment(seller, paymentToSeller);

        // Send fee to feeRecipient
        _sendPayment(feeRecipient, fee);

        // Handle excess payment if any (refund to buyer)
        if (msg.value > listing.price) {
            _sendPayment(msg.sender, msg.value - listing.price);
        }

        // Record the sale
        if (recentSales.length >= MAX_SALES_LIMIT) {
            // Shift elements to the left to remove the oldest sale (at index 0)
            for (uint i = 0; i < recentSales.length - 1; i++) {
                recentSales[i] = recentSales[i + 1];
            }
            recentSales.pop(); // Remove the last element (which is now a duplicate of the second to last)
        }
        
        // Add the new sale
        recentSales.push(Sale(nftContract, tokenId, seller, msg.sender, listing.price, fee, uint64(block.timestamp)));

        emit NFTSold(nftContract, tokenId, seller, msg.sender, listing.price, fee);
        
        // Record sale in storage contract if available
        if (storageContract != address(0)) {
            // Update the listing status
            try MarketplaceStorage(storageContract).updateListingStatus(
                listingIndex,
                0, // Not cancelled
                uint64(block.timestamp) // Sold timestamp
            ) {} catch {}
            
            // Record the sale
            try MarketplaceStorage(storageContract).recordSale(
                nftContract,
                tokenId,
                seller,
                msg.sender,
                listing.price,
                fee,
                uint64(block.timestamp),
                MarketplaceStorage.SaleType.Regular
            ) {} catch {}
        }
    }

    // Function to allow sweeping multiple NFTs in one transaction
    function sweepNFTs(
        address nftContract,
        uint256[] calldata tokenIds,
        uint256[] calldata maxPrices // Max price user is willing to pay for each token
    ) external payable whenNotPaused nonReentrant {
        require(tokenIds.length > 0, "AMM: Must provide token IDs");
        require(tokenIds.length == maxPrices.length, "AMM: Token IDs and max prices length mismatch");
        // Add a practical limit to the number of NFTs that can be swept in one transaction
        require(tokenIds.length <= 10, "AMM: Sweep limit exceeded (max 10)"); 

        uint256 totalCalculatedCost = 0;
        address buyer = msg.sender;

        // First pass: Validate all listings and calculate total cost
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            Listing storage listing = listings[nftContract][tokenId];

            require(listing.seller != address(0), "AMM: A token in the sweep is not listed or already sold");
            require(listing.price > 0, "AMM: A token price must be greater than zero");
            require(listing.price <= maxPrices[i], "AMM: Price exceeds max price for a token in the sweep");
            require(listing.seller != buyer, "AMM: Cannot buy your own NFT through sweep");
            
            // Check if any listing has expired
            if (listing.expiresAt > 0 && uint64(block.timestamp) > listing.expiresAt) {
                revert("AMM: A token in the sweep has an expired listing");
            }
            
            // Check if any listing is private and verify the buyer
            if (listing.privateBuyer != address(0)) {
                require(buyer == listing.privateBuyer, "AMM: A token in the sweep has a private listing for another buyer");
            }

            totalCalculatedCost += listing.price;
        }

        require(msg.value >= totalCalculatedCost, "AMM: Insufficient ETH sent for sweep");

        // Second pass: Process transactions
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            // Re-fetch listing for current state; seller and price could theoretically change if not careful
            // but nonReentrant and the previous checks should mitigate most direct reentrancy issues.
            Listing memory currentListing = listings[nftContract][tokenId]; 
            address seller = currentListing.seller;
            uint256 price = currentListing.price;

            // Ensure the listing still exists and matches expectations (important if contract allows front-running risk)
            require(seller != address(0) && price > 0, "AMM: Token listing disappeared during sweep");
            require(price <= maxPrices[i], "AMM: Price changed and now exceeds max price during sweep");

            IERC721 nft = IERC721(nftContract);
            // Re-validate ownership and approval before proceeding (important)
            require(nft.ownerOf(tokenId) == seller, "AMM: Seller no longer owns an NFT in the sweep");
            require(
                nft.isApprovedForAll(seller, address(this)) || nft.getApproved(tokenId) == address(this),
                "AMM: Marketplace not approved for an NFT in the sweep"
            );

            // Clear listing before transfers
            delete listings[nftContract][tokenId];

            uint256 fee = getEffectiveFee(buyer, price);
            uint256 paymentToSeller = price - fee;

            _handleRoyaltyPayment(nftContract, tokenId, price);
            
            nft.safeTransferFrom(seller, buyer, tokenId);
            _sendPayment(seller, paymentToSeller);
            _sendPayment(feeRecipient, fee);

            // Record individual sale for NFTSold event consistency
            // The NFTSwept event could be a separate event or this could be augmented.
            if (recentSales.length >= MAX_SALES_LIMIT) {
                for (uint j = 0; j < recentSales.length - 1; j++) {
                    recentSales[j] = recentSales[j + 1];
                }
                recentSales.pop();
            }
            recentSales.push(Sale(nftContract, tokenId, seller, buyer, price, fee, uint64(block.timestamp)));

            emit NFTSold(nftContract, tokenId, seller, buyer, price, fee); 
            // Consider a specific NFTSwept event if more granular data per sweep action is needed beyond individual NFTSold events.
        }

        if (msg.value > totalCalculatedCost) {
            _sendPayment(buyer, msg.value - totalCalculatedCost);
        }
    }

    // --- Owner Functions ---
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function withdrawFees() external nonReentrant {
        require(feeRecipient != address(0), "Fee recipient not set");
        uint256 balance = address(this).balance;
        // To prevent withdrawing funds intended for active sales or other purposes,
        // ensure this function only withdraws *collected fees*.
        // However, with direct payments to feeRecipient in buyNFT, this might be less critical
        // or could be repurposed for withdrawing any ETH stuck in the contract for other reasons.
        // For now, it withdraws the full contract balance to the feeRecipient.
        // A more robust system might track collected fees separately if the contract holds other ETH.
        require(balance > 0, "No fees to withdraw");
        
        _sendPayment(feeRecipient, balance);
        emit FeesWithdrawn(feeRecipient, balance);
    }

    function setFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= MAX_FEE_PERCENTAGE, "Fee exceeds maximum");
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(_feePercentage);
    }

    function setFeeRecipient(address _newFeeRecipient) public onlyOwner {
        require(_newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _newFeeRecipient;
        emit FeeRecipientUpdated(_newFeeRecipient);
    }

    function setRoyaltiesDisabled(bool isDisabled) public onlyOwner {
        royaltiesDisabled = isDisabled;
        emit RoyaltiesDisabledUpdated(isDisabled);
    }

    // --- Discount Configuration Functions ---
    function setLifeNodesContract(address _lifeNodesContract) public onlyOwner {
        lifeNodesContract = _lifeNodesContract;
        emit LifeNodesContractUpdated(_lifeNodesContract);
        // No DiscountContractUpdated event here, each discount type has its own event.
    }

    // function setDankPepesContract(address _dankPepesContract) public onlyOwner { // Removed
    // } // Removed

    function setLifeNodesDiscount(uint256 _discountBps) public onlyOwner {
        require(_discountBps <= 10000, "Discount cannot exceed 100%");
        lifeNodesDiscount = _discountBps;
        emit LifeNodesDiscountUpdated(_discountBps);
    }

    // function setDankPepesDiscount(uint256 _discountBps) public onlyOwner { // Removed
    // } // Removed

    function setTestnetChainId(uint256 _testnetChainId) public onlyOwner {
        testnetChainId = _testnetChainId;
        emit TestnetChainIdUpdated(_testnetChainId);
    }

    // Create listing with optional expiration time
    function createListingWithExpiration(
        address nftContract, 
        uint256 tokenId, 
        uint256 price,
        uint64 expiresAt
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[nftContract][tokenId] = Listing(msg.sender, price, uint64(block.timestamp), expiresAt, address(0));
        emit ListingCreatedWithExpiration(nftContract, tokenId, msg.sender, price, expiresAt);
    }

    // Create private listing with mandatory buyer and optional expiration
    function createPrivateListing(
        address nftContract, 
        uint256 tokenId, 
        uint256 price,
        address privateBuyer,
        uint64 expiresAt
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(privateBuyer != address(0), "Private buyer cannot be zero address");
        require(privateBuyer != msg.sender, "Cannot create private listing for yourself");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[nftContract][tokenId] = Listing(msg.sender, price, uint64(block.timestamp), expiresAt, privateBuyer);
        emit PrivateListingCreated(nftContract, tokenId, msg.sender, price, privateBuyer, expiresAt);
    }

    // Function to make an offer on an NFT
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint64 expiresAt
    ) external payable whenNotPaused nonReentrant {
        // Require non-zero value to create an offer
        require(msg.value > 0, "Offer amount must be greater than zero");
        
        // Validate expiration (must be in the future and not exceed 30 days)
        if (expiresAt > 0) {
            require(expiresAt > block.timestamp, "Expiration must be in the future");
            require(expiresAt <= block.timestamp + 30 days, "Expiration cannot exceed 30 days");
        }
        
        // Check current offer (if any) from the same bidder
        Offer storage currentOffer = offers[nftContract][tokenId][msg.sender];
        uint256 existingAmount = currentOffer.amount;
        
        // If bidder has an active offer, refund it first
        if (existingAmount > 0) {
            _sendPayment(msg.sender, existingAmount);
        }
        
        // Create new offer
        offers[nftContract][tokenId][msg.sender] = Offer(
            msg.sender,
            msg.value,
            uint64(block.timestamp),
            expiresAt
        );
        
        emit OfferCreated(nftContract, tokenId, msg.sender, msg.value, expiresAt);
    }

    // Function to cancel an offer and refund the bidder
    function cancelOffer(address nftContract, uint256 tokenId) external nonReentrant {
        Offer storage offer = offers[nftContract][tokenId][msg.sender];
        require(offer.amount > 0, "No active offer found");
        
        uint256 refundAmount = offer.amount;
        delete offers[nftContract][tokenId][msg.sender];
        
        _sendPayment(msg.sender, refundAmount);
        emit OfferCancelled(nftContract, tokenId, msg.sender);
    }

    // Function for NFT owner to accept an offer
    function acceptOffer(
        address nftContract,
        uint256 tokenId,
        address bidder
    ) external whenNotPaused nonReentrant {
        // Get the offer
        Offer memory offer = offers[nftContract][tokenId][bidder];
        require(offer.amount > 0, "No active offer found for this bidder");
        
        // Check if offer has expired
        if (offer.expiresAt > 0 && uint64(block.timestamp) > offer.expiresAt) {
            revert("Offer has expired");
        }
        
        // Verify NFT ownership
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Check marketplace approvals
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this),
            "Marketplace not approved for this token"
        );
        
        // If there's an active listing, remove it
        if (listings[nftContract][tokenId].price > 0) {
            delete listings[nftContract][tokenId];
        }
        
        // Get the payment details 
        uint256 offerAmount = offer.amount;
        uint256 fee = getEffectiveFee(bidder, offerAmount);
        uint256 paymentToSeller = offerAmount - fee;
        
        // Clear offer before transfers
        delete offers[nftContract][tokenId][bidder];
        
        // Handle royalties
        _handleRoyaltyPayment(nftContract, tokenId, offerAmount);
        
        // Transfer NFT
        nft.safeTransferFrom(msg.sender, bidder, tokenId);
        
        // Send payment to seller
        _sendPayment(msg.sender, paymentToSeller);
        
        // Send fee to fee recipient
        _sendPayment(feeRecipient, fee);
        
        // Record the sale
        if (recentSales.length >= MAX_SALES_LIMIT) {
            // Shift elements to the left to remove the oldest sale (at index 0)
            for (uint i = 0; i < recentSales.length - 1; i++) {
                recentSales[i] = recentSales[i + 1];
            }
            recentSales.pop(); // Remove the last element
        }
        // Add the new sale
        recentSales.push(Sale(nftContract, tokenId, msg.sender, bidder, offerAmount, fee, uint64(block.timestamp)));
        
        emit OfferAccepted(nftContract, tokenId, msg.sender, bidder, offerAmount, fee);
    }

    // Helper function to get all offers for a specific NFT
    function getOffersForNFT(
        address nftContract,
        uint256 tokenId,
        address[] calldata bidders
    ) external view returns (Offer[] memory) {
        require(bidders.length > 0, "Must provide at least one bidder address");
        
        Offer[] memory result = new Offer[](bidders.length);
        
        for (uint i = 0; i < bidders.length; i++) {
            result[i] = offers[nftContract][tokenId][bidders[i]];
        }
        
        return result;
    }

    // Add function to set the storage contract
    function setStorageContract(address _storageContract) public onlyOwner {
        require(_storageContract != address(0), "Invalid storage contract");
        storageContract = _storageContract;
        emit StorageContractUpdated(_storageContract);
    }
} 