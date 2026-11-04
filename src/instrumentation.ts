// Runs once when the Next.js server starts (on Railway, after `prisma migrate deploy`).
// Seeds services from data/services.csv if the Service table is empty.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { prisma } = await import("./lib/prisma");
    const { seedIfEmpty } = await import("./lib/seed");
    const n = await seedIfEmpty(prisma);
    if (n > 0) console.log(`[seed] Imported ${n} services from data/services.csv`);
  } catch (err) {
    console.error("[seed] Skipped – database not reachable or seed failed:", err);
  }
}
