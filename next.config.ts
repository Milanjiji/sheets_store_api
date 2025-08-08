import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images:{
        domains:['lh3.googleusercontent.com','firebasestorage.googleapis.com']
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript:{
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        config.resolve.symlinks = true; 
        return config;
    },
};

export default nextConfig;
