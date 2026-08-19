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
    /** Internal follow-up notes. */
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The team works this table by "what's new" and "what's still open".
    index("leads_status_created_at_idx").on(table.status, table.createdAt),
    index("leads_property_id_idx").on(table.propertyId),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
