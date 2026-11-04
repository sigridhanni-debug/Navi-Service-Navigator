import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { ServiceDTO } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaBadge } from "@/components/area-badge";

export function ServiceCard({ service, children }: { service: ServiceDTO; children?: React.ReactNode }) {
  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-[0_2px_6px_rgba(11,31,58,0.08),0_12px_32px_rgba(11,31,58,0.08)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <AreaBadge area={service.area} />
          {service.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="size-3.5" />
              {service.duration}
            </span>
          )}
        </div>
        <CardTitle className="pt-1">
          <Link href={`/service/${service.slug}`} className="hover:text-accent">
            {service.name}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
      </CardHeader>
      {children && <CardContent className="pb-4">{children}</CardContent>}
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="group-hover:border-accent/40 group-hover:text-accent">
          <Link href={`/service/${service.slug}`} aria-label={`Learn more about ${service.name}`}>
            Learn more
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
