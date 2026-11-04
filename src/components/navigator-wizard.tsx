"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { CHALLENGES, SIZES, SYSTEMS, TIMELINES, type Recommendation } from "@/lib/recommend";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AreaBadge } from "@/components/area-badge";
import { ContactDialog } from "@/components/contact-dialog";

type Answers = { challenge: string; size: string; systems: string[]; timeline: string };
const EMPTY: Answers = { challenge: "", size: "", systems: [], timeline: "" };

const STEPS = [
  { key: "challenge", title: "What is your main challenge?", options: CHALLENGES, multi: false },
  { key: "size", title: "How big is your company?", options: SIZES, multi: false },
  { key: "systems", title: "Which systems do you use today?", subtitle: "Select all that apply.", options: SYSTEMS, multi: true },
  { key: "timeline", title: "When do you want to get started?", options: TIMELINES, multi: false },
] as const;

function OptionButton({
  selected,
  multi,
  label,
  hint,
  onClick,
}: {
  selected: boolean;
  multi: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        selected ? "border-accent bg-accent-soft" : "border-slate-200 bg-white hover:border-accent/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border-2 transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-accent bg-accent text-white" : "border-slate-300",
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span>
        <span className="block font-medium text-navy">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-slate-500">{hint}</span>}
      </span>
    </button>
  );
}

export function NavigatorWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bring the next question / the results into view (matters on phones).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, results]);

  const current = STEPS[step];
  const value = answers[current.key];
  const canContinue = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const progress = results ? 100 : ((step + (canContinue ? 1 : 0)) / STEPS.length) * 100;

  function choose(v: string) {
    setAnswers((a) => {
      if (current.multi) {
        const list = a.systems.includes(v) ? a.systems.filter((x) => x !== v) : [...a.systems, v];
        return { ...a, systems: list };
      }
      return { ...a, [current.key]: v };
    });
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not calculate recommendations.");
      setResults(data.recommendations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (!canContinue) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else void submit();
  }

  function restart() {
    setAnswers(EMPTY);
    setResults(null);
    setStep(0);
    setError(null);
  }

  const summary = () => {
    const c = CHALLENGES.find((o) => o.value === answers.challenge)?.label;
    const s = SIZES.find((o) => o.value === answers.size)?.label;
    const sys = answers.systems.map((v) => SYSTEMS.find((o) => o.value === v)?.label).join(", ");
    const t = TIMELINES.find((o) => o.value === answers.timeline)?.label;
    return `Navigator answers – Challenge: ${c}. Company size: ${s}. Current systems: ${sys}. Timeline: ${t}.`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Service navigator</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">
          {results ? "Your recommended services" : "Find the right service in 4 steps"}
        </h1>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
          <span>{results ? "Done" : `Step ${step + 1} of ${STEPS.length}`}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {results ? (
        <div className="flex flex-col gap-5">
          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-lg font-semibold text-navy">No close match found</h2>
              <p className="mt-2 text-slate-600">Talk to our team directly – we&apos;ll help you find the right starting point.</p>
              <div className="mt-6 flex justify-center">
                <ContactDialog source="navigator" defaultMessage={summary()} />
              </div>
            </Card>
          ) : (
            results.map((r, i) => (
              <Card key={r.service.id} className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{i + 1}</span>
                      <AreaBadge area={r.service.area} />
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-navy">{r.service.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{r.service.description}</p>
                  </div>
                  <div className="shrink-0 sm:w-32 sm:text-right">
                    <p className="text-3xl font-bold text-accent">{r.score}%</p>
                    <p className="text-xs text-slate-500">match</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                    <Sparkles className="size-4 text-accent" />
                    Why it fits
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <ContactDialog service={r.service} source="navigator" defaultMessage={summary()} />
                  <Button asChild variant="outline">
                    <Link href={`/service/${r.service.slug}`}>
                      Learn more
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))
          )}
          <Button variant="ghost" onClick={restart} className="self-start">
            <RotateCcw />
            Start over
          </Button>
        </div>
      ) : (
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-navy">{current.title}</h2>
          {"subtitle" in current && <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>}
          <div role={current.multi ? "group" : "radiogroup"} aria-label={current.title} className="mt-6 grid gap-3 sm:grid-cols-2">
            {current.options.map((o) => (
              <OptionButton
                key={o.value}
                multi={current.multi}
                label={o.label}
                hint={o.hint}
                selected={Array.isArray(value) ? value.includes(o.value) : value === o.value}
                onClick={() => choose(o.value)}
              />
            ))}
          </div>
          {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || loading}>
              <ArrowLeft />
              Back
            </Button>
            <Button onClick={next} disabled={!canContinue || loading} size="lg">
              {loading && <Loader2 className="animate-spin" />}
              {step === STEPS.length - 1 ? "Show recommendations" : "Next"}
              {!loading && <ArrowRight />}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
