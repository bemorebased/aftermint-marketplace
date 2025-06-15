/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Disable ESLint during builds to focus on core functionality
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Experimental features for Next.js 15
  experimental: {
    // Enable SWC transforms for better performance
    forceSwcTransforms: true,
  },
  
  // Server external packages (moved out of experimental in Next.js 15)
  serverExternalPackages: [],
  
  // Webpack configuration for better module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Improve module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Optimize chunks for better loading
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Image optimization configuration
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
        hostname: 'kektech.xyz',
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
        hostname: 'cosmicpond-metadata.com',
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
        hostname: 'basedbeasts.xyz',
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
        hostname: '*.mypinata.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
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
  
  // Output configuration for deployment
  output: 'standalone',
  
  // Disable trailing slash redirects
  trailingSlash: false,
  
  // Custom build ID for consistent builds
  generateBuildId: async () => {
    return 'aftermint-marketplace-build';
  },
};

export default nextConfig; 