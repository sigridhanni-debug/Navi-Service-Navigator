"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/form";

type Props = {
  service?: { id: string; name: string } | null;
  source?: "catalogue" | "navigator";
  defaultMessage?: string;
  label?: string;
  buttonProps?: ButtonProps;
};

type Values = { name: string; company: string; email: string; phone: string; message: string };
const EMPTY: Values = { name: "", company: "", email: "", phone: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values) {
  const e: Partial<Record<keyof Values, string>> = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!v.company.trim()) e.company = "Please enter your company.";
  if (!v.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!v.message.trim()) e.message = "Please tell us briefly what you need.";
  return e;
}

export function ContactDialog({ service, source = "catalogue", defaultMessage = "", label = "Contact the team", buttonProps }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Values>({ ...EMPTY, message: defaultMessage });
  const [errors, setErrors] = useState<Partial<Record<keyof Values | "form", string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next && status === "done") {
      setValues({ ...EMPTY, message: defaultMessage });
      setStatus("idle");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, serviceId: service?.id ?? null, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ ...(data.errors ?? {}), form: data.error ?? (data.errors ? undefined : "Could not send your request.") });
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setErrors({ form: "Network error – please check your connection and try again." });
      setStatus("idle");
    }
  }

  const invalid = (k: keyof Values) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `lead-${k}-error` } : {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>
          <Mail />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {status === "done" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-12 text-accent" />
            <DialogTitle className="mt-4">Thank you, {values.name.split(" ")[0]}!</DialogTitle>
            <DialogDescription className="mt-2">
              Your request has been received. Our team will get back to you at {values.email} within one business day.
            </DialogDescription>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Contact the team</DialogTitle>
              <DialogDescription>Tell us a little about your needs and we&apos;ll get back to you.</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <Field label="Service" htmlFor="lead-service">
                <Input id="lead-service" value={service?.name ?? "General enquiry"} readOnly disabled />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name *" htmlFor="lead-name" error={errors.name}>
                  <Input id="lead-name" autoComplete="name" value={values.name} onChange={set("name")} {...invalid("name")} />
                </Field>
                <Field label="Company *" htmlFor="lead-company" error={errors.company}>
                  <Input id="lead-company" autoComplete="organization" value={values.company} onChange={set("company")} {...invalid("company")} />
                </Field>
                <Field label="Email *" htmlFor="lead-email" error={errors.email}>
                  <Input id="lead-email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} {...invalid("email")} />
                </Field>
                <Field label="Phone" htmlFor="lead-phone" hint="Optional">
                  <Input id="lead-phone" type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} />
                </Field>
              </div>
              <Field label="Message *" htmlFor="lead-message" error={errors.message}>
                <Textarea id="lead-message" rows={4} value={values.message} onChange={set("message")} {...invalid("message")} />
              </Field>
              {errors.form && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
              <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto sm:self-end">
                {status === "sending" && <Loader2 className="animate-spin" />}
                Send request
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
