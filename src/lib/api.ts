import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { DB_ERROR_MESSAGE, type ServiceDTO } from "./constants";

export { DB_ERROR_MESSAGE };

export function isDbConnectionError(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && ["P1001", "P1002", "P1008", "P1017"].includes(err.code))
  );
}

/** Converts any thrown error into a JSON response without leaking internals. */
export function errorResponse(err: unknown) {
  if (isDbConnectionError(err)) {
    console.error("[db] unreachable:", err);
    return NextResponse.json({ error: DB_ERROR_MESSAGE }, { status: 503 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
    if (err.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function toServiceDTO(s: {
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
}): ServiceDTO {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    area: s.area,
    description: s.description,
    problemsSolved: s.problemsSolved,
    outcome: s.outcome,
    duration: s.duration,
    companySizes: s.companySizes,
    tags: s.tags,
    visible: s.visible,
  };
}
