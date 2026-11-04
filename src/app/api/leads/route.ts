import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api";
import { fieldErrors, leadPatchSchema, leadSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote everything; neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

// GET /api/leads            → JSON list (newest first)
// GET /api/leads?format=csv → CSV download
export async function GET(req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: { select: { name: true, slug: true } } },
    });

    if (req.nextUrl.searchParams.get("format") === "csv") {
      const header = ["Date", "Name", "Company", "Email", "Phone", "Service", "Source", "Status", "Message"];
      const rows = leads.map((l) =>
        [l.createdAt.toISOString(), l.name, l.company, l.email, l.phone, l.service?.name ?? "", l.source, l.status, l.message]
          .map(csvCell)
          .join(","),
      );
      const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
      const date = new Date().toISOString().slice(0, 10);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="navi-leads-${date}.csv"`,
        },
      });
    }

    return NextResponse.json(leads);
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/leads – contact form submission
export async function POST(req: NextRequest) {
  try {
    const parsed = leadSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
    const { serviceId, ...rest } = parsed.data;
    const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } }) : null;
    const lead = await prisma.lead.create({ data: { ...rest, serviceId: service?.id ?? null } });
    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

// PATCH /api/leads – body: { id, status }
export async function PATCH(req: NextRequest) {
  try {
    const parsed = leadPatchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
    const lead = await prisma.lead.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(lead);
  } catch (err) {
    return errorResponse(err);
  }
}
