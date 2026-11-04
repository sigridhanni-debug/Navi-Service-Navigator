import { DatabaseZap } from "lucide-react";
import { DB_ERROR_MESSAGE } from "@/lib/constants";

export function DbError({ message = DB_ERROR_MESSAGE }: { message?: string }) {
  return (
    <div className="mx-auto my-12 max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
      <DatabaseZap className="mx-auto size-10 text-amber-600" />
      <h2 className="mt-4 text-lg font-semibold text-navy">Service catalogue temporarily unavailable</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </div>
  );
}
