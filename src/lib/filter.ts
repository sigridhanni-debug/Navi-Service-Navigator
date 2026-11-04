import type { ServiceDTO } from "./constants";

export type ServiceFilter = { q?: string; areas?: string[]; sizes?: string[] };

/** Search matches name, description and tags; area and size filters combine (AND). */
export function filterServices<T extends Pick<ServiceDTO, "name" | "description" | "tags" | "area" | "companySizes">>(
  services: T[],
  { q = "", areas = [], sizes = [] }: ServiceFilter,
) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return services.filter((s) => {
    if (areas.length && !areas.includes(s.area)) return false;
    if (sizes.length && !sizes.some((z) => s.companySizes.includes(z))) return false;
    if (!terms.length) return true;
    const haystack = [s.name, s.description, ...s.tags].join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function parseList(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
