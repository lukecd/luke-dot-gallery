import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel builds the application with native Next.js while Sites keeps using
  // the Vinext/Cloudflare pipeline defined in vite.config.ts.
  typescript: {
    tsconfigPath: "tsconfig.vercel.json",
  },
};

export default nextConfig;
