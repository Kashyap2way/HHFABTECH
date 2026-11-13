"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";

/** Stores UTM params / click IDs from the landing URL for later lead submissions. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
