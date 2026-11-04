import type { ServiceDTO } from "./constants";
import { sizeLabel } from "./constants";
import type { NavigatorAnswers } from "./validation";

type Option = { value: string; label: string; hint?: string; tags: string[] };

export const CHALLENGES: Option[] = [
  {
    value: "outdated-accounting",
    label: "Our accounting / ERP system is outdated",
    hint: "Manual work, old software, no remote access",
    tags: ["old-system", "erp", "accounting", "finance", "upgrade", "nav"],
  },
  {
    value: "scattered-data",
    label: "Our data and reporting are scattered",
    hint: "Numbers live in many places and reports take days",
    tags: ["scattered-data", "data", "reporting", "bi", "dashboards", "integration", "power-bi"],
  },
  {
    value: "use-ai",
    label: "We want to start using AI",
    hint: "Copilot, automation, AI agents",
    tags: ["ai", "copilot", "automation", "agents", "productivity"],
  },
  {
    value: "it-security",
    label: "Our IT security is unclear",
    hint: "NIS2, risks, monitoring, who is responsible",
    tags: ["security", "risk", "compliance", "nis2", "audit", "monitoring", "it"],
  },
];

export const SIZES: Option[] = [
  { value: "small", label: "Small", hint: "Up to 50 employees", tags: [] },
  { value: "mid", label: "Mid-size", hint: "50–250 employees", tags: [] },
  { value: "enterprise", label: "Enterprise", hint: "250+ employees or multiple countries", tags: [] },
];

export const SYSTEMS: Option[] = [
  { value: "excel", label: "Excel / spreadsheets", tags: ["excel", "reporting", "bi", "planning"] },
  { value: "old-erp", label: "An old ERP or accounting system", tags: ["old-system", "nav", "upgrade", "selection"] },
  { value: "dynamics", label: "Microsoft Dynamics", tags: ["dynamics", "support", "optimisation", "copilot", "adoption"] },
  { value: "other", label: "Other systems", tags: ["integration", "selection", "requirements", "analysis"] },
];

export const TIMELINES: Option[] = [
  { value: "asap", label: "As soon as possible", hint: "Within the next 3 months", tags: [] },
  { value: "3-6", label: "Within 3–6 months", tags: [] },
  { value: "6-12", label: "Within 6–12 months", tags: [] },
  { value: "exploring", label: "Just exploring", tags: ["advisory", "workshop", "strategy", "selection", "analysis"] },
];

const byValue = (opts: Option[], v: string) => opts.find((o) => o.value === v);

/** Rough length of a service in weeks, parsed from free-text duration. Ongoing/project-based → null. */
function durationWeeks(duration: string): number | null {
  const m = duration.toLowerCase().match(/(\d+)\s*(?:-|–)?\s*(\d+)?\s*(week|month)/);
  if (!m) return null;
  const upper = Number(m[2] ?? m[1]);
  return m[3] === "month" ? upper * 4.3 : upper;
}

export type Recommendation = {
  service: ServiceDTO;
  score: number; // 0–100
  reasons: string[];
};

const WEIGHTS = { challenge: 4, system: 2, size: 3, timeline: 2 };

export function recommend(services: ServiceDTO[], answers: NavigatorAnswers, limit = 3): Recommendation[] {
  const challenge = byValue(CHALLENGES, answers.challenge);
  const systems = answers.systems.map((s) => byValue(SYSTEMS, s)).filter(Boolean) as Option[];
  const timeline = byValue(TIMELINES, answers.timeline);

  // Best-case raw score, used to turn points into a percentage.
  const maxPoints = WEIGHTS.challenge * 3 + WEIGHTS.system * 2 + WEIGHTS.size + WEIGHTS.timeline;

  const scored = services.map((service) => {
    const tags = new Set(service.tags);
    const reasons: string[] = [];
    let points = 0;

    const challengeHits = (challenge?.tags ?? []).filter((t) => tags.has(t));
    if (challengeHits.length) {
      points += WEIGHTS.challenge * Math.min(challengeHits.length, 3);
      reasons.push(`Directly addresses “${challenge!.label.toLowerCase()}” (${challengeHits.slice(0, 3).join(", ")}).`);
    }

    const systemHits = new Set<string>();
    const matchedSystems: string[] = [];
    for (const sys of systems) {
      const hits = sys.tags.filter((t) => tags.has(t));
      if (hits.length) matchedSystems.push(sys.label.toLowerCase());
      hits.forEach((h) => systemHits.add(h));
    }
    if (systemHits.size) {
      points += WEIGHTS.system * Math.min(systemHits.size, 2);
      reasons.push(`Fits your current setup: ${matchedSystems.join(" and ")}.`);
    }

    if (service.companySizes.includes(answers.size)) {
      points += WEIGHTS.size;
      reasons.push(`Designed for ${sizeLabel(answers.size).toLowerCase()} companies like yours.`);
    } else {
      points -= WEIGHTS.size * 2;
    }

    const weeks = durationWeeks(service.duration);
    if (answers.timeline === "asap" && weeks !== null && weeks <= 13) {
      points += WEIGHTS.timeline;
      reasons.push(`Quick to deliver (${service.duration}) for your short timeline.`);
    } else if (answers.timeline === "3-6" && weeks !== null && weeks <= 26) {
      points += WEIGHTS.timeline;
      reasons.push(`Typical duration (${service.duration}) fits within 3–6 months.`);
    } else if (answers.timeline === "6-12" && (weeks === null || weeks > 8)) {
      points += WEIGHTS.timeline;
      reasons.push(`Your timeline leaves room for a thorough project (${service.duration}).`);
    } else if (answers.timeline === "exploring" && timeline?.tags.some((t) => tags.has(t))) {
      points += WEIGHTS.timeline;
      reasons.push("A low-commitment way to explore your options first.");
    }

    const score = Math.max(0, Math.min(100, Math.round((points / maxPoints) * 100)));
    return { service, score, reasons, challengeHit: challengeHits.length > 0 };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => Number(b.challengeHit) - Number(a.challengeHit) || b.score - a.score)
    .slice(0, limit)
    .map(({ service, score, reasons }) => ({ service, score, reasons }));
}
