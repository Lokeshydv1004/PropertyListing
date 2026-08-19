import { z } from "zod";

/**
 * One schema per mutation, shared by the client form and the server action.
 *
 * The sharing is the point: an action is a public endpoint, so validating
 * only on the client validates nothing at all. Same convention as the public
 * lead forms in this directory.
 */

export const leadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "closed"]),
});

export const leadNoteSchema = z.object({
  id: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write something first")
    // Long enough for a full call summary, bounded so a paste of an entire
    // email thread doesn't become the row.
    .max(4000, "Keep it under 4000 characters"),
});

export const leadAssignSchema = z.object({
  id: z.string().uuid(),
  /** Empty string means "unassign" — a select can't submit null. */
  assignedTo: z.union([z.string().uuid(), z.literal("")]),
});

export const leadDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type LeadStatusValues = z.infer<typeof leadStatusSchema>;
export type LeadNoteValues = z.infer<typeof leadNoteSchema>;
export type LeadAssignValues = z.infer<typeof leadAssignSchema>;
