"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Compass, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { AREAS, COMPANY_SIZES, type ServiceDTO } from "@/lib/constants";
import { filterServices } from "@/lib/filter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-accent bg-accent text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-accent/50 hover:text-navy",
      )}
    >
      {active && <Check className="size-3.5" />}
      {children}
    </button>
  );
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function Catalogue({ services }: { services: ServiceDTO[] }) {
  const [q, setQ] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => filterServices(services, { q, areas, sizes }), [services, q, areas, sizes]);
  const activeCount = areas.length + sizes.length;
  const reset = () => {
    setQ("");
    setAreas([]);
    setSizes([]);
  };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">OIXIO services</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-navy sm:text-5xl sm:leading-[1.1]">
            Find the right service for your business
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            ERP, data &amp; AI, advisory and IT security services – search the catalogue or let the navigator recommend a fit.
          </p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-8 max-w-2xl">
            <label htmlFor="search" className="sr-only">Search services</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                id="search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search e.g. Power BI, Excel, NIS2"
                className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base text-navy shadow-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
              />
            </div>
          </form>
          <Link href="/navigator" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            <Compass className="size-4" />
            Not sure? Answer 4 questions and get a recommendation
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Mobile filter toggle */}
        <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
          <Button variant="outline" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen} aria-controls="filters">
            <SlidersHorizontal />
            Filters
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">{activeCount}</span>
            )}
          </Button>
          <p className="text-sm text-slate-500">{results.length} services</p>
        </div>

        <div id="filters" className={cn("mb-8 flex-col gap-5 md:flex", filtersOpen ? "flex" : "hidden")}>
          <div>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Business area</h2>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <Chip key={a} active={areas.includes(a)} onClick={() => setAreas((x) => toggle(x, a))}>
                  {a}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Company size</h2>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZES.map((s) => (
                <Chip key={s.value} active={sizes.includes(s.value)} onClick={() => setSizes((x) => toggle(x, s.value))}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>
          {(activeCount > 0 || q) && (
            <button type="button" onClick={reset} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy">
              <X className="size-4" />
              Clear all
            </button>
          )}
        </div>

        <p className="mb-4 hidden text-sm text-slate-500 md:block" aria-live="polite">
          Showing {results.length} of {services.length} services
        </p>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
            <SearchX className="mx-auto size-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-navy">No services match your search</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
              Try a different keyword or remove some filters. You can also let the navigator suggest a service.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={reset}>Clear search and filters</Button>
              <Button asChild>
                <Link href="/navigator">Open the navigator</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
