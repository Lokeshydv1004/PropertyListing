import {
  pgEnum,
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Two roles, deliberately. `staff` runs the day job — leads, listings,
 * buildings. `owner` additionally manages the team and is the only role
 * allowed near anything destructive.
 *
 * Resist adding a third. Every extra role multiplies the number of
 * permission combinations that have to be reasoned about at each call site,
 * and a three-person team has no use for the distinction.
 */
export const adminRoleEnum = pgEnum("admin_role", ["owner", "staff"]);

/**
 * The allowlist that decides who may sign in at all.
 *
 * Authentication itself is Supabase Auth (email magic links) — this table
 * holds authorisation. An address that is not here never receives a link,
 * so an attacker who guesses the /admin/login URL cannot even provoke an
 * email, let alone a session.
 *
 * Rows are never deleted: flip `is_active` to false instead. The audit log
 * references actors by id, and a deleted actor turns every historical entry
 * into "someone changed this".
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Lowercased on write — the whole allowlist check hinges on this matching. */
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: adminRoleEnum("role").notNull().default("staff"),

  /** Revoke access without losing the audit trail. */
  isActive: boolean("is_active").notNull().default(true),

  /**
   * The Supabase `auth.users` id, filled in on first successful sign-in.
   * Email is the identity we match on; this is here so a session can be
   * traced back to a row without a second round trip if that ever changes.
   */
  authUserId: uuid("auth_user_id").unique(),

  /** Answers "is this account still in use?" before removing someone. */
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type AdminRole = (typeof adminRoleEnum.enumValues)[number];

/**
 * What each admin action means. Kept as `text` rather than a pg enum on
 * purpose: this list grows every time a module lands (archive, assign,
 * note, upload…), and extending a Postgres enum is a migration each time
 * while the union below is a one-line edit. The trade is that the database
 * won't reject a typo — hence the constant map, which every writer uses.
 */
export const ADMIN_ACTIONS = [
  "sign_in",
  "create",
  "update",
  "publish",
  "unpublish",
  "archive",
  "delete",
  "lead_status",
  "lead_note",
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

/**
 * Append-only audit log.
 *
 * Costs almost nothing to write now and is impossible to reconstruct later,
 * which is the entire argument for adding it before the modules that write
 * to it. It exists to answer one question asked in anger: "who changed this,
 * and what did it say before?"
 */
export const adminActivity = pgTable(
  "admin_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Null only if an admin row were ever hard-deleted, which we don't do. */
    actorId: uuid("actor_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    /** Denormalised so the log still reads correctly if a name changes. */
    actorEmail: text("actor_email").notNull(),

    action: text("action").notNull(),

    /** 'property' | 'lead' | 'building' | 'admin_user' — free text by design. */
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    /**
     * A human label captured at write time (property title, lead name).
     * Without it, a log entry for an archived row is a bare UUID.
     */
    entityLabel: text("entity_label"),

    /** `{ field: { from, to } }`. Only what actually changed. */
    changedFields: jsonb("changed_fields"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The log is read newest-first, and filtered by "what happened to this
    // property" on the per-entity History tab.
    index("admin_activity_created_at_idx").on(table.createdAt),
    index("admin_activity_entity_idx").on(table.entityType, table.entityId),
  ]
);

export type AdminActivity = typeof adminActivity.$inferSelect;
export type NewAdminActivity = typeof adminActivity.$inferInsert;
