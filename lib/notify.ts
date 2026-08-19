/**
 * Tells a human a lead just arrived.
 *
 * Leads were written to the `leads` table and read out of the Supabase
 * dashboard whenever somebody happened to look. In lead generation, speed of
 * response is the single biggest determinant of conversion — a lead contacted
 * within minutes converts many times better than one contacted the next day —
 * so a form submitted at 2 a.m. on a Saturday sitting unseen until Monday is
 * a real, recurring cost.
 *
 * Deliberately provider-agnostic: `LEAD_WEBHOOK_URL` accepts anything that
 * takes a JSON `{ text }` POST, which covers Slack incoming webhooks, Discord
 * webhooks, and a thin relay in front of the Telegram bot API. Unset means
 * this no-ops silently, so the site runs identically with no webhook
 * configured.
 *
 * It never throws and it is never awaited in a way that can fail a write. A
 * notification is a convenience; the lead itself is the thing that matters,
 * and a Slack outage must not cost us one.
 */
export async function notifyTeam(text: string): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;

  try {
    // Bounded: a hanging webhook must not hold the server action open and
    // leave the visitor watching a spinner on a form that already succeeded.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch {
    // console.error("notifyTeam failed", error);
  }
}
