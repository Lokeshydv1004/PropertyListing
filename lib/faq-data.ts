/**
 * The FAQ corpus, kept out of the page component so it can be reused.
 *
 * Five questions is a placeholder, not an FAQ. For this category 18–25
 * questions across clear categories is the norm, and it is the single best
 * long-tail SEO asset available to a site with no blog: people search these
 * exact phrasings before they search for a platform.
 *
 * Answers that describe how these structures ordinarily work in India are
 * written out in full. Answers that depend on GharShare's own commercial
 * terms carry a visible TODO — a confidently-worded invented fee is a far
 * worse outcome than an obviously-unfinished one.
 */

export type FaqCategory = {
  id: string;
  title: string;
  blurb: string;
  questions: { question: string; answer: string }[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    blurb: "Who can invest, what you need, and how long it takes.",
    questions: [
      {
        question: "What is fractional real estate investment?",
        answer:
          "Fractional ownership lets several investors together hold a single property, rather than one person buying it outright. Each investor holds a proportional interest based on how much they put in, and shares in the rental income and any appreciation in the same proportion — without needing the capital, the time or the expertise to buy and run a whole property alone.",
      },
      {
        question: "Who can invest?",
        answer:
          "Any Indian resident who is over 18, has a PAN, and can complete KYC. NRIs and OCI holders can invest in commercial and residential property subject to FEMA rules — see the NRI question below. We do not accept cash, and every investment is made from a bank account in the investor's own name.",
      },
      {
        question: "What is the minimum ticket size?",
        answer:
          "It varies by property and is shown on every listing. The minimum is a floor, not a fixed amount — you can commit more, subject to how much of the raise is still unallocated.",
      },
      {
        question: "What documents do I need?",
        answer:
          "PAN (mandatory), Aadhaar or passport for identity and address, a cancelled cheque or bank statement for the account returns are paid into, and a recent photograph. NRIs also need a passport, visa or OCI card, overseas address proof, and NRE/NRO account details. None of this is collected through this website — KYC happens directly with our team after you have seen the documentation.",
      },
      {
        question: "How long does onboarding take?",
        answer:
          "TODO(pre-launch): state the real end-to-end timeline. The indicative sequence is on the How It Works page: register interest, advisor call, documentation, KYC and signature, funds to escrow, then completion when the raise closes.",
      },
      {
        question: "Do I pay anything to register interest?",
        answer:
          "No. Registering interest, the advisor call, and receiving the full documentation are all free and carry no obligation. You can stop at any point up to signing without any cost.",
      },
      {
        question: "Can NRIs invest?",
        answer:
          "Generally yes, for commercial and residential property, subject to FEMA. Agricultural land, plantation property and farmhouses cannot be acquired by NRIs. Investment must come through normal banking channels from an NRE, NRO or FCNR account. TDS applies at NRI rates on rental income and capital gains, with treaty relief available in many cases, and repatriation of proceeds is subject to FEMA conditions and limits. You will need a PAN. Take tax advice in your country of residence as well as in India.",
      },
    ],
  },
  {
    id: "money-and-returns",
    title: "Money & returns",
    blurb: "Fees, yields, payouts, tax, and what happens when a unit sits empty.",
    questions: [
      {
        question: "What fees does GharShare charge?",
        answer:
          "TODO(pre-launch): state the platform fee, the annual management fee and the exit or performance fee, with the exact percentages. The full table is on the How It Works page. What is already true and worth saying: nothing is deducted that is not disclosed on the listing and in the documentation you sign, and registering interest is free.",
      },
      {
        question:
          "I can't decide which property to pick. Can I just invest with GharShare?",
        answer:
          "Yes — that is what the managed portfolio is for. Instead of choosing one building, you make a single commitment that we spread across the properties we have underwritten, and we manage it. Because the income comes from several tenants rather than one, a single vacancy cannot take it to zero, so it is steadier than any individual asset. The trade is that you should expect a lower target return than the best single listing, since you hold the average properties as well as the strongest. Returns are targeted, not guaranteed, and your capital is at risk.",
      },
      {
        question:
          "Is the managed portfolio a fixed or assured return, like a deposit?",
        answer:
          "No. GharShare does not accept deposits and does not promise a rate of return. There is no capital protection and no deposit insurance — this is an equity-style holding in commercial property, so the income depends on tenants paying rent and the capital value moves with the market. \"Steadier\" here means diversified across assets, cities and tenants; it does not mean guaranteed.",
      },
      {
        question: "How is the estimated yield calculated?",
        answer:
          "The estimated annual yield on a listing is the expected annual rental income for the property, net of the costs disclosed for it, expressed against the property's total valuation. It is an estimate based on current lease terms and market data — not a guarantee, and not a promise about what any individual investor will receive.",
      },
      {
        question: "How often are payouts made?",
        answer:
          "Rental income is distributed periodically once the property is funded and tenanted. The schedule for a specific property, including when the first distribution is expected, is set out in that property's documentation.",
      },
      {
        question: "How are returns taxed?",
        answer:
          "Rental income distributed to you is taxable as income in your hands, at your applicable slab rate. Gains on the eventual sale are taxed as capital gains, short- or long-term depending on the holding period, under the rules in force at the time of sale. This is a general summary, not tax advice — take advice from your CA.",
      },
      {
        question: "Is TDS deducted?",
        answer:
          "Where applicable, yes — tax is deducted at source on distributions and reflected in your Form 26AS, and you claim credit for it when you file. NRIs are subject to TDS at NRI rates, which may be reduced under an applicable treaty.",
      },
      {
        question: "What happens if the property is vacant?",
        answer:
          "There is no rent to distribute for the period it is empty, so distributions pause or reduce. This is one of the real risks of the asset class and it is why yields are estimates rather than promises. The manager's job is to re-let as quickly as the market allows, and vacancy is reported to you rather than smoothed over.",
      },
      {
        question: "Can the yield change after I invest?",
        answer:
          "Yes. Yield depends on rent actually collected, occupancy, and the costs incurred against the property — all of which move. A rent escalation clause can push it up; a vacancy or an unexpected repair can push it down.",
      },
    ],
  },
  {
    id: "ownership-and-legal",
    title: "Ownership & legal",
    blurb: "What you hold, who holds it, and what happens if we disappear.",
    questions: [
      {
        question: "Who legally owns the property?",
        answer:
          "The property is held through a legal structure set up for that property alone, in which investors hold proportional interests. GharShare is not the beneficial owner of your interest — we arrange, list and administer. The precise structure is set out in the documentation for each property, before you commit.",
      },
      {
        question: "What do I actually hold?",
        answer:
          "A proportional economic interest in one specific property, evidenced by the agreement you sign and a certificate confirming the size of your holding. Your interest is not pooled across unrelated assets and it is not a loan to GharShare.",
      },
      {
        question: "What happens if GharShare shuts down?",
        answer:
          "Your interest is in the property-holding structure, not in GharShare, so it does not vanish with us. Administration would transfer, and the documentation for each property sets out what happens in that event. Read it — this is exactly the sort of question the documentation exists to answer, and any platform unwilling to answer it in writing should worry you.",
      },
      {
        question: "Is the property insured?",
        answer:
          "Insurance appropriate to the asset is arranged as part of managing the property, and its cost sits among the property's expenses. The cover in place for a specific property is disclosed in its documentation.",
      },
      {
        question: "How is valuation determined?",
        answer:
          "By an independent valuation obtained before the property is listed, not by us. Valuation is revisited around exit, when the price is ultimately set by what a buyer will pay.",
      },
      {
        question: "What is an SPV, and does an SM REIT apply here?",
        answer:
          "An SPV — special purpose vehicle — is a company or trust created to hold one asset and nothing else, which is what keeps one property's liabilities away from another's. Separately, SEBI's SM REIT framework regulates certain small and medium real estate schemes in India. TODO(pre-launch): state plainly whether GharShare's offerings fall inside the SM REIT framework and, if it holds a registration, publish the number. Do not describe the platform as 'SEBI compliant' without one.",
      },
      {
        question: "Do I get to vote on decisions about the property?",
        answer:
          "Day-to-day management decisions sit with the property manager, which is what makes this a passive investment. Decisions that materially affect holders — a sale, for instance — follow the process set out in the documentation for that property.",
      },
    ],
  },
  {
    id: "exit-and-liquidity",
    title: "Exit & liquidity",
    blurb: "Getting your money back out, and when that is and isn't possible.",
    questions: [
      {
        question: "Can I exit before the horizon ends?",
        answer:
          "Not on demand. Fractional real estate is illiquid: there is no exchange to sell into and no redemption window. An early exit is possible only where a buyer for your holding can be found, on terms both sides accept. Do not invest money you may need at short notice.",
      },
      {
        question: "Can I sell my share to someone else?",
        answer:
          "Transfers are possible where the documentation allows them and a buyer exists. The process, and any restrictions or transfer costs, are set out in the agreement for that property.",
      },
      {
        question: "What happens at the end of the horizon?",
        answer:
          "The intention is to sell the property and distribute the proceeds proportionally. The stated horizon is a target, not a deadline — market conditions can extend it, and a forced sale into a weak market is usually worse for holders than waiting.",
      },
      {
        question: "Who decides when to sell?",
        answer:
          "The sale process follows what the documentation for that property specifies, including the role holders play in it. Read this section before you invest; it differs between properties and it determines when you get your money back.",
      },
    ],
  },
  {
    id: "risk",
    title: "Risk",
    blurb: "The honest version.",
    questions: [
      {
        question: "What are the risks?",
        answer:
          "Property values can fall as well as rise. Rental income can be delayed, reduced or interrupted by vacancy or a tenant default. Exit timelines can extend well beyond the stated horizon, and the investment is illiquid throughout. Regulatory and tax treatment can change. Fractional ownership also means less individual control than sole ownership. Estimated yields and projected appreciation shown anywhere on this site are forward-looking estimates, not guaranteed returns.",
      },
      {
        question: "What if a property doesn't reach its funding target?",
        answer:
          "The raise does not proceed. Money held in escrow is returned in full to everyone who committed, with no fee deducted. Nobody ends up holding a stake in a partially funded asset.",
      },
      {
        question: "Has any property underperformed its estimate?",
        answer:
          "TODO(pre-launch): answer this truthfully once there is a track record, including the cases that went badly. If the honest answer today is 'we are new and have no track record to report', say exactly that — a platform that claims a perfect record invites the scrutiny that finds out otherwise.",
      },
      {
        question: "Is my capital protected or guaranteed in any way?",
        answer:
          "No. There is no capital protection, no guaranteed return, and no deposit insurance. You can get back less than you put in. Nothing on this site constitutes investment, legal or tax advice — read the full risk disclosure and consult an independent financial adviser before investing.",
      },
    ],
  },
];

export const FAQ_COUNT = FAQ_CATEGORIES.reduce(
  (total, category) => total + category.questions.length,
  0
);
