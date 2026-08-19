import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reproduced directly: any streamed response (a page with an async
  // Server Component behind app/loading.tsx's Suspense boundary, e.g. "/"
  // and "/properties") hangs forever — headers sent, body never finishes —
  // whenever the client sends Accept-Encoding and Next gzips the response.
  // Every real browser always sends Accept-Encoding, so this silently broke
  // the site for actual visitors while curl/fetch calls that didn't request
  // compression kept succeeding, which is why it looked intermittent.
  // Static pages with no streaming boundary compressed fine — this is
  // specifically gzip-vs-streaming deadlocking, not compression in general.
  compress: false,
  images: {
    remotePatterns: [
      // Placeholder seed images until real property photos are uploaded to Supabase Storage.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    // `next build` otherwise prerenders with one worker per CPU core (13 on
    // this machine), each opening its own DB connection pool — a burst of
    // concurrent fresh connections to Supabase that reliably got cancelled
    // with "statement timeout" and failed the build outright. This site has
    // well under 25 routes, so raising the per-worker minimum keeps the whole
    // build on a single worker, i.e. a single connection.
    staticGenerationMinPagesPerWorker: 25,
    staticGenerationRetryCount: 1,
  },
};

export default nextConfig;
