import { NextResponse } from 'next/server';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pepecoin-2,basedai&vs_currencies=usd';

// Mock data to use as fallback if API calls fail or rate limit is hit
const MOCK_PRICES = {
  bitcoin: { usd: 67953.32 },
  ethereum: { usd: 3582.14 },
  'pepecoin-2': { usd: 0.00000118 },
  basedai: { usd: 0.77654 }
};

export async function GET() {
  try {
    // Add cache control headers to prevent too many requests to CoinGecko
    const response = await fetch(COINGECKO_URL, {
      headers: {
        'Accept': 'application/json',
      },
      // Use cache to reduce API calls
      next: { 
        revalidate: 300 // Cache for 5 minutes
      }
    });

    if (!response.ok) {
      console.warn(`CoinGecko API returned ${response.status}, using mock data`);
      // Return mock data with a 200 status if API call fails
      return NextResponse.json(MOCK_PRICES);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    // Return mock data with a 200 status on error
    return NextResponse.json(MOCK_PRICES);
  }
} 