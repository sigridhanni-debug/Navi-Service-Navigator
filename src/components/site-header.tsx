import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-navy">
          <span className="grid size-9 place-items-center rounded-lg bg-navy text-white">
            <Compass className="size-5" />
          </span>
          <span className="leading-tight">
            Navi
            <span className="block text-xs font-normal text-slate-500">OIXIO Service Navigator</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/">Services</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/navigator">
              <Compass />
              <span>Find my service</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
