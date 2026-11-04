import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy">Page not found</h1>
      <p className="mt-3 text-slate-600">The service you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
      <Button asChild className="mt-8">
        <Link href="/">Back to all services</Link>
      </Button>
    </div>
  );
}
