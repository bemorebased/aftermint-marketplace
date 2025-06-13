/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Handle styled-jsx and hydration issues
    forceSwcTransforms: true,
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
        hostname: 'i.imgur.com', // Add Imgur for NFT images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fancyfrogfamily.com',
        pathname: '/**',
      },
      // === IPFS Gateways for NFT Images ===
      {
        protocol: 'https',
        hostname: '*.ipfs.4everland.link', // Support all 4everland IPFS subdomains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link', // Specific domain from error
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link', // Support IPFS dweb.link
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.cf-ipfs.com', // Support Cloudflare IPFS
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud', // Pinata IPFS gateway
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud', // Pinata dedicated gateways (consolidated)
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myfilebase.com', // Filebase IPFS gateways
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nursing-gray-opossum.myfilebase.com', // Specific domain from error
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bafybeicrsadgtje7n67eqon75d2ytrg4hb7sptcyj2b7lo4whi25wfjpbm.ipfs.4everland.link', // LifeNodes specific
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bafybeigsw5cmb5x7k763jdl67r5vuohkwqkl424psa4t27zrjwjx7ikevi.ipfs.4everland.link', // LifeNodes specific  
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.infura-ipfs.io', // Infura IPFS gateway
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bafybeicrsadgtje7n67eqon75d2ytrg4hb7sptcyj2b7lo4whi25wfjpbm.ipfs.io', // Specific LifeNodes IPFS hash
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com', // Cloudflare IPFS gateway
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cosmicpond-metadata.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig; 