import { prisma } from "@/lib/prisma";
import { toServiceDTO } from "@/lib/api";
import { Catalogue } from "@/components/catalogue";
import { DbError } from "@/components/db-error";
import type { ServiceDTO } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let services: ServiceDTO[];
  try {
    services = (
      await prisma.service.findMany({ where: { visible: true }, orderBy: [{ area: "asc" }, { name: "asc" }] })
    ).map(toServiceDTO);
  } catch (err) {
    console.error("[catalogue] database error:", err);
    return <DbError />;
  }
  return <Catalogue services={services} />;
}
