import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-brand-green">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Button
        render={<Link href="/properties" />}
        nativeButton={false}
        className="mt-8 bg-brand-green text-white hover:bg-brand-green/90"
      >
        Browse Properties
      </Button>
    </div>
  );
}
