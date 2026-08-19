"use server";

import { db } from "@/db/client";
import { leads } from "@/db/schema";
import { notifyTeam } from "@/lib/notify";
import { checkRateLimit, clientIdentifier } from "@/lib/rate-limit";
import { SITE } from "@/lib/site-config";
import {
  contactFormSchema,
  ENQUIRY_TYPES,
  type ContactFormValues,
} from "@/lib/validation/contact";
import {
  interestFormSchema,
  type InterestFormValues,
} from "@/lib/validation/interest";
import {
  notifyFormSchema,
  type NotifyFormValues,
} from "@/lib/validation/notify";
import {
  LISTING_GOALS,
  OCCUPANCY_STATUSES,
  PROPERTY_KINDS,
  listPropertyFormSchema,
  type ListPropertyFormValues,
} from "@/lib/validation/list-property";
import {
  PLAN_AMOUNT_BANDS,
  PLAN_HORIZONS,
  PLAN_PRIORITIES,
  managedPlanFormSchema,
  type ManagedPlanFormValues,
} from "@/lib/validation/managed-plan";

export type LeadActionResult =
  | { success: true }
  | { success: false; error: string };

/** Extra context the client attaches: which page, and where the visit came from. */
export type LeadContext = {
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";
const RATE_LIMITED_ERROR =
  "You've sent a few enquiries already. Please give it a few minutes, or call us instead.";

const ENQUIRY_LABEL = new Map<string, string>(
  ENQUIRY_TYPES.map((type) => [type.value, type.label])
);

const labelOf = (
  options: readonly { value: string; label: string }[],
  value: string
) => options.find((option) => option.value === value)?.label ?? value;

/**
 * Shared gate for every public lead action.
 *
 * All three of these are unauthenticated endpoints anyone can call directly,
 * so each one checks the same two things before it touches the database.
 */
async function guard(): Promise<LeadActionResult | null> {
  const identifier = await clientIdentifier();
  const limit = checkRateLimit(`lead:${identifier}`);
  if (!limit.ok) {
    return { success: false, error: RATE_LIMITED_ERROR };
  }
  return null;
}

export async function submitContactLead(
  values: ContactFormValues,
  context: LeadContext = {}
): Promise<LeadActionResult> {
  const parsed = contactFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  // Honeypot filled means a bot. Report success so it doesn't retry with a
  // different shape, but write nothing.
  if (parsed.data.company) {
    return { success: true };
  }

  const blocked = await guard();
  if (blocked) return blocked;

  try {
    await db.insert(leads).values({
      propertyId: null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message || null,
      enquiryType: parsed.data.enquiryType,
      source: "contact",
      pageUrl: context.pageUrl ?? null,
      utmSource: context.utmSource ?? null,
      utmMedium: context.utmMedium ?? null,
      utmCampaign: context.utmCampaign ?? null,
    });
  } catch {
    // console.error("Failed to save contact lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  // After the insert and outside the try: the lead is already safe, and a
  // failed notification must never turn a captured lead into an error the
  // visitor sees. notifyTeam swallows its own failures too.
  await notifyTeam(
    [
      `📩 New enquiry — ${parsed.data.name}`,
      `Type: ${ENQUIRY_LABEL.get(parsed.data.enquiryType) ?? parsed.data.enquiryType}`,
      `Phone: ${parsed.data.phone}`,
      `Email: ${parsed.data.email}`,
      parsed.data.message ? `Message: ${parsed.data.message}` : null,
      context.pageUrl ? `Page: ${context.pageUrl}` : null,
      context.utmSource ? `Source: ${context.utmSource}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return { success: true };
}

export async function submitInterestLead(
  propertyId: string,
  values: InterestFormValues,
  context: LeadContext = {}
): Promise<LeadActionResult> {
  const parsed = interestFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  if (parsed.data.company) {
    return { success: true };
  }

  const blocked = await guard();
  if (blocked) return blocked;

  try {
    await db.insert(leads).values({
      propertyId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      amountInterested: parsed.data.amountInterested || null,
      message: parsed.data.message || null,
      enquiryType: "investor",
      source: "interest",
      pageUrl: context.pageUrl ?? null,
      utmSource: context.utmSource ?? null,
      utmMedium: context.utmMedium ?? null,
      utmCampaign: context.utmCampaign ?? null,
    });
  } catch {
    // console.error("Failed to save interest lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  await notifyTeam(
    [
      `🏠 New property interest — ${parsed.data.name}`,
      `Phone: ${parsed.data.phone}`,
      `Email: ${parsed.data.email}`,
      parsed.data.amountInterested
        ? `Amount: ₹${Number(parsed.data.amountInterested).toLocaleString("en-IN")}`
        : null,
      parsed.data.message ? `Message: ${parsed.data.message}` : null,
      context.pageUrl ? `Listing: ${context.pageUrl}` : `Property: ${propertyId}`,
      context.utmSource ? `Source: ${context.utmSource}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return { success: true };
}

/**
 * One-field alert signup from the listing page.
 *
 * `leads.name` and `leads.phone` are NOT NULL, and this form asks for
 * neither — so both get explicit sentinels rather than anything that could be
 * mistaken for a real contact. A row with `source = 'notify'` is somebody who
 * wants an email when new properties list; it is not somebody to ring.
 */
export async function submitNotifySignup(
  values: NotifyFormValues,
  context: LeadContext = {}
): Promise<LeadActionResult> {
  const parsed = notifyFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (parsed.data.company) {
    return { success: true };
  }

  const blocked = await guard();
  if (blocked) return blocked;

  try {
    await db.insert(leads).values({
      propertyId: null,
      name: "(new-listing alerts)",
      phone: "(not provided)",
      email: parsed.data.email,
      enquiryType: "other",
      source: "notify",
      pageUrl: context.pageUrl ?? null,
      utmSource: context.utmSource ?? null,
      utmMedium: context.utmMedium ?? null,
      utmCampaign: context.utmCampaign ?? null,
    });
  } catch {
    // console.error("Failed to save notify signup", error);
    return { success: false, error: GENERIC_ERROR };
  }

  await notifyTeam(
    `🔔 New-listing alert signup — ${parsed.data.email} (${SITE.name})`
  );

  return { success: true };
}

/**
 * An owner or agent offering us a property.
 *
 * Written to the same `leads` table with `source: 'list_property'`, so the
 * supply side and the demand side land in one place the team already watches.
 * The structured answers are folded into `message` rather than adding six
 * columns used by one form — this is a conversation starter, and the detail
 * gets captured properly on the call.
 */
export async function submitListPropertyLead(
  values: ListPropertyFormValues,
  context: LeadContext = {}
): Promise<LeadActionResult> {
  const parsed = listPropertyFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  if (parsed.data.company) {
    return { success: true };
  }

  const blocked = await guard();
  if (blocked) return blocked;

  const summary = [
    `City: ${parsed.data.city}`,
    `Type: ${labelOf(PROPERTY_KINDS, parsed.data.propertyKind)}`,
    `Occupancy: ${labelOf(OCCUPANCY_STATUSES, parsed.data.occupancy)}`,
    `Goal: ${labelOf(LISTING_GOALS, parsed.data.goal)}`,
    parsed.data.valuation ? `Indicative value: ${parsed.data.valuation}` : null,
    parsed.data.monthlyRent ? `Current rent: ${parsed.data.monthlyRent}` : null,
    parsed.data.message ? `Notes: ${parsed.data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await db.insert(leads).values({
      propertyId: null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: summary,
      enquiryType: "list_property",
      source: "list_property",
      pageUrl: context.pageUrl ?? null,
      utmSource: context.utmSource ?? null,
      utmMedium: context.utmMedium ?? null,
      utmCampaign: context.utmCampaign ?? null,
    });
  } catch {
    // console.error("Failed to save list-property lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  await notifyTeam(
    [
      `🏢 Property offered — ${parsed.data.name}`,
      `Phone: ${parsed.data.phone}`,
      `Email: ${parsed.data.email}`,
      summary,
    ].join("\n")
  );

  return { success: true };
}

/**
 * Somebody who wants in but cannot choose a property.
 *
 * Same `leads` table, `source: 'managed_plan'`, so it lands in the one place
 * the team already works. The structured answers are folded into `message`
 * for the same reason as the list-property form: three columns used by one
 * form is not worth a migration when the real detail is captured on the call.
 *
 * This action takes no money and creates no obligation on either side. It is
 * an expression of interest, and the page that renders the form says so.
 */
export async function submitManagedPlanLead(
  values: ManagedPlanFormValues,
  context: LeadContext = {}
): Promise<LeadActionResult> {
  const parsed = managedPlanFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  if (parsed.data.company) {
    return { success: true };
  }

  const blocked = await guard();
  if (blocked) return blocked;

  const summary = [
    `Amount band: ${labelOf(PLAN_AMOUNT_BANDS, parsed.data.amountBand)}`,
    `Horizon: ${labelOf(PLAN_HORIZONS, parsed.data.horizon)}`,
    `Priority: ${labelOf(PLAN_PRIORITIES, parsed.data.priority)}`,
    parsed.data.city ? `City: ${parsed.data.city}` : null,
    parsed.data.message ? `Notes: ${parsed.data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await db.insert(leads).values({
      propertyId: null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: summary,
      enquiryType: "managed_plan",
      source: "managed_plan",
      pageUrl: context.pageUrl ?? null,
      utmSource: context.utmSource ?? null,
      utmMedium: context.utmMedium ?? null,
      utmCampaign: context.utmCampaign ?? null,
    });
  } catch {
    // console.error("Failed to save managed-plan lead", error);
    return { success: false, error: GENERIC_ERROR };
  }

  await notifyTeam(
    [
      `📈 Managed portfolio interest — ${parsed.data.name}`,
      `Phone: ${parsed.data.phone}`,
      `Email: ${parsed.data.email}`,
      summary,
      context.pageUrl ? `Page: ${context.pageUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return { success: true };
}
