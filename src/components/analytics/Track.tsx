"use client";

import { cloneElement, type ReactElement } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

type Trigger = "click" | "submit" | "focus";

const handlerProp = {
  click: "onClick",
  submit: "onSubmit",
  focus: "onFocus",
} as const;

type TrackProps = {
  /** Event to send when the trigger fires. */
  event: AnalyticsEvent;
  /** Which interaction triggers it. Defaults to click. */
  on?: Trigger;
  /** Exactly one element that accepts the matching handler (button, a, form, input, shadcn Button...). */
  children: ReactElement<Record<string, unknown>>;
};

/**
 * Wrap any element to add analytics without touching it:
 *
 *   <Track event={{ name: "cta_click", label: "Request quote", location: "hero" }}>
 *     <Button>Request quote</Button>
 *   </Track>
 *
 * The child's own handler still runs.
 */
export function Track({ event, on = "click", children }: TrackProps) {
  const prop = handlerProp[on];
  const original = children.props[prop] as
    | ((...args: unknown[]) => void)
    | undefined;

  return cloneElement(children, {
    [prop]: (...args: unknown[]) => {
      track(event);
      original?.(...args);
    },
  });
}
