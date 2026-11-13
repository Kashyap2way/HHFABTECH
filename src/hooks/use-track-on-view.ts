"use client";

import { type RefObject, useEffect, useRef } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

/**
 * Fire an event once when an element scrolls into view.
 *
 *   const ref = useRef<HTMLElement>(null);
 *   useTrackOnView(ref, { name: "custom", eventName: "pricing_viewed" });
 *   <section ref={ref}>...</section>
 */
export function useTrackOnView(
  ref: RefObject<Element | null>,
  event: AnalyticsEvent,
  threshold = 0.5,
) {
  const eventRef = useRef(event);
  eventRef.current = event;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          track(eventRef.current);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
}
