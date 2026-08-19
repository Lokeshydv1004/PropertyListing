"use server";

import { db } from "@/db/client";
import { leads } from "@/db/schema";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";
import {
  interestFormSchema,
  type InterestFormValues,
} from "@/lib/validation/interest";

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
    return { success: true };
  } catch (error) {
    console.error("Failed to save contact lead", error);
    return { success: false, error: GENERIC_ERROR };
  }
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
    return { success: true };
  } catch (error) {
    console.error("Failed to save interest lead", error);
    return { success: false, error: GENERIC_ERROR };
  }
}
