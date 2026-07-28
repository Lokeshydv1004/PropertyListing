import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Ready to start investing?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Browse verified properties open for fractional investment and
          submit your interest in minutes.
        </p>
        <Button
          render={<Link href="/properties" />}
          nativeButton={false}
          className="mt-8 h-11 bg-brand-green px-6 text-base text-white hover:bg-brand-green/90"
        >
          Browse Properties
        </Button>
      </div>
    </section>
  );
}
