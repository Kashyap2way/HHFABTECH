"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  buildDeliveryModifiers,
  DeliveryLegend,
  deliveryModifierClassNames,
} from "@/components/ui/delivery-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { type DeliveryConfig, defaultDeliveryConfig } from "@/lib/delivery";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  /** Show holidays / Sundays / peak season like the quote page. */
  highlightDelivery?: boolean;
  deliveryConfig?: DeliveryConfig;
  /** Disable selecting specific dates (e.g. past dates). */
  disabled?: ComponentProps<typeof Calendar>["disabled"];
  /** Marks the control invalid and wires aria attributes. */
  error?: string | null;
  loading?: boolean;
  className?: string;
};

/** Popover date picker built on the shadcn Calendar. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  highlightDelivery = false,
  deliveryConfig = defaultDeliveryConfig,
  disabled,
  error,
  loading,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || loading) {
    return (
      <Skeleton
        aria-busy="true"
        className={cn("h-8 w-full max-w-60", className)}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            aria-invalid={error ? true : undefined}
            className={cn(
              "w-full max-w-60 justify-start font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {value ? format(value, "PPP") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto gap-2 p-2" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabled}
          onSelect={(date) => {
            onChange(date);
            if (date) setOpen(false);
          }}
          {...(highlightDelivery
            ? {
                modifiers: buildDeliveryModifiers(undefined, deliveryConfig),
                modifiersClassNames: deliveryModifierClassNames,
              }
            : {})}
        />
        {highlightDelivery ? <DeliveryLegend className="px-2 pb-1" /> : null}
      </PopoverContent>
    </Popover>
  );
}
