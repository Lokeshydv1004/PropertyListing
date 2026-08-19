import { SITE, hasRealPhone } from "@/lib/site-config";

/**
 * Schema.org payloads, kept out of the components that render them.
 *
 * Every builder here describes only what the site can actually substantiate.
 * Notably absent: `aggregateRating` and `review`, which are the schema types
 * that produce star ratings in search results. Those require real reviews;
 * emitting them without any is both a Google structured-data violation and
 * exactly the kind of invented social proof this audit exists to remove.
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description:
      "Fractional real estate investment in India — title-verified, income-generating properties available in shares.",
    email: SITE.email,
    ...(hasRealPhone && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    }),
    ...(SITE.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address,
        addressCountry: "IN",
      },
    }),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export function faqSchema(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE.url}${crumb.path}`,
    })),
  };
}

/**
 * A listing. `RealEstateListing` is the specific type Google understands for
 * property pages; `offers` carries the price so the result can show it.
 *
 * A fractional listing's meaningful price is the minimum ticket, not the whole
 * asset valuation — quoting ₹24 Cr for something you can enter at ₹3 L would
 * be accurate and completely misleading.
 */
export function realEstateListingSchema(property: {
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  location: string;
  city: string;
  images: string[];
  areaSqft: string | number;
  listingType: "fractional" | "sale" | "rent";
  minInvestment: string | null;
  salePrice: string | null;
  monthlyRent: string | null;
  createdAt: Date | null;
}) {
  const price =
    property.listingType === "fractional"
      ? property.minInvestment
      : property.listingType === "sale"
        ? property.salePrice
        : property.monthlyRent;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${SITE.url}/properties/${property.slug}#listing`,
    url: `${SITE.url}/properties/${property.slug}`,
    name: property.title,
    description: property.summary ?? property.description.slice(0, 300),
    ...(property.images.length > 0 && { image: property.images }),
    ...(property.createdAt && {
      datePosted: property.createdAt.toISOString(),
    }),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location,
      addressLocality: property.city,
      addressCountry: "IN",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: Number(property.areaSqft),
      unitCode: "FTK", // UN/CEFACT code for square foot
    },
    ...(price && {
      offers: {
        "@type": "Offer",
        price: Number(price),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        ...(property.listingType === "fractional" && {
          description: "Minimum investment for a fractional share",
        }),
      },
    }),
    provider: { "@id": `${SITE.url}/#organization` },
  };
}

export function articleSchema(post: {
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `${SITE.url}/insights/${post.slug}`,
    author: { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}
