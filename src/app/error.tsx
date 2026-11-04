"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <AlertTriangle className="mx-auto size-10 text-amber-500" />
      <h1 className="mt-4 text-2xl font-bold text-navy">Something went wrong</h1>
      <p className="mt-3 text-slate-600">Please try again in a moment.</p>
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </div>
  );
}
