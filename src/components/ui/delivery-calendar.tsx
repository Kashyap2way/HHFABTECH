"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type DeliveryConfig,
  defaultDeliveryConfig,
  parseISODate,
} from "@/lib/delivery";
import { cn } from "@/lib/utils";

/** Highlight styles shared by DeliveryCalendar and DatePicker. */
export const deliveryModifierClassNames = {
  delivery:
    "rounded-(--cell-radius) bg-amber-300 font-semibold text-neutral-900 [&>button]:hover:bg-amber-300/80",
  holiday: "rounded-(--cell-radius) bg-orange-200 text-orange-900",
  sunday: "rounded-(--cell-radius) bg-red-100 text-red-700",
  peak: "[&>button]:underline [&>button]:decoration-amber-500 [&>button]:decoration-2 [&>button]:underline-offset-4",
} as const;

export function buildDeliveryModifiers(
  deliveryDate: Date | undefined,
  config: DeliveryConfig = defaultDeliveryConfig,
) {
  return {
    delivery: deliveryDate ? [deliveryDate] : [],
    holiday: config.holidays.map(parseISODate),
    sunday: { dayOfWeek: [0] },
    peak: (d: Date) => config.peakMonths.includes(d.getMonth()),
  };
}

export function DeliveryLegend({ className }: { className?: string }) {
  const items = [
    { swatch: "bg-amber-300", label: "Delivery" },
    { swatch: "bg-orange-200", label: "Holiday" },
    { swatch: "bg-red-100", label: "Sunday" },
    { swatch: "border-b-2 border-amber-500", label: "Peak season" },
  ];
  return (
    <ul
      aria-label="Calendar legend"
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("inline-block h-3 w-3 rounded-sm", item.swatch)}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

type DeliveryCalendarProps = {
  /** Estimated delivery date to highlight. */
  deliveryDate?: Date;
  config?: DeliveryConfig;
  showLegend?: boolean;
  className?: string;
};

/**
 * Read-only month calendar like the legacy quote page: highlights the
 * estimated delivery date, holidays, Sundays and peak-season months.
 * It follows the delivery date's month until the user navigates away.
 */
export function DeliveryCalendar({
  deliveryDate,
  config = defaultDeliveryConfig,
  showLegend = true,
  className,
}: DeliveryCalendarProps) {
  // The calendar reads the clock; render it after mount so prerender stays static.
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);
  const deliveryTime = deliveryDate?.getTime();

  useEffect(() => setMounted(true), []);

  // Jump to the delivery month whenever the estimate changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deliveryTime is the stable key for deliveryDate
  useEffect(() => {
    if (deliveryDate) {
      setMonth(
        new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), 1),
      );
    }
  }, [deliveryTime]);

  if (!mounted) {
    return (
      <output aria-busy="true" className={cn("grid gap-2", className)}>
        <span className="sr-only">Loading calendar…</span>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-56 w-64" />
      </output>
    );
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={buildDeliveryModifiers(deliveryDate, config)}
        modifiersClassNames={deliveryModifierClassNames}
        aria-label="Delivery calendar"
        className="rounded-lg border"
      />
      {showLegend ? <DeliveryLegend /> : null}
    </div>
  );
}
