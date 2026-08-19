/**
 * The blog corpus. File-based on purpose — no CMS, no MDX toolchain.
 *
 * The site has no organic-search engine at all: it can only be found by
 * people who already know the brand name. The buyers for this product search
 * before they buy, and they search in questions — "is fractional real estate
 * legal in India", "how is rental income from fractional property taxed" —
 * which is exactly the shape of content that ranks and exactly what the site
 * publishes none of.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  PRE-PUBLICATION TODO — every post below carries `needsReview: true`.
 * ─────────────────────────────────────────────────────────────────────────
 * These are drafts describing how Indian regulation and tax law ordinarily
 * apply to these structures. They are written carefully and hedged where the
 * position is genuinely uncertain, but they are legal and tax content on a
 * financial services site: have a lawyer and a chartered accountant read them
 * before you publish, set `reviewedBy`, and flip `needsReview` to false.
 * While it is true, a visible banner renders on the post saying so.
 *
 * Anything requiring current market data — yields, city comparisons, price
 * points — is marked inline with TODO rather than guessed at, for the same
 * reason the fabricated statistics came off the home page.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "todo"; text: string };

export type InsightPost = {
  slug: string;
  title: string;
  /** Used for the card, the meta description and the OG description. */
  summary: string;
  category: "Regulation" | "Tax" | "Markets" | "How to invest";
  /** ISO date. */
  publishedAt: string;
  readingMinutes: number;
  /** Renders a visible "not yet reviewed" banner while true. */
  needsReview: boolean;
  /** TODO(pre-launch): the professional who reviewed it, once one has. */
  reviewedBy?: string;
  body: Block[];
};

const NOT_ADVICE =
  "This article is general information, not investment, legal or tax advice. It does not take account of your circumstances. Take advice from a qualified professional before acting on any of it.";

export const INSIGHTS: InsightPost[] = [
  {
    slug: "is-fractional-real-estate-investment-legal-in-india",
    title: "Is fractional real estate investment legal in India?",
    summary:
      "Short answer: yes, and since SEBI's SM REIT framework there is now a regulated route for it. The longer answer is about which structure a platform actually uses, and why that matters to you.",
    category: "Regulation",
    publishedAt: "2026-08-19",
    readingMinutes: 7,
    needsReview: true,
    body: [
      {
        type: "p",
        text: "This is the first question almost everyone asks, and the honest answer has two halves. Owning a share of a property alongside other people has always been legal in India — co-ownership is ordinary property law. What was unregulated until recently was the business of platforms packaging and selling those shares to the public.",
      },
      { type: "h2", text: "What changed" },
      {
        type: "p",
        text: "For most of the last decade, fractional ownership platforms operated outside any dedicated regulatory perimeter. The typical structure was a special purpose vehicle — usually a private limited company or an LLP — that held one property, with investors holding shares or units in that vehicle. Perfectly legal, but with no regulator setting standards for disclosure, valuation, or what happened to your money before a deal closed.",
      },
      {
        type: "p",
        text: "SEBI moved on this. Following a consultation on fractional ownership platforms, it created a framework for Small and Medium REITs — SM REITs — which brings schemes holding smaller assets inside the REIT regulations. That gave the sector something it had never had: a licensed route, with registration requirements, mandatory disclosures and rules about how assets are held.",
      },
      {
        type: "callout",
        text: "The practical takeaway is not \"fractional investing is legal\" — it always was. It is that there is now a regulated version and an unregulated version, and you should know which one you are being sold.",
      },
      { type: "h2", text: "What the SM REIT framework requires" },
      {
        type: "p",
        text: "Broadly, and subject to the detail of the regulations as they stand when you invest:",
      },
      {
        type: "ul",
        items: [
          "Schemes must register with SEBI, rather than simply existing.",
          "There are net-worth and experience requirements on the investment manager — the entity running the scheme.",
          "Assets must generally be completed and revenue-generating, not under construction. This matters: construction risk is a completely different risk from tenancy risk.",
          "A high proportion of net distributable cash flow must be distributed to unit holders on a regular cycle, rather than retained at the manager's discretion.",
          "There is a minimum investment size per investor, set deliberately high to keep retail investors who cannot carry the risk out of the product.",
          "Valuation and disclosure obligations are specified rather than left to the platform.",
        ],
      },
      {
        type: "todo",
        text: "Before publishing, confirm the current thresholds — asset value band, manager net worth, minimum investment per investor, and distribution frequency — against the SEBI REIT Regulations as amended, and state the figures explicitly here. Readers searching this question want the numbers, and stale numbers are worse than none.",
      },
      { type: "h2", text: "What to ask any platform" },
      {
        type: "p",
        text: "Whichever structure a platform uses, these questions have documented answers. A platform that cannot answer them in writing is telling you something.",
      },
      {
        type: "ul",
        items: [
          "What exactly do I hold — units in a registered scheme, shares in an SPV, or a direct co-ownership interest recorded somewhere?",
          "Is the scheme registered with SEBI? If so, what is the registration number?",
          "Where does my money sit between the day I commit and the day the transaction completes, and who controls that account?",
          "Who values the property, and are they independent of the platform and the seller?",
          "What happens to my holding if the platform ceases to operate?",
          "What are the fees, in full — entry, ongoing, and on exit?",
        ],
      },
      { type: "h2", text: "The risks are unchanged by regulation" },
      {
        type: "p",
        text: "Regulation improves disclosure and conduct. It does not make an investment safe. A regulated scheme holding a badly chosen building with a weak tenant will still lose money. Property values fall as well as rise, rental income stops when a tenant leaves, and none of these investments are liquid — you cannot sell on demand.",
      },
      { type: "callout", text: NOT_ADVICE },
    ],
  },
  {
    slug: "sm-reit-vs-reit-vs-fractional-ownership",
    title: "SM REIT vs REIT vs fractional ownership: what's the difference?",
    summary:
      "Three ways to own commercial property without buying a building. They differ on ticket size, liquidity, control and who is watching the manager — and those differences decide which one suits you.",
    category: "Regulation",
    publishedAt: "2026-08-19",
    readingMinutes: 8,
    needsReview: true,
    body: [
      {
        type: "p",
        text: "These three get used interchangeably and they are not the same thing. The distinctions are not academic: they change how much you need, how easily you can get out, and how much of your outcome depends on one building rather than many.",
      },
      { type: "h2", text: "Listed REITs" },
      {
        type: "p",
        text: "A REIT is a listed trust holding a large, diversified portfolio — typically many office parks across several cities. You buy units on the stock exchange exactly as you would buy a share.",
      },
      {
        type: "ul",
        items: [
          "Ticket size: small. You can buy a single unit.",
          "Liquidity: high. You can sell on any trading day at the market price.",
          "Diversification: high — dozens of buildings and tenants.",
          "Control: none. You cannot choose which buildings you are exposed to.",
          "Price behaviour: units trade, so the price moves daily and can trade below the value of the underlying property.",
        ],
      },
      { type: "h2", text: "SM REITs" },
      {
        type: "p",
        text: "SEBI's Small and Medium REIT framework sits between the two. A scheme holds a small number of assets — often one — and is registered and regulated, but the units are not necessarily as liquid as a large listed REIT's.",
      },
      {
        type: "ul",
        items: [
          "Ticket size: substantially higher than a listed REIT, by design.",
          "Liquidity: better than unregulated fractional ownership, but not comparable to a large listed REIT.",
          "Diversification: low. You are exposed to a small number of specific assets.",
          "Control: you choose the scheme, so you choose the asset — which is the entire appeal for people who want to pick the building.",
          "Oversight: registered with SEBI, with defined disclosure and distribution obligations.",
        ],
      },
      {
        type: "todo",
        text: "Insert the current minimum investment per investor for an SM REIT scheme, and the asset value band a scheme must fall within, from the regulations as they stand at publication.",
      },
      { type: "h2", text: "Fractional ownership through an SPV" },
      {
        type: "p",
        text: "The older model, and still common. A vehicle is formed to hold one property; investors hold shares or units in that vehicle proportional to what they put in.",
      },
      {
        type: "ul",
        items: [
          "Ticket size: set by the platform, often lower than an SM REIT minimum.",
          "Liquidity: lowest of the three. Exit generally depends on the property being sold, or on finding a private buyer for your holding.",
          "Diversification: none within a single investment. One building, often one tenant.",
          "Control: you pick the specific asset.",
          "Oversight: depends entirely on the structure used. This is where the questions in our article on legality matter most.",
        ],
      },
      { type: "h2", text: "Which one is right?" },
      {
        type: "p",
        text: "There is no universal answer, but the shape of it is straightforward. If you want property exposure with the ability to sell on a Tuesday, a listed REIT is the instrument built for that. If you specifically want to own a stake in a building you have looked at, chosen and can reason about — and you can leave the money invested for the full horizon — the single-asset structures do something a REIT cannot.",
      },
      {
        type: "p",
        text: "What should not drive the decision is a headline yield figure. A single asset with a 9% yield and one tenant whose lease expires in three years is not obviously better than a diversified portfolio yielding less. The yield is compensation for the concentration.",
      },
      { type: "callout", text: NOT_ADVICE },
    ],
  },
  {
    slug: "how-rental-income-from-fractional-property-is-taxed",
    title: "How rental income from fractional property is taxed in India",
    summary:
      "Rental distributions, TDS, and what happens on exit. The treatment depends on the structure you invested through, which is why the first question is always \"what do I actually hold?\"",
    category: "Tax",
    publishedAt: "2026-08-19",
    readingMinutes: 8,
    needsReview: true,
    body: [
      {
        type: "callout",
        text: "Tax law changes, frequently and with retrospective effect on positions already taken. Everything below is a general description of how these structures are ordinarily treated. Confirm your own position with a chartered accountant before you invest and again before you file.",
      },
      { type: "h2", text: "Everything follows from the structure" },
      {
        type: "p",
        text: "There is no single answer to \"how is fractional property taxed\", because the phrase covers several different legal arrangements. What you hold determines what you are taxed on.",
      },
      {
        type: "ul",
        items: [
          "Direct co-ownership of the property: you are a property owner. Your share of the rent is your income from house property, with the deductions that ordinarily attach to it.",
          "Shares or units in an SPV holding the property: the vehicle earns the rent and is taxed on it; what reaches you is a distribution, and its character in your hands depends on how it is paid.",
          "Units in a registered REIT or SM REIT scheme: distributions carry a pass-through character, and the components are taxed differently from one another.",
        ],
      },
      { type: "h2", text: "Distributions from a REIT-type structure" },
      {
        type: "p",
        text: "A distribution from a REIT-style scheme is not one thing. It is typically made up of components — an interest element, a dividend element, and a portion that represents repayment of capital — and each is treated differently in the hands of the unit holder. The scheme is required to tell you the breakdown; you need that statement to file correctly.",
      },
      {
        type: "todo",
        text: "State the current treatment of each distribution component for a resident individual, including the rate applying to the interest component and the position on the dividend component, as at publication. This is the section readers arrive for.",
      },
      { type: "h2", text: "TDS" },
      {
        type: "p",
        text: "Tax is generally deducted at source before a distribution reaches you, at rates that differ for residents and non-residents. Two practical consequences:",
      },
      {
        type: "ul",
        items: [
          "The amount that lands in your bank account is not your taxable income — it is net of deduction. Do not treat the credited figure as the number to report.",
          "The deduction should appear in your Form 26AS, and you claim credit for it when you file. If it does not appear, chase the deductor early rather than at filing time.",
        ],
      },
      { type: "h2", text: "Non-residents" },
      {
        type: "p",
        text: "NRIs face deduction at non-resident rates, which are typically higher. Where a double taxation avoidance agreement exists between India and your country of residence, it may reduce the rate — but claiming treaty relief requires paperwork, including a tax residency certificate, and it needs to be in place before the distribution rather than argued afterwards. A PAN is required in any case.",
      },
      { type: "h2", text: "Exit" },
      {
        type: "p",
        text: "When the property or your holding is sold, the gain is a capital gain. Whether it is short-term or long-term depends on how long you held it, and the applicable holding period differs between direct property, unlisted shares and listed units — another reason the structure matters.",
      },
      {
        type: "todo",
        text: "Set out the current holding periods and rates for each of: immovable property, unlisted shares, and listed REIT units — and note the position on indexation as it stands at publication.",
      },
      { type: "h2", text: "What to keep" },
      {
        type: "ul",
        items: [
          "The investment agreement and your holding certificate.",
          "Every distribution statement, showing the component breakdown and the tax deducted.",
          "Your Form 26AS / AIS each year, reconciled against those statements.",
          "The purchase and sale documentation, for computing the gain on exit.",
        ],
      },
      { type: "callout", text: NOT_ADVICE },
    ],
  },
  {
    slug: "how-to-compare-commercial-rental-yields-across-indian-cities",
    title: "How to compare commercial rental yields across Indian cities",
    summary:
      "A yield number on its own tells you almost nothing. Here is what has to sit behind it before a comparison between two cities — or two buildings — means anything.",
    category: "Markets",
    publishedAt: "2026-08-19",
    readingMinutes: 7,
    needsReview: true,
    body: [
      {
        type: "p",
        text: "Every listing quotes a yield, and the temptation is to rank them. It is usually the wrong thing to do, because the same word is being used for several different calculations.",
      },
      { type: "h2", text: "Gross is not net" },
      {
        type: "p",
        text: "A gross yield is annual rent divided by the property value. A net yield subtracts what it costs to hold the asset — maintenance and common-area charges that fall on the owner, property tax, insurance, management fees, and an allowance for the periods it sits empty.",
      },
      {
        type: "p",
        text: "The gap between the two is not small, and it is not consistent between asset types. Comparing one platform's gross figure with another's net figure ranks the platforms' disclosure choices, not the assets.",
      },
      {
        type: "callout",
        text: "Before comparing two yields, establish that both are calculated the same way, against the same denominator, over the same period. Surprisingly often they are not.",
      },
      { type: "h2", text: "What the denominator is" },
      {
        type: "p",
        text: "Yield against an independent valuation and yield against the price you are being asked to pay are different numbers whenever those two figures differ. The second is the one that describes your return.",
      },
      { type: "h2", text: "What actually drives the difference between cities" },
      {
        type: "p",
        text: "Cities differ in yield mainly because they differ in the risk and growth attached to the rent. Higher yield usually means the market is pricing in something.",
      },
      {
        type: "ul",
        items: [
          "Capital values: where values have run ahead of rents, yields compress. A low yield can indicate an expensive, well-regarded market rather than a bad asset.",
          "Vacancy: a high headline yield in a market with rising vacancy is fragile — the rent has to keep being paid for the yield to be real.",
          "Tenant quality and lease length: a multinational on nine years with a five-year lock-in is a different security from a local occupier on three years.",
          "Escalation terms: a lease with contractual escalation grows the yield over time; one without it shrinks in real terms every year.",
          "Supply pipeline: a large amount of new completions due nearby caps what the landlord can ask at renewal.",
          "Infrastructure: a confirmed metro line changes a micro-market. A proposed one does not, until it is built.",
        ],
      },
      { type: "h2", text: "Compare micro-markets, not cities" },
      {
        type: "p",
        text: "\"Mumbai\" and \"Bangalore\" are not investable units. Within a single city, yields on comparable Grade-A space vary widely between business districts, and a peripheral park with weak connectivity behaves nothing like a core district asset. A city-level average is a headline, not an input to a decision.",
      },
      {
        type: "todo",
        text: "This post deliberately contains no yield figures. If you want it to rank for city-comparison searches, add a sourced table of current Grade-A yields by micro-market, with the source and the as-at date named on the page, and set a reminder to refresh it. Do not publish numbers you cannot cite — an unsourced market table is the same mistake as an unsourced platform statistic.",
      },
      { type: "h2", text: "The question worth asking" },
      {
        type: "p",
        text: "Not \"which city yields more\", but \"what would have to go wrong for this rent to stop, and how likely is that\". A yield is the price of bearing a specific set of risks. Understanding the risks is the analysis; the yield is just the label on it.",
      },
      { type: "callout", text: NOT_ADVICE },
    ],
  },
  {
    slug: "how-to-evaluate-a-grade-a-office-investment",
    title: "How to evaluate a Grade-A office investment",
    summary:
      "The lease is the investment. A practical checklist covering the tenant, the terms, the building and the paperwork — and the questions that separate a good asset from a good-looking one.",
    category: "How to invest",
    publishedAt: "2026-08-19",
    readingMinutes: 9,
    needsReview: true,
    body: [
      {
        type: "p",
        text: "With a leased commercial asset you are not really buying a building. You are buying a stream of rental payments, secured on a building, from a specific tenant, under a specific contract. Almost everything that determines your outcome is in that contract.",
      },
      { type: "h2", text: "Start with the tenant" },
      {
        type: "ul",
        items: [
          "Who are they, precisely? The named entity on the lease, not the brand on the door — a local subsidiary and its global parent are different credit risks.",
          "How long have they occupied this space, and have they renewed before? A tenant who has renewed once is far more likely to renew again.",
          "What is this location to them? A regional headquarters with fit-out they paid for is sticky. A back-office floor is not.",
          "Are they current on rent? Ask to see the rent roll, not a summary of it.",
        ],
      },
      { type: "h2", text: "Then the lease terms" },
      {
        type: "ul",
        items: [
          "Remaining term, and the lock-in within it. Lock-in is the part you can rely on; the rest is optionality that belongs to the tenant.",
          "Escalation: how much, how often, and is it contractual or subject to negotiation.",
          "Notice period and break clauses — a nine-year lease with a tenant break at year three is a three-year lease with extra words.",
          "Deposit: how many months, and who holds it.",
          "Who pays what: maintenance, common-area charges, property tax, insurance and structural repairs. Every one of these that falls on the owner reduces the net yield below the headline.",
        ],
      },
      {
        type: "callout",
        text: "A single question exposes most of this: what is the earliest date on which this tenant could legally stop paying, and what happens to the yield then?",
      },
      { type: "h2", text: "The building itself" },
      {
        type: "ul",
        items: [
          "Age and condition, and when major systems — lifts, chillers, façade — were last renewed. These are large, lumpy costs.",
          "Power backup, floor plate efficiency and parking ratio. These determine who will take the space next.",
          "Certifications where relevant, which increasingly affect which corporate occupiers can lease at all.",
          "Connectivity: distance to transport, and whether planned infrastructure is under construction or merely announced.",
          "Competing supply nearby, which sets the rent achievable at renewal.",
        ],
      },
      { type: "h2", text: "The paperwork" },
      {
        type: "p",
        text: "This is the least interesting section and the one that most often decides whether an investment is sound.",
      },
      {
        type: "ul",
        items: [
          "Clear chain of title, and a current encumbrance certificate.",
          "Approved plans, occupancy certificate, and RERA registration where the project requires it — with the number, which you can verify yourself on the state authority's portal.",
          "An independent valuation, commissioned from a valuer with no relationship to the seller.",
          "A legal due diligence report you are allowed to read in full, not a summary of its conclusions.",
        ],
      },
      { type: "h2", text: "Then the structure and the exit" },
      {
        type: "p",
        text: "Establish what you will hold, where your money sits before completion, what fees apply at entry, annually and on exit, and — most importantly — how this investment is expected to end. A stated horizon is not an exit plan. Ask who decides when to sell, what happens if the market is poor at that point, and whether you can transfer your holding earlier if you need to.",
      },
      { type: "h2", text: "A reasonable red-flag list" },
      {
        type: "ul",
        items: [
          "A yield materially above comparable assets with no explanation offered for why.",
          "Reluctance to share the full legal and valuation reports.",
          "Fees that are described but not quantified.",
          "Projected appreciation presented with the same confidence as contracted rent.",
          "Photographs that are renders, not labelled as renders.",
        ],
      },
      { type: "callout", text: NOT_ADVICE },
    ],
  },
];

export function getInsightBySlug(slug: string): InsightPost | undefined {
  return INSIGHTS.find((post) => post.slug === slug);
}

/** Newest first, which is how an index should read. */
export const INSIGHTS_BY_DATE = [...INSIGHTS].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);
