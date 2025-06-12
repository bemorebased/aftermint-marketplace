import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Minimal ERC721 ABI to get token metadata
const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)'
];

// Simple ABI just to check token listings
const MARKETPLACE_ABI = [
  'function getListing(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, uint64 listedAt, uint64 expiresAt, address privateBuyer, address paymentToken))'
];

export async function GET() {
  try {
    // Connect to the local hardhat node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Contract addresses
    const MOCK_NFT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const MARKETPLACE_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
    
    // Get contract instances
    const nftContract = new ethers.Contract(MOCK_NFT_ADDRESS, ERC721_ABI, provider);
    const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
    
    // Check basic collection info
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    
    // Check the first 5 tokens to see if they're listed
    const tokenDetails = [];
    for (let i = 0; i < 5; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        const tokenURI = await nftContract.tokenURI(i);
        
        // Check listing info
        const listing = await marketplace.getListing(MOCK_NFT_ADDRESS, i);
        const isListed = listing && listing.seller !== ethers.ZeroAddress;
        
        tokenDetails.push({
          tokenId: i,
          owner,
          tokenURI,
          isListed,
          listingPrice: isListed ? ethers.formatEther(listing.price) : '0',
          seller: isListed ? listing.seller : null
        });
      } catch (error: any) {
        tokenDetails.push({
          tokenId: i,
          error: error.message || 'Unknown error',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      collection: { name, symbol, address: MOCK_NFT_ADDRESS },
      marketplace: { address: MARKETPLACE_ADDRESS },
      tokens: tokenDetails
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' }, 
      { status: 500 }
    );
  }
} 