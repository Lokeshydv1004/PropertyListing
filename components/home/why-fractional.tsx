import Image from "next/image";

export function WhyFractional() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex-1 overflow-hidden rounded-2xl bg-[#fefeff]">
          <Image
            src="/assets/images/why_fractional.png"
            alt="Why Fractional Real Estate?"
            width={1536}
            height={1024}
            className="h-auto w-full"
          />
        </div>
        <div className="flex-1 overflow-hidden rounded-2xl bg-[#fdfaf5]">
          <Image
            src="/assets/images/traditional_vs_fractional.png"
            alt="Traditional vs Fractional"
            width={1536}
            height={1024}
            className="h-auto w-full"
          />
        </div>
        <div className="flex-1 overflow-hidden rounded-2xl bg-[#001e19]">
          <Image
            src="/assets/images/transparent_money.png"
            alt="Your money. Fully transparent."
            width={1536}
            height={1024}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
