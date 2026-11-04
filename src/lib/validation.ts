import { z } from "zod";
import { AREAS, LEAD_STATUSES } from "./constants";

const list = z
  .array(z.string().trim().toLowerCase().min(1))
  .default([]);

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  name: z.string().trim().min(1, "Name is required"),
  area: z.enum(AREAS),
  description: z.string().trim().min(1, "Description is required"),
  problemsSolved: z.string().trim().default(""),
  outcome: z.string().trim().default(""),
  duration: z.string().trim().default(""),
  companySizes: list,
  tags: list,
  visible: z.boolean().default(true),
});

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: z.string().trim().min(1, "Company is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().optional().transform((v) => v || null),
  message: z.string().trim().min(1, "Message is required"),
  serviceId: z.string().optional().nullable(),
  source: z.enum(["catalogue", "navigator"]).default("catalogue"),
});

export const leadPatchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
});

export const navigatorSchema = z.object({
  challenge: z.string().min(1),
  size: z.enum(["small", "mid", "enterprise"]),
  systems: z.array(z.string()).min(1),
  timeline: z.string().min(1),
});

export type NavigatorAnswers = z.infer<typeof navigatorSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}
