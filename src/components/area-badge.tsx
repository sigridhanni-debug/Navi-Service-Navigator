import { Database, Lightbulb, Server, ShieldCheck } from "lucide-react";
import { AREA_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ERP: Server,
  "Data & AI": Database,
  Advisory: Lightbulb,
  "IT & Security": ShieldCheck,
};

export function AreaBadge({ area, className }: { area: string; className?: string }) {
  const Icon = ICONS[area];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        AREA_STYLES[area] ?? "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {area}
    </span>
  );
}
