import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // The old marketing pages were replaced by the CircleOn site, which has no
  // equivalent for /voices or /docs. These keep any existing link working
  // rather than dropping visitors on a 404. Temporary (307) rather than
  // permanent, so the URLs can be reclaimed when those pages are rebuilt.
  async redirects() {
    return [
      { source: '/platform', destination: '/', permanent: false },
      { source: '/how-it-works', destination: '/', permanent: false },
      { source: '/voices', destination: '/voice-agent', permanent: false },
      { source: '/docs', destination: '/help', permanent: false },
    ];
  },
};

export default nextConfig;
