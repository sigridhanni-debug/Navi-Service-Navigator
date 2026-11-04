"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Eye, EyeOff, Inbox, Layers, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { LEAD_STATUSES, type ServiceDTO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Switch } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AreaBadge } from "@/components/area-badge";
import { DbError } from "@/components/db-error";
import { ServiceFormDialog } from "./service-form-dialog";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  message: string;
  source: "catalogue" | "navigator";
  status: (typeof LEAD_STATUSES)[number];
  createdAt: string;
  service: { name: string; slug: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  New: "bg-blue-50 text-blue-800 border-blue-200",
  Contacted: "bg-amber-50 text-amber-800 border-amber-200",
  Closed: "bg-slate-100 text-slate-600 border-slate-200",
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="size-5 animate-spin" /> Loading…
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState<ServiceDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ServiceDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ServiceDTO | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setServices(await getJson<ServiceDTO[]>("/api/services?all=1"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleVisible(s: ServiceDTO, visible: boolean) {
    setBusy(s.id);
    setServices((list) => list?.map((x) => (x.id === s.id ? { ...x, visible } : x)) ?? null);
    const res = await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, visible }),
    }).catch(() => null);
    if (!res?.ok) setServices((list) => list?.map((x) => (x.id === s.id ? { ...x, visible: !visible } : x)) ?? null);
    setBusy(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(toDelete.id);
    const res = await fetch(`/api/services?id=${encodeURIComponent(toDelete.id)}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) setServices((list) => list?.filter((x) => x.id !== toDelete.id) ?? null);
    setBusy(null);
    setToDelete(null);
  }

  function onSaved(saved: ServiceDTO) {
    setServices((list) => {
      if (!list) return [saved];
      const exists = list.some((x) => x.id === saved.id);
      return exists ? list.map((x) => (x.id === saved.id ? saved : x)) : [...list, saved];
    });
  }

  if (error) return <DbError message={error} />;
  if (!services) return <Loading />;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {services.length} services · {services.filter((s) => s.visible).length} visible
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          Add service
        </Button>
      </div>
      <Card className="divide-y divide-slate-100 overflow-hidden">
        {services.map((s) => (
          <div key={s.id} className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4", !s.visible && "bg-slate-50/70")}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <AreaBadge area={s.area} />
                {!s.visible && (
                  <Badge variant="muted">
                    <EyeOff className="size-3" /> Hidden
                  </Badge>
                )}
              </div>
              <Link href={`/service/${s.slug}`} className={cn("mt-1.5 block font-medium hover:text-accent", s.visible ? "text-navy" : "text-slate-500")}>
                {s.name}
              </Link>
              <p className="truncate text-xs text-slate-500">/{s.slug} · {s.tags.join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="mr-2 flex items-center gap-2 text-sm text-slate-600">
                <Switch checked={s.visible} disabled={busy === s.id} onCheckedChange={(v) => toggleVisible(s, v)} aria-label={`Visible: ${s.name}`} />
                {s.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(s);
                  setFormOpen(true);
                }}
              >
                <Pencil /> Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setToDelete(s)} aria-label={`Delete ${s.name}`} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <ServiceFormDialog open={formOpen} onOpenChange={setFormOpen} service={editing} onSaved={onSaved} />

      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              “{toDelete?.name}” will be removed permanently. Existing leads keep their data but lose the service link. To keep it, hide it instead.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busy === toDelete?.id}>
              {busy === toDelete?.id && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setLeads(await getJson<Lead[]>("/api/leads"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(lead: Lead, status: Lead["status"]) {
    const prev = lead.status;
    setLeads((list) => list?.map((l) => (l.id === lead.id ? { ...l, status } : l)) ?? null);
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status }),
    }).catch(() => null);
    if (!res?.ok) setLeads((list) => list?.map((l) => (l.id === lead.id ? { ...l, status: prev } : l)) ?? null);
  }

  if (error) return <DbError message={error} />;
  if (!leads) return <Loading />;

  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {leads.length} leads · {leads.filter((l) => l.status === "New").length} new
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            <RefreshCw /> Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/api/leads?format=csv" download>
              <Download /> Export CSV
            </a>
          </Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card className="px-6 py-16 text-center">
          <Inbox className="mx-auto size-10 text-slate-400" />
          <p className="mt-4 font-medium text-navy">No contact requests yet</p>
          <p className="mt-1 text-sm text-slate-500">Leads from the contact form will appear here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <Fragment key={l.id}>
                    <tr
                      className="cursor-pointer align-top hover:bg-slate-50/70"
                      onClick={() => setExpanded((x) => (x === l.id ? null : l.id))}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmt.format(new Date(l.createdAt))}</td>
                      <td className="px-4 py-3 font-medium text-navy">{l.company}</td>
                      <td className="px-4 py-3">
                        <span className="block text-navy">{l.name}</span>
                        <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} className="text-xs text-accent hover:underline">
                          {l.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-slate-700">{l.service?.name ?? "General enquiry"}</span>
                        <span className="text-xs text-slate-400">via {l.source}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          aria-label={`Status for ${l.company}`}
                          value={l.status}
                          onChange={(e) => setStatus(l, e.target.value as Lead["status"])}
                          className={cn("h-8 w-36 border font-medium", STATUS_STYLE[l.status])}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                    {expanded === l.id && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={5} className="px-4 pb-4 pt-1 text-slate-700">
                          {l.phone && <p className="mb-1 text-xs text-slate-500">Phone: {l.phone}</p>}
                          <p className="whitespace-pre-wrap">{l.message}</p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="mt-3 text-xs text-slate-400">Click a row to read the message.</p>
    </>
  );
}

export function AdminPanel() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-navy">Manage</h1>
      <p className="mt-1 text-slate-600">Maintain the service catalogue and follow up on contact requests.</p>
      <Tabs defaultValue="services" className="mt-8">
        <TabsList>
          <TabsTrigger value="services">
            <Layers /> Services
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Inbox /> Leads
          </TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="leads">
          <LeadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
