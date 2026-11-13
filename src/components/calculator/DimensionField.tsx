"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

type DimensionFieldProps<U extends string> = {
  label: string;
  /** Short symbol, e.g. "L", shown at the right of the label */
  symbol?: string;
  hint?: string;
  error?: string | null;
  value: string;
  unit: U;
  units: readonly Option<U>[];
  placeholder?: string;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: U) => void;
  className?: string;
};

/** Shared control look (legacy `.tc-input-group`): 48px, 11px radius, gold focus ring. */
export const controlClass =
  "h-12 w-full rounded-[11px] border border-[#dfe3e8] bg-white text-base text-[#111827] tabular-nums outline-none transition-[border-color,box-shadow] placeholder:text-[#98a2b3] focus-visible:border-[#b8860b] focus-visible:shadow-[0_0_0_3px_rgb(184_134_11/0.12)] disabled:cursor-not-allowed disabled:bg-[#f4f5f7] aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_rgb(220_38_38/0.1)] md:text-sm";

/** Text input (accepts simple sums such as 2400*1.1) plus a unit selector. */
export function DimensionField<U extends string>({
  label,
  symbol,
  hint,
  error,
  value,
  unit,
  units,
  placeholder,
  onValueChange,
  onUnitChange,
  className,
}: DimensionFieldProps<U>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-[7px] flex items-baseline justify-between gap-2.5 text-[13px] font-semibold text-[#344054]"
      >
        <span>{label}</span>
        {symbol ? (
          <span className="text-[11px] font-medium text-[#98a2b3]">
            {symbol}
          </span>
        ) : null}
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2 sm:grid-cols-[minmax(0,1fr)_94px]">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder ?? "0"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(controlClass, "px-3.5")}
        />
        <div className="relative">
          <select
            aria-label={`${label} unit`}
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as U)}
            className={cn(
              controlClass,
              "cursor-pointer appearance-none pr-7 pl-2.5",
            )}
          >
            {units.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2 text-[#667085]"
          >
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {hint && !error ? (
        <p
          id={hintId}
          className="mt-[7px] text-[11.5px] leading-relaxed text-[#667085]"
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-[7px] text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
