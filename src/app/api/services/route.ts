import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, toServiceDTO } from "@/lib/api";
import { filterServices, parseList } from "@/lib/filter";
import { fieldErrors, serviceSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/services?q=excel&area=ERP,Advisory&size=small&all=1
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const includeHidden = sp.get("all") === "1";
    const services = await prisma.service.findMany({
      where: includeHidden ? {} : { visible: true },
      orderBy: [{ area: "asc" }, { name: "asc" }],
    });
    const result = filterServices(services.map(toServiceDTO), {
      q: sp.get("q") ?? "",
      areas: parseList(sp.get("area")),
      sizes: parseList(sp.get("size")),
    });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/services – create
export async function POST(req: NextRequest) {
  try {
    const parsed = serviceSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
    const service = await prisma.service.create({ data: parsed.data });
    return NextResponse.json(toServiceDTO(service), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

// PUT /api/services – update (body must include id; partial fields allowed)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : null;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const parsed = serviceSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
    // Only apply keys actually sent, so partial updates (e.g. visible toggle) don't reset defaults.
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([k]) => k in body),
    ) as typeof parsed.data;
    const service = await prisma.service.update({ where: { id }, data });
    return NextResponse.json(toServiceDTO(service));
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/services?id=...
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
