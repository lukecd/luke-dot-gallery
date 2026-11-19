import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/internal/plant-generation": ["./admin-lib/plant-illustrations/rosemary.png"],
  },
};

export default nextConfig;
