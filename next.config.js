/** @type {import('next').NextConfig} */
const nextConfig = {
  // Client-side rendering only - no SSR for privacy-first app
  output: 'export',
  trailingSlash: true,
  
  webpack: (config, { isServer }) => {
    // Handle PDF.js and client-side only libraries
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdfjs-dist': 'commonjs pdfjs-dist',
        'mammoth': 'commonjs mammoth'
      });
    }

    // Configure for client-side processing
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  
  images: {
    unoptimized: true, // Required for static export
  },
  
  // Disable experimental features that might cause SSR issues
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;