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
    // Create an AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Add cache control headers to prevent too many requests to CoinGecko
    const response = await fetch(COINGECKO_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AfterMint-NFT-Marketplace/1.0'
      },
      signal: controller.signal,
      // Use cache to reduce API calls
      next: { 
        revalidate: 300 // Cache for 5 minutes
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`CoinGecko API returned ${response.status}, using mock data`);
      // Return mock data with a 200 status if API call fails
      return NextResponse.json(MOCK_PRICES, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('aborted')) {
      console.warn('CoinGecko API request timed out, using mock data');
    } else {
      console.error('Error fetching prices from CoinGecko:', errorMessage);
    }
    
    // Return mock data with a 200 status on error
    return NextResponse.json(MOCK_PRICES, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  }
} 