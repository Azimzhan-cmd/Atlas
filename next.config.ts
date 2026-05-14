import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  // Transpile Three.js ecosystem
  transpilePackages: ["three"],
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    rules: {
      // Treat GLSL/WGSL shader files as raw text strings
      "*.glsl":  { loaders: ["raw-loader"], as: "*.js" },
      "*.vert":  { loaders: ["raw-loader"], as: "*.js" },
      "*.frag":  { loaders: ["raw-loader"], as: "*.js" },
      "*.wgsl":  { loaders: ["raw-loader"], as: "*.js" },
    },
  },
};

export default nextConfig;
