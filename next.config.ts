import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack for this platform
  turbopack: undefined,
  // Output configuration for static export
  output: "standalone",
};

export default nextConfig;
