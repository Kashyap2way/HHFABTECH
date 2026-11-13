"use client";

import {
  CheckCircle2Icon,
  CircleAlertIcon,
  PaperclipIcon,
  SendIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncAction } from "@/hooks/use-async-action";
import { track } from "@/lib/analytics/events";
import { CONTACT_FORM_NAME, submitContact } from "@/lib/forms/contact";
import {
  ATTACHMENT_ACCEPT,
  type ContactErrors,
  validateContact,
} from "@/lib/forms/contact-validation";
import { productOptions } from "@/lib/products";
import { contact } from "@/lib/site";

const FORM_NAME = CONTACT_FORM_NAME;
const materials = [
  "Mild Steel (MS)",
  "Aluminium",
  "Stainless Steel (SS)",
] as const;

const control = "h-11 rounded-lg bg-white px-3 text-base md:text-[15px]";
const selectControl =
  "w-full [&_select]:h-11 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base md:[&_select]:text-[15px]";

/** Read ?product, ?cap and ?spec (sent by product pages, the calculator and quote builder). */
function usePrefill() {
  const params = useSearchParams();
  const product = params.get("product") ?? "";
  return {
    product:
      productOptions.find((p) => p.toLowerCase() === product.toLowerCase()) ??
      "",
    capacity: params.get("cap") ?? "",
    specification: params.get("spec") ?? "",
  };
}

export function ContactForm() {
  const prefill = usePrefill();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const startedRef = useRef(false);
  const prefilled = Boolean(prefill.capacity || prefill.specification);

  // Resolves with the product so the conversion event is tagged with it.
  const submit = useAsyncAction(
    async (data: FormData) => {
      // Netlify Forms (email notification) + Sanity (inquiry record in /studio).
      await submitContact(data);
      return String(data.get("product") ?? "");
    },
    {
      onSuccessEvent: (product) => ({
        name: "generate_lead",
        source: "contact_form",
        product: product || undefined,
      }),
    },
  );

  // Scroll to the form when arriving with prefilled calculator / quote data.
  useEffect(() => {
    if (prefilled)
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [prefilled]);

  function onFirstInteraction() {
    if (startedRef.current) return;
    startedRef.current = true;
    track({
      name: "custom",
      eventName: "form_start",
      params: { form_name: FORM_NAME },
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real users never fill this hidden field.
    if (data.get("bot-field")) return;

    const found = validateContact(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      track({
        name: "custom",
        eventName: "form_validation_error",
        params: { form_name: FORM_NAME, fields: Object.keys(found).join(",") },
      });
      return;
    }

    // Drop an empty file input so Netlify doesn't store a blank attachment.
    const file = data.get("attachment");
    if (file instanceof File && file.size === 0) data.delete("attachment");
    data.set("source_page", window.location.pathname);

    // Errors are captured by useAsyncAction and rendered in the alert above the form.
    await submit.run(data);
  }

  useEffect(() => {
    if (submit.isSuccess) {
      toast.success("Inquiry sent. We'll get back to you shortly.");
      setFileName(null);
    }
  }, [submit.isSuccess]);

  if (submit.isSuccess) {
    return (
      <div
        aria-live="polite"
        className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center md:p-12"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2Icon aria-hidden="true" className="size-8" />
        </span>
        <h3 className="text-2xl font-bold text-brand">
          Thank you, we've received your inquiry
        </h3>
        <p className="max-w-md text-muted-foreground">
          Our team will contact you within one working day. For anything urgent,
          call{" "}
          <a
            className="font-semibold text-brand underline"
            href={`tel:${contact.people[0].tel}`}
          >
            {contact.people[0].display}
          </a>
          .
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-2 h-11 rounded-full px-6"
          onClick={() => submit.reset()}
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      id="inquiry"
      name={FORM_NAME}
      method="POST"
      encType="multipart/form-data"
      noValidate
      onSubmit={onSubmit}
      onFocus={onFirstInteraction}
      aria-describedby="inquiry-note"
      className="grid gap-8"
    >
      <input
        type="hidden"
        name="subject"
        value="New Inquiry from HH FABTECH Website"
      />
      {/* Honeypot (declared as netlify-honeypot in public/__forms.html) */}
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this empty{" "}
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {submit.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Your inquiry wasn't sent</AlertTitle>
          <AlertDescription>{submit.error}</AlertDescription>
        </Alert>
      ) : null}

      {prefilled ? (
        <Alert role="status">
          <CheckCircle2Icon />
          <AlertTitle>Details added from your calculation</AlertTitle>
          <AlertDescription>
            Review the capacity and specification below, then add your contact
            details.
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="grid gap-5" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          1 · Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" required error={errors.name}>
            {(c) => (
              <Input
                {...c}
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Company name">
            {(c) => (
              <Input
                {...c}
                name="company"
                autoComplete="organization"
                placeholder="Company name"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Mobile number" required error={errors.phone}>
            {(c) => (
              <Input
                {...c}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Email address" required error={errors.email}>
            {(c) => (
              <Input
                {...c}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                className={control}
              />
            )}
          </FormField>
          <FormField label="City / State" className="sm:col-span-2">
            {(c) => (
              <Input
                {...c}
                name="city"
                autoComplete="address-level2"
                placeholder="Ahmedabad, Gujarat"
                className={control}
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="grid gap-5" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          2 · Your requirement
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Product interested in"
            required
            error={errors.product}
          >
            {(c) => (
              <NativeSelect
                {...c}
                name="product"
                defaultValue={prefill.product}
                className={selectControl}
              >
                <NativeSelectOption value="">Select product</NativeSelectOption>
                {productOptions.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {p}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField label="Material">
            {(c) => (
              <NativeSelect
                {...c}
                name="material"
                defaultValue=""
                className={selectControl}
              >
                <NativeSelectOption value="">
                  Select material
                </NativeSelectOption>
                {materials.map((m) => (
                  <NativeSelectOption key={m} value={m}>
                    {m}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField label="Tank capacity required">
            {(c) => (
              <Input
                {...c}
                name="capacity"
                defaultValue={prefill.capacity}
                placeholder="e.g. 24 KL"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Number of compartments">
            {(c) => (
              <Input
                {...c}
                name="compartments"
                placeholder="e.g. 5 compartments"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Vehicle / chassis model" className="sm:col-span-2">
            {(c) => (
              <Input
                {...c}
                name="vehicle"
                placeholder="e.g. Tata 3118 / BharatBenz"
                className={control}
              />
            )}
          </FormField>
          <FormField
            label="Requirement"
            required
            error={errors.requirement}
            className="sm:col-span-2"
          >
            {(c) => (
              <Textarea
                {...c}
                name="requirement"
                rows={4}
                placeholder="Briefly describe what you need…"
                className="min-h-28 rounded-lg bg-white px-3 py-2.5 text-base md:text-[15px]"
              />
            )}
          </FormField>
          <FormField
            label="Detailed specification"
            hint="Dimensions, fittings, loading type or any technical detail."
            className="sm:col-span-2"
          >
            {(c) => (
              <Textarea
                {...c}
                name="specification"
                rows={4}
                defaultValue={prefill.specification}
                className="min-h-24 rounded-lg bg-white px-3 py-2.5 text-base md:text-[15px]"
              />
            )}
          </FormField>
          <FormField
            label="Additional customisation"
            hint="Paint colour, branding, lining, certifications, delivery timeline…"
            className="sm:col-span-2"
          >
            {(c) => (
              <Textarea
                {...c}
                name="customization"
                rows={3}
                className="min-h-20 rounded-lg bg-white px-3 py-2.5 text-base md:text-[15px]"
              />
            )}
          </FormField>
          <FormField
            label="Attach drawing, images or PDF"
            hint="PDF, JPG, PNG, WEBP or DWG, up to 8 MB."
            error={errors.attachment}
            className="sm:col-span-2"
          >
            {(c) => (
              <label
                htmlFor={c.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand/30 bg-white px-4 py-4 text-sm transition-colors hover:border-brand hover:bg-brand/[0.03] has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-[[aria-invalid]]:border-destructive"
              >
                <PaperclipIcon
                  aria-hidden="true"
                  className="size-5 text-brand"
                />
                <span className="truncate">{fileName ?? "Choose a file"}</span>
                <input
                  {...c}
                  type="file"
                  name="attachment"
                  accept={ATTACHMENT_ACCEPT}
                  className="sr-only"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
            )}
          </FormField>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="inquiry-note" className="text-sm text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are
          required. We only use your details to respond to this inquiry.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={submit.isLoading}
          className="h-12 w-full shrink-0 rounded-full px-8 text-base font-semibold sm:w-auto"
        >
          {submit.isLoading ? (
            "Sending…"
          ) : (
            <>
              Send Inquiry <SendIcon aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
