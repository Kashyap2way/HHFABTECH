"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/events";

/** Reports the broken URL so dead links show up in GA4 (event: page_not_found). */
export function TrackNotFound() {
  useEffect(() => {
    track({
      name: "custom",
      eventName: "page_not_found",
      params: {
        page_path: window.location.pathname,
        page_referrer: document.referrer || undefined,
      },
    });
  }, []);
  return null;
}
