/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build to focus on React rendering issues
    ignoreDuringBuilds: true,
  },
  // Disable static optimization to prevent prerendering issues
  output: 'standalone',
  experimental: {
    // Handle styled-jsx and hydration issues
    forceSwcTransforms: true,
    // Disable static generation for error pages
    skipTrailingSlashRedirect: true,
  },
  // Disable styled-jsx to prevent SSR context issues
  compiler: {
    styledComponents: false,
  },
  // Custom webpack config to handle styled-jsx issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent styled-jsx from causing issues during SSR
      config.externals = config.externals || [];
      config.externals.push({
        'styled-jsx/style': 'styled-jsx/style',
      });
    }
    return config;
  },
  // Use dynamic rendering to avoid SSR issues
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fancyfrogfamily.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kektech.xyz', // Covers www.kektech.xyz
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.nachonft.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '3oh.myfilebase.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cosmicpond.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cosmicpond-metadata.com', // Add missing domain
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lilcoalies.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'basedsea.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'basedbeasts.xyz', // Covers www.basedbeasts.xyz
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dankpepes.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gangamevolutionbased.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'peach-binding-gamefowl-763.mypinata.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud', // Allow all subdomains of mypinata.cloud
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com', // Add Imgur for NFT images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fancyfrogfamily.com',
      },
      // Add common NFT metadata domains
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.arweave.net',
        pathname: '/**',
      },
      // Allow any domain for development (remove in production)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; 