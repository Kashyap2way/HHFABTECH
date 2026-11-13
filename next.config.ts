import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // 70 for the large hero slides (lighter), 75 is the default for everything else.
    qualities: [70, 75],
  },
  partialPrefetching: true,
  async redirects() {
    // The legacy static site used .html URLs that Google has indexed.
    // Permanent (308) redirects pass their ranking to the new URLs.
    const pages = [
      "about",
      "products",
      "calculator",
      "career",
      "contact",
      "quote",
      "petroleum-tanker",
      "chemical-tanker",
      "ss-tanker",
      "fuel-bowser",
      "storage-tank",
      "water-tanker",
    ];
    return [
      { source: "/index.html", destination: "/", permanent: true },
      ...pages.map((page) => ({
        source: `/${page}.html`,
        destination: `/${page}`,
        permanent: true,
      })),
    ];
  },
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
