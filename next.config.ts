import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

if (supabaseUrl && supabaseUrl.protocol !== "https:" && supabaseUrl.protocol !== "http:") {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS.");
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: supabaseUrl
      ? [{
          protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
          hostname: supabaseUrl.hostname,
          port: supabaseUrl.port,
          pathname: "/storage/v1/object/**",
        }]
      : [],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
