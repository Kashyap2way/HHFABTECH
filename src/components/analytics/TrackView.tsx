"use client";

import { useEffect } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

/** Fires an analytics event once when the page mounts (e.g. product page view). */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  const key = JSON.stringify(event);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the serialised event; re-fire only when it changes
  useEffect(() => {
    track(event);
  }, [key]);
  return null;
}
