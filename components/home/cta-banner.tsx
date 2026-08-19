import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-4 mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#032E24] sm:mx-6 sm:mb-10 lg:mx-10">
      <div className="flex items-stretch">
        <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-8 lg:px-8">
          <div>
            <h2 className="max-w-md leading-snug font-semibold tracking-tight text-white text-xl sm:text-2xl">
              Your first property doesn&apos;t have to cost ₹1 Crore.
            </h2>
            <p className="mt-3 max-w-sm text-white/70">
              Start your real estate investment journey today.
            </p>
          </div>
          <Button
            render={<Link href="/properties" />}
            nativeButton={false}
            className="h-12 w-full shrink-0 gap-2 bg-gold px-6 text-base text-navy hover:bg-gold/90 sm:w-auto"
          >
            Explore Properties
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="relative hidden w-1/5 shrink-0 lg:block">
          <Image
            src="/assets/images/ct_banner.png"
            alt="Elegantly furnished living room"
            fill
            sizes="20vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
