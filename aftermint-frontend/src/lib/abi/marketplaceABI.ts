export const marketplaceABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "target",
				"type": "address"
			}
		],
		"name": "AddressEmptyCode",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__AfterMintStorageNotSet",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__AlreadyListed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__BatchBuyEmptyTokenIds",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "calculatedTotal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxAllowed",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__BatchBuyPriceExceedsMax",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "maxCount",
				"type": "uint8"
			}
		],
		"name": "AfterMintMarketplace__BatchBuyTooManyItems",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expectedTotal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sentValue",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__BatchBuyTotalPriceMismatch",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__CallerNotNFTOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__CallerNotNFTOwnerForAcceptOffer",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__CannotListForSelfAsPrivateBuyer",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__DeadlinePassed",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "current",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "max",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__FeeExceedsMax",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "required",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "actual",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__InconsistentEscrowBalance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__IncorrectPaymentToken",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InsufficientEscrowForOfferAcceptance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InsufficientPriceForFeesAndRoyalty",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidAfterMintStorageAddress",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidChainId",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidExpirationTimestamp",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidFeeRecipient",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidNftContractAddress",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint64",
				"name": "minTimestamp",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "maxTimestamp",
				"type": "uint64"
			}
		],
		"name": "AfterMintMarketplace__InvalidOfferExpirationTimestamp",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__InvalidPaymentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__InvalidSubscriptionTierId",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__ListingExpired",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__ListingNotFound",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__MaxSubscriptionTiersReached",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__NoEscrowToReclaim",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__NotApprovedForMarketplace",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__NotListingSeller",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__OfferAmountMustBeGreaterThanZero",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__OfferCallerCannotBeNFTOwnerIfListed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__OfferExists",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__OfferExpired",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			}
		],
		"name": "AfterMintMarketplace__OfferNotExpired",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__OfferNotFound",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "expectedBidder",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "actualBidderOrNone",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__OfferNotFromBidder",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__PriceMustBeGreaterThanZero",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__PrivateListingNotForBuyer",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AfterMintMarketplace__SellerCannotBeBuyer",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "expected",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "actual",
				"type": "address"
			}
		],
		"name": "AfterMintMarketplace__SubscriptionPaymentTokenMismatch",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expected",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "actual",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__SubscriptionPriceMismatch",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__SubscriptionTierNotActive",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expected",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sent",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__WrongNativeValueForOffer",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "expected",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sent",
				"type": "uint256"
			}
		],
		"name": "AfterMintMarketplace__WrongNativeValueSent",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "implementation",
				"type": "address"
			}
		],
		"name": "ERC1967InvalidImplementation",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ERC1967NonPayable",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EnforcedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ExpectedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "FailedCall",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidInitialization",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotInitializing",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "UUPSUnauthorizedCallContext",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "slot",
				"type": "bytes32"
			}
		],
		"name": "UUPSUnsupportedProxiableUUID",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAfterMintStorage",
				"type": "address"
			}
		],
		"name": "AfterMintStorageUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			}
		],
		"name": "CollectionFeeRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "feeBps",
				"type": "uint256"
			}
		],
		"name": "CollectionFeeSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newFeePercentage",
				"type": "uint256"
			}
		],
		"name": "DefaultFeePercentageUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newFeeRecipient",
				"type": "address"
			}
		],
		"name": "FeeRecipientUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "version",
				"type": "uint64"
			}
		],
		"name": "Initialized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newLifeNodesContract",
				"type": "address"
			}
		],
		"name": "LifeNodesNFTContractUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "historicalListingIndex",
				"type": "uint256"
			}
		],
		"name": "ListingCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "privateBuyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "historicalListingIndex",
				"type": "uint256"
			}
		],
		"name": "ListingCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "ListingPriceUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "marketplaceFee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "royaltyAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "royaltyRecipient",
				"type": "address"
			}
		],
		"name": "NFTSold",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			}
		],
		"name": "OfferCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			}
		],
		"name": "OfferCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountReclaimed",
				"type": "uint256"
			}
		],
		"name": "OfferExpiredAndReclaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newOperationalChainId",
				"type": "uint256"
			}
		],
		"name": "OperationalChainIdUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isDisabled",
				"type": "bool"
			}
		],
		"name": "RoyaltiesDisabledUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pricePaid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "paymentTokenUsed",
				"type": "address"
			}
		],
		"name": "SubscriptionPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "newExpiresAt",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pricePaid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "paymentTokenUsed",
				"type": "address"
			}
		],
		"name": "SubscriptionRenewed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "durationSeconds",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "feeBps",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"name": "SubscriptionTierAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "durationSeconds",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "feeBps",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"name": "SubscriptionTierUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "implementation",
				"type": "address"
			}
		],
		"name": "Upgraded",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "MAX_BATCH_BUY_COUNT",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_FEE_PERCENTAGE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "UPGRADE_INTERFACE_VERSION",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "bidderToAccept",
				"type": "address"
			}
		],
		"name": "acceptOffer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "afterMintStorage",
		"outputs": [
			{
				"internalType": "contract AfterMintStorage",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "nftContracts",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "tokenIds",
				"type": "uint256[]"
			}
		],
		"name": "buyMultipleNFTs",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "buyNFTNative",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "cancelListing",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "cancelOffer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "collectionSpecificFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "defaultFeePercentage",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "escrowedForOffers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeRecipient",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getListing",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "seller",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "paymentToken",
						"type": "address"
					},
					{
						"internalType": "uint64",
						"name": "listedAt",
						"type": "uint64"
					},
					{
						"internalType": "uint64",
						"name": "expiresAt",
						"type": "uint64"
					},
					{
						"internalType": "address",
						"name": "privateBuyer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "historicalListingIndex",
						"type": "uint256"
					}
				],
				"internalType": "struct AfterMintMarketplace.Listing",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "initialDefaultFeePercentage",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "initialFeeRecipient",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "initialLifeNodesNFTContract",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "initialRoyaltiesDisabled",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "initialAfterMintStorageAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			}
		],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lifeNodesNFTContract",
		"outputs": [
			{
				"internalType": "contract IERC721",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint64",
				"name": "expirationTimestamp",
				"type": "uint64"
			},
			{
				"internalType": "address",
				"name": "targetBuyer",
				"type": "address"
			}
		],
		"name": "listNFT",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "listings",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint64",
				"name": "listedAt",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			},
			{
				"internalType": "address",
				"name": "privateBuyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "historicalListingIndex",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint64",
				"name": "expirationTimestamp",
				"type": "uint64"
			}
		],
		"name": "makeOffer",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "offers",
		"outputs": [
			{
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint64",
				"name": "createdAt",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			},
			{
				"internalType": "uint256",
				"name": "historicalOfferIndex",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "operationalChainId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "proxiableUUID",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "reclaimExpiredOfferEscrow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContract",
				"type": "address"
			}
		],
		"name": "removeCollectionFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "royaltiesDisabled",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newAfterMintStorageAddress",
				"type": "address"
			}
		],
		"name": "setAfterMintStorage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_feeBps",
				"type": "uint256"
			}
		],
		"name": "setCollectionFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newFeePercentage",
				"type": "uint256"
			}
		],
		"name": "setDefaultFeePercentage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newFeeRecipient",
				"type": "address"
			}
		],
		"name": "setFeeRecipient",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newLifeNodesContract",
				"type": "address"
			}
		],
		"name": "setLifeNodesNFTContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newChainId",
				"type": "uint256"
			}
		],
		"name": "setOperationalChainId",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_isDisabled",
				"type": "bool"
			}
		],
		"name": "setRoyaltiesDisabled",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "subscriptionTiers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint64",
				"name": "durationSeconds",
				"type": "uint64"
			},
			{
				"internalType": "uint16",
				"name": "feeBps",
				"type": "uint16"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "nftContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "updateListingPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newImplementation",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "upgradeToAndCall",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userSubscriptions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "tierId",
				"type": "uint256"
			},
			{
				"internalType": "uint64",
				"name": "expiresAt",
				"type": "uint64"
			},
			{
				"internalType": "uint16",
				"name": "feeBpsApplied",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] 