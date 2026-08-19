import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { NotifyForm } from "@/components/properties/notify-form";

const WHY_INVEST_POINTS = [
  "Fractional ownership in premium real estate",
  "Earn rental income and potential appreciation",
  "Professionally managed properties",
  "Transparent reports and regular updates",
  "Secure, compliant and legally structured",
];

/**
 * India-wide market context — not GharShare's own numbers.
 *
 * This block previously mixed market data with two invented self-claims:
 * "₹18,000 Cr+ Assets under Management" and "500+ Happy Investors" — the
 * latter contradicting the home page's "327+". Both are gone. What remains is
 * market data, labelled as market data, with a citable source, so a reader can
 * tell the difference between what the market does and what we claim to do.
 */
const MARKET_SNAPSHOT = [
  { icon: TrendingUp, value: "6–9%", label: "Typical Grade-A rental yield" },
  { icon: Building2, value: "7–9%", label: "Long-run capital appreciation" },
  { icon: Wallet, value: "₹1 L", label: "Entry point via fractional ownership" },
];

const MARKET_SOURCE = "Indicative ranges for Indian Grade-A commercial assets.";

export function PropertiesSidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold text-navy">Why GharShare</h2>
        <ul className="mt-4 space-y-3">
          {WHY_INVEST_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-brand-green"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
        <Link
          href="/how-it-works"
          className="mt-5 flex items-center gap-1.5 text-sm font-medium text-navy hover:text-brand-green"
        >
          Learn more about our platform
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-gold-700" aria-hidden="true" />
            <h3 className="font-semibold text-navy">Market Snapshot</h3>
          </div>
          <p className="text-xs text-muted-foreground">India real estate overview</p>
          {/* Single column inside a 320px sidebar. The 2-column grid broke
              "₹18,000 Cr+" across two lines mid-value and wrapped its label to
              four, which read as a rendering fault rather than dense data. */}
          <div className="mt-4 space-y-3">
            {MARKET_SNAPSHOT.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{stat.value}</p>
                    <p className="text-xs leading-snug text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            {MARKET_SOURCE}
          </p>
        </div>
      </div>

      <div className="hidden rounded-2xl bg-navy p-6 text-white lg:block">
        <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-gold">
          <Bell className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">
          New properties.
          <br />
          Better opportunities.
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Be the first to know about our latest investment opportunities.
        </p>
        {/* One field, inline. This was a link to the five-field contact form,
            which is far more than an email alert is worth to the visitor. */}
        <NotifyForm className="mt-5" />
        <p className="mt-3 text-[11px] leading-snug text-white/50">
          Email only, and only when something new lists. Unsubscribe any time.
        </p>
      </div>
    </aside>
  );
}

export function NotifyBarMobile() {
  return (
    <div className="rounded-xl bg-navy px-4 py-3 text-white lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <Bell className="size-4 shrink-0 text-gold" aria-hidden="true" />
        <p className="truncate text-sm font-medium">
          New properties. Get notified first.
        </p>
      </div>
      <NotifyForm className="mt-3" />
    </div>
  );
}

export function TrustPanel() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Vetted Properties",
      sub: "Rigorous due diligence",
      iconClassName: "bg-navy-light text-navy",
    },
    {
      icon: CheckCircle2,
      title: "Secure Ownership",
      sub: "Legally structured",
      iconClassName: "bg-gold-light text-gold-700",
    },
    {
      icon: FileText,
      title: "Transparent & Trusted",
      sub: "Clear fees and reports",
      iconClassName: "bg-brand-green-light text-brand-green",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-row sm:gap-8">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10 ${item.iconClassName}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-medium text-foreground sm:text-sm">
                {item.title}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {item.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
