import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Ignore problematic files from thread-stream package
    config.module.rules.push({
      test: /node_modules[\\/]thread-stream[\\/](test|bench)/,
      use: 'null-loader',
    });
    
    // Fallback for modules that might cause issues in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    return config;
  },
  // Mark packages that should be external to avoid bundling issues
  serverExternalPackages: ['pino', 'thread-stream', 'pino-pretty'],
  // Disable Turbopack and use Webpack
  experimental: {},
};

export default nextConfig;
