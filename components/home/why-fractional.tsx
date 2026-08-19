import { Coins, LineChart, ShieldCheck } from "lucide-react";

/**
 * The site's most persuasive content, rebuilt as text.
 *
 * This section used to be three flat PNGs with every word baked into the
 * pixels. That made it invisible to Google (zero indexable text on the one
 * section that could rank for "fractional real estate investment India"),
 * unreadable to screen readers (four words of alt text in total — a WCAG
 * 1.1.1 failure, images of text), unable to reflow on a 375px phone, and
 * pixelated for anyone who zooms.
 *
 * It also carries `id="why-fractional"`, which the navbar's "Why GharShare"
 * link has always pointed at and which no element in the codebase had — so
 * that link landed on the home page and scrolled nowhere.
 */
const PILLARS = [
  {
    icon: Coins,
    title: "Own premium property from a fraction of the price",
    body: "A ₹5 crore Grade-A office is out of reach for most people. Fractional ownership splits it into shares — the same asset institutions buy, without a home loan.",
  },
  {
    icon: LineChart,
    title: "Two ways to earn",
    body: "Your share of the rent, distributed periodically, plus your share of any appreciation when the property is sold.",
  },
  {
    icon: ShieldCheck,
    title: "Fully managed, fully transparent",
    body: "A professional manager handles tenanting, maintenance and compliance. You get periodic reports on rent collected and money distributed, with fees stated upfront on every listing.",
  },
];

const COMPARISON: [string, string, string][] = [
  ["Capital needed", "₹50 lakh – ₹5 crore", "A fraction of the asset price"],
  ["Diversification", "One property, one city", "Several properties, several cities"],
  ["Management", "You handle tenants and repairs", "Professionally managed"],
  ["Paperwork", "Registration, loan, compliance", "Handled during onboarding"],
  ["Exit", "Find a buyer yourself", "Planned exit at end of horizon"],
];

export function WhyFractional() {
  return (
    <section
      id="why-fractional"
      className="scroll-mt-20 bg-white py-10 sm:py-14"
      aria-labelledby="why-fractional-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="why-fractional-heading"
          className="max-w-2xl text-2xl font-bold tracking-tight text-navy sm:text-3xl"
        >
          Why fractional real estate?
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The same assets institutions buy, in shares small enough to hold
          alongside the rest of your portfolio.
        </p>

        <div className="mt-5 divide-y divide-border sm:mt-8 sm:grid sm:gap-6 sm:divide-y-0 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="py-4 first:pt-0 last:pb-0 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-6 sm:first:pt-6 sm:last:pb-6"
              >
                {/* Icon inline with the title on a phone, stacked above it
                    from sm up. Stacked, it cost a full line of vertical space
                    per card for pure decoration. */}
                <div className="flex items-center gap-3 sm:block">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-light text-navy sm:size-11">
                    <Icon className="size-4.5 sm:size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-navy sm:mt-4 sm:text-lg">
                    {pillar.title}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* A real table, not an image of one — so it reflows on a phone, is
            readable by a screen reader, and can be indexed.

            Two renderings of one array. A single table with a horizontal
            scroll put the "Fractional with GharShare" column — the entire
            persuasive half of the comparison — off-screen at 390px behind a
            scroll nobody discovers. All a phone user saw was "₹50 lakh – ₹5
            crore" and "You handle tenants and repairs", so on mobile the
            table argued against the product. Stacked cards below sm show
            both sides at once; the table returns where it fits. */}
        <h3 className="mt-8 text-lg font-semibold text-navy sm:mt-12">
          Buying outright vs. fractional
        </h3>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border sm:hidden">
          {/* Column headings once, not repeated inside all five rows. */}
          <div className="grid grid-cols-2 gap-3 bg-navy-light px-4 py-2">
            <p className="text-[11px] font-semibold tracking-wide text-navy uppercase">
              Outright
            </p>
            <p className="text-[11px] font-semibold tracking-wide text-brand-green uppercase">
              Fractional
            </p>
          </div>
          <ul className="divide-y divide-border">
            {COMPARISON.map(([label, outright, fractional]) => (
              <li key={label} className="px-4 py-2.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {label}
                </p>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <p className="text-[13px] leading-snug text-foreground/80">
                    {outright}
                  </p>
                  <p className="text-[13px] leading-snug font-medium text-brand-green">
                    {fractional}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="w-full min-w-[520px] text-sm">
            <caption className="sr-only">
              A comparison of buying a property outright against fractional
              ownership through GharShare, across capital needed,
              diversification, management, paperwork and exit.
            </caption>
            <thead className="bg-navy-light text-navy">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  <span className="sr-only">Aspect</span>
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Buying outright
                </th>
                <th scope="col" className="px-5 py-3 text-left font-semibold">
                  Fractional with GharShare
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON.map(([label, outright, fractional]) => (
                <tr key={label}>
                  <th
                    scope="row"
                    className="px-5 py-3 text-left font-medium text-navy"
                  >
                    {label}
                  </th>
                  <td className="px-5 py-3 text-muted-foreground">{outright}</td>
                  <td className="px-5 py-3 font-medium text-brand-green">
                    {fractional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
