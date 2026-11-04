import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, toServiceDTO } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/services/[slug] – a service plus related services (shared tags)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service || !service.visible) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const related = await prisma.service.findMany({
      where: { visible: true, id: { not: service.id }, tags: { hasSome: service.tags } },
    });
    return NextResponse.json({ ...toServiceDTO(service), related: related.map(toServiceDTO) });
  } catch (err) {
    return errorResponse(err);
  }
}
