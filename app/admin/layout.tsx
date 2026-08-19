import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · GharShare Admin",
  },
  // Layer two of keeping this out of search results, alongside the
  // x-robots-tag header in proxy.ts and the disallow in app/robots.ts.
  robots: { index: false, follow: false },
};

/**
 * Deliberately does nothing but set metadata.
 *
 * The signed-in chrome and the auth guard live one level down in
 * `(console)/layout.tsx`, because /admin/login and /admin/auth/callback are
 * *under* /admin and must not be guarded — a guard here would redirect the
 * login page to itself, forever.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
