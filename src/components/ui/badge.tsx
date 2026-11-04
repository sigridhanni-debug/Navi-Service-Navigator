import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-accent/10 text-accent-dark ring-accent/25",
        muted: "bg-slate-100 text-slate-700 ring-slate-200",
        outline: "bg-white text-slate-700 ring-slate-200",
        success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
        warning: "bg-amber-50 text-amber-800 ring-amber-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
