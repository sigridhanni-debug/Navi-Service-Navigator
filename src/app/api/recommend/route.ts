import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, toServiceDTO } from "@/lib/api";
import { recommend } from "@/lib/recommend";
import { fieldErrors, navigatorSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/recommend – body: { challenge, size, systems[], timeline }
export async function POST(req: NextRequest) {
  try {
    const parsed = navigatorSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 400 });

    const services = (await prisma.service.findMany({ where: { visible: true } })).map(toServiceDTO);
    const recommendations = recommend(services, parsed.data);

    await prisma.navigatorAnswer.create({
      data: {
        answers: parsed.data,
        recommendedServiceIds: recommendations.map((r) => r.service.id),
      },
    });

    return NextResponse.json({ recommendations });
  } catch (err) {
    return errorResponse(err);
  }
}
