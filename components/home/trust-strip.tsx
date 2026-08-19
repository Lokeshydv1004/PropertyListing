import {
  BadgeCheck,
  Banknote,
  FileCheck2,
  Landmark,
  ShieldCheck,
} from "lucide-react";

const TRUST_BADGES = [
  { icon: FileCheck2, label: "SEBI Compliant", sub: "Structure" },
  { icon: BadgeCheck, label: "RERA Compliant", sub: "Properties" },
  { icon: ShieldCheck, label: "Verified Legal", sub: "Due Diligence" },
  { icon: Banknote, label: "Escrow Account", sub: "Protection" },
  { icon: Landmark, label: "Bank Grade", sub: "Security" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-[#032E24] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-lg font-semibold text-white">
          Your investment is
          <br className="hidden sm:block" /> backed by trust.
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold-700">
                  <Icon className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground text-white">
                    {badge.label}
                  </p>
                  <p className="text-xs text-muted-foreground text-white/85">
                    {badge.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
