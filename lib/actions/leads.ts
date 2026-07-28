"use server";

import { db } from "@/db/client";
import { leads } from "@/db/schema";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation/contact";
import { interestFormSchema, type InterestFormValues } from "@/lib/validation/interest";

export type LeadActionResult = { success: true } | { success: false; error: string };

export async function submitContactLead(
  values: ContactFormValues
): Promise<LeadActionResult> {
  const parsed = contactFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  try {
    await db.insert(leads).values({
      propertyId: null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message || null,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save contact lead", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitInterestLead(
  propertyId: string,
  values: InterestFormValues
): Promise<LeadActionResult> {
  const parsed = interestFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  try {
    await db.insert(leads).values({
      propertyId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      amountInterested: parsed.data.amountInterested,
      message: parsed.data.message || null,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save interest lead", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
