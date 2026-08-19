/**
 * The leads section renders two things at once: the queue, and — when a lead
 * is open — a detail panel over it.
 *
 * `@panel` is a parallel route filled by the intercepting route at
 * `@panel/(.)[id]`. Clicking a row navigates to /admin/leads/<id>, which the
 * interception turns into a panel over the table instead of a full page load;
 * the same URL opened cold (a pasted link, a refresh) renders the real page.
 * One URL, both behaviours, no duplicated component.
 */
export default function LeadsLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <>
      {children}
      {panel}
    </>
  );
}
