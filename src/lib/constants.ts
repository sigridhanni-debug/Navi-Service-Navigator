export const AREAS = ["ERP", "Data & AI", "Advisory", "IT & Security"] as const;

export const COMPANY_SIZES = [
  { value: "small", label: "Small" },
  { value: "mid", label: "Mid-size" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export const DB_ERROR_MESSAGE =
  "We can't reach the database right now. Please try again in a moment.";

export const LEAD_STATUSES = ["New", "Contacted", "Closed"] as const;

export type ServiceDTO = {
  id: string;
  slug: string;
  name: string;
  area: string;
  description: string;
  problemsSolved: string;
  outcome: string;
  duration: string;
  companySizes: string[];
  tags: string[];
  visible: boolean;
};

export const AREA_STYLES: Record<string, string> = {
  ERP: "bg-blue-50 text-blue-800 ring-blue-200",
  "Data & AI": "bg-teal-50 text-teal-800 ring-teal-200",
  Advisory: "bg-amber-50 text-amber-800 ring-amber-200",
  "IT & Security": "bg-slate-100 text-slate-800 ring-slate-300",
};

export function sizeLabel(size: string) {
  return COMPANY_SIZES.find((s) => s.value === size)?.label ?? size;
}
