import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure the dev server trusts the proxy headers
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
