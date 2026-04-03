import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    serverExternalPackages: ['ssh2', 'dockerode'],
    // experimental: {
    //   instrumentationHook: true,
    // },
};

export default nextConfig;
