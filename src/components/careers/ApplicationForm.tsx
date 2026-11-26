"use client";

import {
  CheckCircle2Icon,
  CircleAlertIcon,
  FileTextIcon,
  SendIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import {
  type DragEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
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
import {
  APPLICATION_FORM_NAME,
  submitApplication,
} from "@/lib/forms/application";
import {
  type ApplicationErrors,
  MAX_LEN,
  RESUME_ACCEPT,
  validateApplication,
} from "@/lib/forms/application-validation";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";

export type PositionOption = { id: string; title: string; department: string };

export const GENERAL_APPLICATION = "General application";

const EXPERIENCE = [
  "Fresher",
  "Less than 1 year",
  "1 – 2 years",
  "2 – 5 years",
  "5 – 10 years",
  "More than 10 years",
] as const;

const NOTICE = [
  "Immediate",
  "15 days",
  "30 days",
  "60 days",
  "90 days",
] as const;

const control = "h-11 rounded-lg bg-white px-3 text-base md:text-[15px]";
const selectControl =
  "w-full [&_select]:h-11 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base md:[&_select]:text-[15px]";

const prettySize = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Job application form. Submits to Netlify Forms (notifications) and Sanity (records).
 * With `job`, the position is fixed (job detail page); otherwise the candidate picks one.
 */
export function ApplicationForm({
  positions,
  job,
  location,
}: {
  positions: readonly PositionOption[];
  job?: PositionOption;
  /** Page area for analytics, e.g. "careers" or "job_detail". */
  location: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<string>(job?.title ?? "");
  const startedRef = useRef(false);
  const ids = { resume: useId(), consent: useId() };

  const selected =
    job ?? positions.find((p) => p.title === position) ?? undefined;

  const submit = useAsyncAction(
    async (data: FormData) => {
      await submitApplication(data);
      return {
        position: String(data.get("job_position") ?? ""),
        jobId: String(data.get("job_id") ?? "") || undefined,
        department: selected?.department,
      };
    },
    {
      onSuccessEvent: (r) => ({
        name: "submit_application",
        position: r.position,
        jobId: r.jobId,
        department: r.department,
      }),
    },
  );

  useEffect(() => {
    if (submit.isSuccess) toast.success("Application sent. Thank you!");
  }, [submit.isSuccess]);

  function onFirstInteraction() {
    if (startedRef.current) return;
    startedRef.current = true;
    track({
      name: "application_start",
      position: position || undefined,
      location,
    });
  }

  function pickFile(f: File | null) {
    setFile(f);
    setErrors((e) => ({ ...e, resume: undefined }));
    // Keep the real <input type=file> in sync so FormData picks it up.
    if (fileRef.current) {
      const dt = new DataTransfer();
      if (f) dt.items.add(f);
      fileRef.current.files = dt.files;
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      onFirstInteraction();
      pickFile(f);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("bot-field")) return;

    const found = validateApplication(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      track({
        name: "custom",
        eventName: "form_validation_error",
        params: {
          form_name: APPLICATION_FORM_NAME,
          form_location: location,
          fields: Object.keys(found).join(","),
        },
      });
      return;
    }
    data.set("job_id", selected?.id ?? "");
    data.set("source_page", window.location.pathname);
    data.set(
      "subject",
      `Job application: ${String(data.get("job_position"))} – ${String(data.get("name"))}`,
    );
    await submit.run(data);
  }

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
          Thank you, your application is in
        </h3>
        <p className="max-w-md text-muted-foreground">
          Our team reviews every application. If your profile matches, we'll
          call you to arrange an interview at our Sanathal factory.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/career#openings"
            className="inline-flex h-11 items-center justify-center rounded-full border border-brand/20 px-6 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            See other openings
          </Link>
          <Button
            variant="ghost"
            size="lg"
            className="h-11 rounded-full px-6"
            onClick={() => {
              submit.reset();
              setFile(null);
              startedRef.current = false;
            }}
          >
            Submit another application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      name={APPLICATION_FORM_NAME}
      method="POST"
      encType="multipart/form-data"
      noValidate
      onSubmit={onSubmit}
      onFocus={onFirstInteraction}
      aria-describedby={`${ids.consent}-note`}
      className="grid gap-8"
    >
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this empty{" "}
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {submit.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Your application wasn't sent</AlertTitle>
          <AlertDescription>
            {submit.error} You can also email your résumé to{" "}
            <a
              className="font-semibold underline"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="grid gap-5" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          1 · Position
        </legend>
        {job ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/10 bg-brand/[0.03] px-4 py-3">
            <p>
              <span className="block text-xs text-muted-foreground">
                Applying for
              </span>
              <span className="font-semibold text-brand">{job.title}</span>
            </p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
              {job.department}
            </span>
            <input type="hidden" name="job_position" value={job.title} />
          </div>
        ) : (
          <FormField
            label="Position applying for"
            required
            error={errors.job_position}
          >
            {(c) => (
              <NativeSelect
                {...c}
                name="job_position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={selectControl}
              >
                <NativeSelectOption value="">
                  Select a position
                </NativeSelectOption>
                {positions.map((p) => (
                  <NativeSelectOption key={p.id} value={p.title}>
                    {p.title} · {p.department}
                  </NativeSelectOption>
                ))}
                <NativeSelectOption value={GENERAL_APPLICATION}>
                  {GENERAL_APPLICATION} (any suitable role)
                </NativeSelectOption>
              </NativeSelect>
            )}
          </FormField>
        )}
      </fieldset>

      <fieldset className="grid gap-5" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          2 · Your details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" required error={errors.name}>
            {(c) => (
              <Input
                {...c}
                name="name"
                autoComplete="name"
                maxLength={MAX_LEN.name}
                placeholder="Your full name"
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
                maxLength={MAX_LEN.phone}
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
                maxLength={MAX_LEN.email}
                placeholder="name@example.com"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Current city">
            {(c) => (
              <Input
                {...c}
                name="city"
                autoComplete="address-level2"
                maxLength={MAX_LEN.city}
                placeholder="e.g. Ahmedabad"
                className={control}
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="grid gap-5" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          3 · Experience
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Highest qualification"
            required
            error={errors.qualification}
          >
            {(c) => (
              <Input
                {...c}
                name="qualification"
                maxLength={MAX_LEN.qualification}
                placeholder="e.g. Diploma Mechanical, ITI Welder"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Total experience">
            {(c) => (
              <NativeSelect
                {...c}
                name="experience"
                defaultValue=""
                className={selectControl}
              >
                <NativeSelectOption value="">Select</NativeSelectOption>
                {EXPERIENCE.map((x) => (
                  <NativeSelectOption key={x} value={x}>
                    {x}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField label="Current company">
            {(c) => (
              <Input
                {...c}
                name="current_company"
                autoComplete="organization"
                maxLength={MAX_LEN.current_company}
                placeholder="Leave empty if not working"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Expected salary (per month)">
            {(c) => (
              <Input
                {...c}
                name="expected_salary"
                inputMode="numeric"
                maxLength={MAX_LEN.expected_salary}
                placeholder="e.g. ₹22,000"
                className={control}
              />
            )}
          </FormField>
          <FormField label="Notice period">
            {(c) => (
              <NativeSelect
                {...c}
                name="notice_period"
                defaultValue=""
                className={selectControl}
              >
                <NativeSelectOption value="">Select</NativeSelectOption>
                {NOTICE.map((x) => (
                  <NativeSelectOption key={x} value={x}>
                    {x}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField
            label="Cover letter / message"
            hint="Optional. Tell us about the work you've done and the machines you can operate."
            error={errors.message}
            className="sm:col-span-2"
          >
            {(c) => (
              <Textarea
                {...c}
                name="message"
                rows={4}
                maxLength={MAX_LEN.message}
                className="min-h-28 rounded-lg bg-white px-3 py-2.5 text-base md:text-[15px]"
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="grid gap-3" disabled={submit.isLoading}>
        <legend className="mb-4 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
          4 · Résumé
        </legend>
        <label
          htmlFor={ids.resume}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
            dragging
              ? "border-brand bg-brand/[0.05]"
              : errors.resume
                ? "border-destructive/60 bg-destructive/[0.03]"
                : "border-brand/25 bg-white hover:border-brand/50 hover:bg-brand/[0.02]",
          )}
        >
          {file ? (
            <span className="flex w-full max-w-md items-center gap-3 rounded-lg border border-brand/10 bg-brand/[0.03] p-3 text-left">
              <FileTextIcon
                aria-hidden="true"
                className="size-8 shrink-0 text-brand"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-brand">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {prettySize(file.size)}
                </span>
              </span>
            </span>
          ) : (
            <>
              <UploadCloudIcon
                aria-hidden="true"
                className="size-9 text-brand"
              />
              <span className="font-semibold text-brand">
                Drop your résumé here, or{" "}
                <span className="underline underline-offset-2">browse</span>
              </span>
              <span className="text-sm text-muted-foreground">
                PDF, DOC or DOCX, up to 5 MB
              </span>
            </>
          )}
          <input
            ref={fileRef}
            id={ids.resume}
            type="file"
            name="resume"
            accept={RESUME_ACCEPT}
            required
            aria-invalid={errors.resume ? true : undefined}
            aria-describedby={errors.resume ? `${ids.resume}-error` : undefined}
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file ? (
          <button
            type="button"
            onClick={() => pickFile(null)}
            className="inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-medium text-muted-foreground hover:text-destructive"
          >
            <XIcon aria-hidden="true" className="size-4" /> Remove file
          </button>
        ) : null}
        {errors.resume ? (
          <p
            id={`${ids.resume}-error`}
            role="alert"
            className="text-xs text-destructive"
          >
            {errors.resume}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-2">
        <label
          htmlFor={ids.consent}
          className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
        >
          <input
            id={ids.consent}
            type="checkbox"
            name="consent"
            value="yes"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={
              errors.consent ? `${ids.consent}-error` : undefined
            }
            disabled={submit.isLoading}
            className="mt-1 size-4 shrink-0 accent-[var(--color-brand)]"
          />
          <span>
            I agree that HH FABTECH may store my details and résumé to process
            this application and contact me about suitable roles.
            <span className="text-destructive"> *</span>
          </span>
        </label>
        {errors.consent ? (
          <p
            id={`${ids.consent}-error`}
            role="alert"
            className="text-xs text-destructive"
          >
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${ids.consent}-note`} className="text-sm text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are
          required. We never share your details.
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
              Submit application <SendIcon aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
