"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  addLeadNote,
  assignLead,
  deleteLead,
  updateLeadStatus,
} from "@/lib/actions/admin-leads";
import {
  isCallable,
  mailtoHrefFor,
  parseFoldedMessage,
  telHrefFor,
  whatsappHrefFor,
} from "@/lib/admin/lead-contact";
import {
  LEAD_STATUSES,
  labelForEnquiryType,
  labelForSource,
} from "@/lib/admin/leads-filters";
import { formatExactINR } from "@/lib/format";

export type LeadDetailData = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  amountInterested: string | null;
  status: string;
  enquiryType: string;
  source: string | null;
  pageUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  contactedAt: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  legacyNotes: string | null;
  propertyTitle: string | null;
  propertySlug: string | null;
  propertyCity: string | null;
};

export type LeadNoteData = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type RelatedLead = {
  id: string;
  createdAt: string;
  status: string;
  source: string | null;
  enquiryType: string;
  propertyTitle: string | null;
};

export type TeamMember = { id: string; name: string };

const IST = "en-IN";

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(IST, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function LeadDetail({
  lead,
  notes,
  related,
  team,
  canDelete,
  deletedHref,
}: {
  lead: LeadDetailData;
  notes: LeadNoteData[];
  related: RelatedLead[];
  team: TeamMember[];
  /** Owner-only; staff never sees the control at all. */
  canDelete: boolean;
  /**
   * Where to go once the lead is removed. A string rather than a callback
   * because the caller is a Server Component, which cannot pass functions.
   */
  deletedHref?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const callable = isCallable(lead.phone);
  const parsed = parseFoldedMessage(lead.message);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  const greeting = `Hi ${lead.name.split(" ")[0]}, this is GharShare about your enquiry`;

  return (
    <div className="space-y-6">
      {/*
        The three contact buttons come first and are deliberately large.
        This is the entire job — everything else on this panel is context for
        the call that these start.
      */}
      <div className="grid grid-cols-3 gap-2">
        <ContactButton
          href={callable ? telHrefFor(lead.phone) : undefined}
          icon={<Phone className="size-5" aria-hidden="true" />}
          label="Call"
        />
        <ContactButton
          href={callable ? whatsappHrefFor(lead.phone, greeting) : undefined}
          icon={<MessageCircle className="size-5" aria-hidden="true" />}
          label="WhatsApp"
          external
        />
        <ContactButton
          href={mailtoHrefFor(lead.email, "Your GharShare enquiry")}
          icon={<Mail className="size-5" aria-hidden="true" />}
          label="Email"
        />
      </div>

      {!callable && (
        <p className="text-xs text-muted-foreground">
          No phone number on this one — it came from the new-listing alert
          form, which only asks for an email.
        </p>
      )}

      {related.length > 0 && (
        <div className="rounded-lg border border-gold/40 bg-gold-light/60 p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gold-700">
            <Users className="size-4" aria-hidden="true" />
            {related.length} other enquir
            {related.length === 1 ? "y" : "ies"} from this number
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/leads/${item.id}`}
                  className="text-navy underline-offset-2 hover:underline"
                >
                  {item.propertyTitle ?? labelForSource(item.source)}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatWhen(item.createdAt)} · {item.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Status
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LEAD_STATUSES.map((status) => (
            <Button
              key={status.value}
              size="sm"
              variant={lead.status === status.value ? "default" : "outline"}
              disabled={pending}
              onClick={() =>
                run(() =>
                  updateLeadStatus({ id: lead.id, status: status.value })
                )
              }
            >
              {lead.status === status.value && (
                <Check className="size-3.5" aria-hidden="true" />
              )}
              {status.label}
            </Button>
          ))}
        </div>
        {lead.contactedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            First contacted {formatWhen(lead.contactedAt)}
          </p>
        )}
      </section>

      {team.length > 1 && (
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Assigned to
          </h3>
          <select
            className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            value={lead.assignedTo ?? ""}
            disabled={pending}
            onChange={(event) =>
              run(() =>
                assignLead({ id: lead.id, assignedTo: event.target.value })
              )
            }
          >
            <option value="">Nobody</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </section>
      )}

      <section>
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Enquiry
        </h3>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <Row label="Phone" value={lead.phone} />
          <Row label="Email" value={lead.email} />
          <Row label="Type" value={labelForEnquiryType(lead.enquiryType)} />
          <Row label="Source" value={labelForSource(lead.source)} />
          {lead.amountInterested && (
            <Row
              label="Amount"
              value={formatExactINR(Number(lead.amountInterested))}
            />
          )}
          <Row label="Received" value={formatWhen(lead.createdAt)} />
          {lead.propertyTitle && lead.propertySlug && (
            <>
              <dt className="text-muted-foreground">Property</dt>
              <dd>
                <Link
                  href={`/properties/${lead.propertySlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-navy underline-offset-2 hover:underline"
                >
                  {lead.propertyTitle}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </dd>
            </>
          )}
          {lead.utmSource && (
            <Row
              label="Campaign"
              value={[lead.utmSource, lead.utmMedium, lead.utmCampaign]
                .filter(Boolean)
                .join(" / ")}
            />
          )}
          {lead.pageUrl && <Row label="Page" value={lead.pageUrl} wrap />}
        </dl>
      </section>

      {(parsed.fields.length > 0 || parsed.prose.length > 0) && (
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            What they said
          </h3>
          {parsed.fields.length > 0 && (
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {parsed.fields.map((field) => (
                <Row key={field.label} label={field.label} value={field.value} />
              ))}
            </dl>
          )}
          {parsed.prose.map((paragraph, index) => (
            <p
              key={index}
              className="mt-2 rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap"
            >
              {paragraph}
            </p>
          ))}
        </section>
      )}

      <section>
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Notes
        </h3>

        <div className="mt-2">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Called, no answer — trying again tomorrow"
            rows={2}
          />
          <Button
            size="sm"
            className="mt-2 bg-brand-green text-white hover:bg-brand-green/90"
            disabled={pending || !note.trim()}
            onClick={() =>
              run(async () => {
                const result = await addLeadNote({ id: lead.id, body: note });
                if (result.success) setNote("");
                return result;
              })
            }
          >
            {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Add note
          </Button>
        </div>

        <ul className="mt-3 space-y-2">
          {notes.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border p-3">
              <p className="text-sm whitespace-pre-wrap">{entry.body}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {entry.authorName} · {formatWhen(entry.createdAt)}
              </p>
            </li>
          ))}

          {/* Anything written into the old single-field column, before notes
              had authors. Shown once, read-only, so it isn't silently lost. */}
          {lead.legacyNotes && (
            <li className="rounded-lg border border-dashed border-border p-3">
              <p className="text-sm whitespace-pre-wrap">{lead.legacyNotes}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Earlier note · author not recorded
              </p>
            </li>
          )}

          {notes.length === 0 && !lead.legacyNotes && (
            <li className="text-sm text-muted-foreground">
              Nothing yet. Notes are kept in order, with who wrote them.
            </li>
          )}
        </ul>
      </section>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {canDelete && (
        <section className="border-t border-border pt-4">
          {confirmingDelete ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This hides the lead from the console. It stays in the database
                and can be restored — nothing is destroyed.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const result = await deleteLead({ id: lead.id });
                      if (result.success && deletedHref) {
                        router.push(deletedHref);
                      }
                      return result;
                    })
                  }
                >
                  Yes, remove it
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove lead
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  wrap,
}: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-navy", wrap && "break-all")}>{value}</dd>
    </>
  );
}

function ContactButton({
  href,
  icon,
  label,
  external,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}) {
  if (!href) {
    return (
      <span className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card text-xs font-medium text-navy transition-colors hover:border-brand-green hover:bg-brand-green-light focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {icon}
      {label}
    </a>
  );
}
