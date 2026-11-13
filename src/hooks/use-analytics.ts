"use client";

import { useMemo } from "react";
import {
  type AnalyticsEvent,
  type ContactMethod,
  type LeadSource,
  track,
} from "@/lib/analytics/events";

/**
 * Reusable analytics API for any client component.
 *
 *   const analytics = useAnalytics();
 *   analytics.lead("contact_form", "Water Tanker");
 *   analytics.track({ name: "custom", eventName: "brochure_download" });
 *
 * The returned object is stable between renders, so it is safe in dependency arrays.
 */
export function useAnalytics() {
  return useMemo(
    () => ({
      /** Send any typed event. */
      track: (event: AnalyticsEvent) => track(event),
      /** Conversion: a lead was generated. */
      lead: (source: LeadSource, product?: string) =>
        track({ name: "generate_lead", source, product }),
      /** Conversion: a job application was submitted. */
      application: (position?: string) =>
        track({ name: "submit_application", position }),
      /** Click on phone / WhatsApp / email / map. */
      contact: (method: ContactMethod, location: string) =>
        track({ name: "contact_click", method, location }),
      /** Generic CTA click. */
      cta: (label: string, location: string, product?: string) =>
        track({ name: "cta_click", label, location, product }),
      /** Free-form event for anything not covered above. */
      custom: (eventName: string, params?: Record<string, unknown>) =>
        track({ name: "custom", eventName, params }),
      /** Report a handled error. */
      exception: (description: string, fatal = false) =>
        track({ name: "exception", description, fatal }),
    }),
    [],
  );
}
