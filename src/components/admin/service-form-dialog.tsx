"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AREAS, COMPANY_SIZES, type ServiceDTO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, Input, Label, Select, Switch, Textarea } from "@/components/ui/form";

type FormState = {
  slug: string;
  name: string;
  area: string;
  description: string;
  problemsSolved: string;
  outcome: string;
  duration: string;
  companySizes: string[];
  tags: string;
  visible: boolean;
};

const blank: FormState = {
  slug: "",
  name: "",
  area: AREAS[0],
  description: "",
  problemsSolved: "",
  outcome: "",
  duration: "",
  companySizes: [],
  tags: "",
  visible: true,
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceDTO | null;
  onSaved: (s: ServiceDTO) => void;
}) {
  const [form, setForm] = useState<FormState>(blank);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSlugTouched(Boolean(service));
    setForm(service ? { ...service, tags: service.tags.join(", ") } : blank);
  }, [open, service]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!form.name.trim()) local.name = "Name is required";
    if (!form.slug.trim()) local.slug = "Slug is required";
    if (!form.description.trim()) local.description = "Description is required";
    setErrors(local);
    if (Object.keys(local).length) return;

    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(/[,|]/).map((t) => t.trim()).filter(Boolean),
      ...(service ? { id: service.id } : {}),
    };
    try {
      const res = await fetch("/api/services", {
        method: service ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Could not save the service." });
        return;
      }
      onSaved(data);
      onOpenChange(false);
    } catch {
      setErrors({ form: "Network error – please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>Tags and company sizes drive search, related services and navigator matching.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *" htmlFor="svc-name" error={errors.name}>
              <Input
                id="svc-name"
                value={form.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug *" htmlFor="svc-slug" error={errors.slug} hint="Used in the URL: /service/slug">
              <Input
                id="svc-slug"
                value={form.slug}
                aria-invalid={Boolean(errors.slug)}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
              />
            </Field>
            <Field label="Business area" htmlFor="svc-area" error={errors.area}>
              <Select id="svc-area" value={form.area} onChange={(e) => set("area", e.target.value)}>
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Typical duration" htmlFor="svc-duration" hint="e.g. 4-8 weeks, 3-6 months, Ongoing">
              <Input id="svc-duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
          </div>
          <Field label="Description *" htmlFor="svc-description" error={errors.description}>
            <Textarea id="svc-description" rows={2} value={form.description} aria-invalid={Boolean(errors.description)} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Problems solved" htmlFor="svc-problems" hint="Separate problems with a semicolon (;)">
            <Textarea id="svc-problems" rows={2} value={form.problemsSolved} onChange={(e) => set("problemsSolved", e.target.value)} />
          </Field>
          <Field label="Expected outcome" htmlFor="svc-outcome">
            <Input id="svc-outcome" value={form.outcome} onChange={(e) => set("outcome", e.target.value)} />
          </Field>
          <Field label="Tags" htmlFor="svc-tags" hint="Comma-separated, e.g. erp, excel, old-system">
            <Input id="svc-tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium text-navy">Company sizes</legend>
            <div className="flex flex-wrap gap-4">
              {COMPANY_SIZES.map((s) => (
                <label key={s.value} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-accent)]"
                    checked={form.companySizes.includes(s.value)}
                    onChange={(e) =>
                      set(
                        "companySizes",
                        e.target.checked ? [...form.companySizes, s.value] : form.companySizes.filter((x) => x !== s.value),
                      )
                    }
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-3">
            <Switch id="svc-visible" checked={form.visible} onCheckedChange={(v) => set("visible", v)} />
            <Label htmlFor="svc-visible">Visible in catalogue</Label>
          </div>
          {errors.form && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {service ? "Save changes" : "Add service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
