export const marketplaceABI = [
  {
    "inputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"}
    ],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          {"name": "seller", "type": "address"},
          {"name": "price", "type": "uint256"},
          {"name": "paymentToken", "type": "address"},
          {"name": "listedAt", "type": "uint64"},
          {"name": "expiresAt", "type": "uint64"},
          {"name": "privateBuyer", "type": "address"},
          {"name": "historicalListingIndex", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"}
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"},
      {"name": "price", "type": "uint256"},
      {"name": "expirationTimestamp", "type": "uint64"},
      {"name": "targetBuyer", "type": "address"},
      {"name": "paymentToken", "type": "address"}
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; 