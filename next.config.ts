import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // We keep this repo inside a larger workspace that also has lockfiles.
    // Without an explicit root, Turbopack may resolve deps relative to the wrong package.json.
    root: __dirname,
  },
};

export default nextConfig;
