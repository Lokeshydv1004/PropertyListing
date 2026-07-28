import Link from "next/link";

const EXPLORE_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
];

const COMPANY_LINKS = [{ href: "/contact", label: "Contact" }];

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-green text-sm font-bold text-white">
                G
              </span>
              GharShare
            </Link>
            <p className="mt-3 max-w-xs text-sm">
              Fractional real estate investment, made simple. Browse
              opportunities and submit your interest — our team handles the
              rest.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-3 space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs">
          © {new Date().getFullYear()} GharShare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
