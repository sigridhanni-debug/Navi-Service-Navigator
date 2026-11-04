import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Building2, CheckCircle2, Clock, Target, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toServiceDTO } from "@/lib/api";
import { sizeLabel, type ServiceDTO } from "@/lib/constants";
import { splitProblems } from "@/lib/utils";
import { AreaBadge } from "@/components/area-badge";
import { ContactDialog } from "@/components/contact-dialog";
import { DbError } from "@/components/db-error";
import { ServiceCard } from "@/components/service-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service || !service.visible) return null;
  const candidates = await prisma.service.findMany({
    where: { visible: true, id: { not: service.id }, tags: { hasSome: service.tags } },
  });
  // Rank related services by number of shared tags.
  const related = candidates
    .map((c) => ({ c, shared: c.tags.filter((t) => service.tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 3)
    .map(({ c }) => toServiceDTO(c));
  return { service: toServiceDTO(service), related };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await prisma.service.findUnique({ where: { slug }, select: { name: true, description: true } });
    return s ? { title: s.name, description: s.description } : {};
  } catch {
    return {};
  }
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  let data: { service: ServiceDTO; related: ServiceDTO[] } | null;
  try {
    data = await load(slug);
  } catch (err) {
    console.error("[service] database error:", err);
    return <DbError />;
  }
  if (!data) notFound();
  const { service, related } = data;
  const problems = splitProblems(service.problemsSolved);

  return (
    <article>
      <section className="border-b border-slate-100 bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy">
            <ArrowLeft className="size-4" />
            All services
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <AreaBadge area={service.area} />
            {service.companySizes.map((s) => (
              <Badge key={s} variant="outline">
                <Building2 className="size-3" />
                {sizeLabel(s)}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-navy sm:text-4xl">{service.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{service.description}</p>
          <div className="mt-8">
            <ContactDialog service={service} buttonProps={{ size: "lg" }} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            <Wrench className="size-5 text-accent" />
            Typical problems it solves
          </h2>
          <ul className="mt-4 space-y-3">
            {problems.map((p) => (
              <li key={p} className="flex gap-3 text-slate-700">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
              <Target className="size-5 text-accent" />
              Expected outcome
            </h2>
            <p className="mt-3 text-slate-700">{service.outcome}</p>
          </Card>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
              <Clock className="size-5 text-accent" />
              Typical duration
            </h2>
            <p className="mt-3 text-2xl font-semibold text-navy">{service.duration}</p>
          </Card>
        </div>
        {service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 md:col-span-3">
            {service.tags.map((t) => (
              <Badge key={t} variant="muted">#{t}</Badge>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-5 text-xl font-semibold text-navy">Related services</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ServiceCard key={r.id} service={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
