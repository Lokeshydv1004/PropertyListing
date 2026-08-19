import {
  pgEnum,
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { properties } from "./properties";
import { adminUsers } from "./admin";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "closed",
]);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    amountInterested: numeric("amount_interested"),
    message: text("message"),
    status: leadStatusEnum("status").notNull().default("new"),

    /** What the person wants — investor, buyer, tenant, or a property owner
     *  wanting to list. Routes the lead and shows where demand comes from. */
    enquiryType: text("enquiry_type").notNull().default("investor"),
    /** Which surface produced it: 'interest' | 'contact' | 'notify'. */
    source: text("source"),
    /** The page they were on. Invaluable when a lead says "the one in Kurla". */
    pageUrl: text("page_url"),

    // Campaign attribution. Without these there is no way to tell which spend
    // produced which lead the moment any money goes into ads.
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),

    /** Set when someone on the team actually makes contact. */
    contactedAt: timestamp("contacted_at", { withTimezone: true }),
    /**
     * Legacy single-field notes.
     *
     * Superseded by the `lead_notes` table, which keeps an author and a
     * timestamp per entry — an overwritten textarea loses history exactly
     * when it matters. Still read (and shown as "earlier note") so nothing
     * written before the console existed disappears; nothing writes to it.
     */
    notes: text("notes"),

    /** Who is working this lead. Null means nobody has picked it up. */
    assignedTo: uuid("assigned_to").references(() => adminUsers.id, {
      onDelete: "set null",
    }),

    /**
     * Soft delete. There is no hard delete anywhere in the console: a lead
     * removed by a misclick is a person who wanted to give us money, and a
     * row nobody can get back is a worse outcome than a row nobody wants.
     */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The team works this table by "what's new" and "what's still open".
    index("leads_status_created_at_idx").on(table.status, table.createdAt),
    index("leads_property_id_idx").on(table.propertyId),
    // The console's duplicate check — "3 other enquiries from this phone" —
    // runs on every row of every page of the queue.
    index("leads_phone_idx").on(table.phone),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/**
 * Follow-up notes, one row per note, append-only.
 *
 * The old `leads.notes` column was a single textarea: writing a second note
 * overwrote the first. What the team actually needs is the sequence — "called,
 * no answer" then "called back, wants a site visit" — with who said it and
 * when. There is no update or delete action for these on purpose.
 */
export const leadNotes = pgTable(
  "lead_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),

    /** Null only if an admin row were ever hard-deleted, which we don't do. */
    authorId: uuid("author_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    /** Denormalised so the note still reads correctly if a name changes. */
    authorName: text("author_name").notNull(),

    body: text("body").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("lead_notes_lead_id_created_at_idx").on(table.leadId, table.createdAt)]
);

export type LeadNote = typeof leadNotes.$inferSelect;
export type NewLeadNote = typeof leadNotes.$inferInsert;
