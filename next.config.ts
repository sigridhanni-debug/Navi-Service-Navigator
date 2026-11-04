import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The seed reads data/services.csv at runtime; make sure it ships with the server.
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
