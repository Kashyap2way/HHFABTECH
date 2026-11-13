import { type ReactNode, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  required?: boolean;
  /** Helper text shown under the control. */
  hint?: string;
  /** Error message. Switches the control to the invalid state and announces it. */
  error?: string | null;
  className?: string;
  /**
   * Render prop gets the props to spread on the control, so the label,
   * hint and error are wired up for screen readers.
   */
  children: (control: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    "aria-required": true | undefined;
  }) => ReactNode;
};

/**
 *   <FormField label="Email" required error={errors.email}>
 *     {(control) => <Input type="email" {...control} />}
 *   </FormField>
 */
export function FormField({
  label,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="h-5 leading-5">
        {label}
        {required ? (
          <span aria-hidden="true" className="leading-none text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
