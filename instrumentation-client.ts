/**
 * Temporary diagnostics for the "site hangs / console shows nothing" bug.
 *
 * Catches errors that happen outside React's own error boundaries (e.g. a
 * hook-count mismatch that crashes a component before it can log anything
 * useful, or a fetch failure with no visible stack).
 *
 * Left commented out for production: these run in the visitor's browser and
 * only ever printed to their console. Uncomment locally when reproducing a
 * client-side crash.
 */
export {};

// window.addEventListener("error", (event) => {
//   console.error("[instrumentation-client] window error:", event.error ?? event.message);
// });
//
// window.addEventListener("unhandledrejection", (event) => {
//   console.error("[instrumentation-client] unhandledrejection:", event.reason);
// });
