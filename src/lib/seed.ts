import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { PrismaClient } from "@prisma/client";

type CsvRow = {
  slug: string;
  name: string;
  area: string;
  description: string;
  problems_solved: string;
  outcome: string;
  duration: string;
  company_sizes: string;
  tags: string;
};

const splitList = (value: string) =>
  value
    .split("|")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

export async function readServicesCsv(file = path.join(process.cwd(), "data", "services.csv")) {
  const content = await readFile(file, "utf8");
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true }) as CsvRow[];
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    area: r.area,
    description: r.description,
    problemsSolved: r.problems_solved,
    outcome: r.outcome,
    duration: r.duration,
    companySizes: splitList(r.company_sizes),
    tags: splitList(r.tags),
  }));
}

/** Idempotent: upserts every service from the CSV by slug. */
export async function seedServices(prisma: PrismaClient) {
  const services = await readServicesCsv();
  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }
  return services.length;
}

/** Seeds only when the Service table is empty (used on server start). */
export async function seedIfEmpty(prisma: PrismaClient) {
  const count = await prisma.service.count();
  if (count > 0) return 0;
  return seedServices(prisma);
}
