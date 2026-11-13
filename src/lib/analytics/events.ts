"use client";

import { analyticsConfig } from "./config";
import { pageContext } from "./page-type";

/**
 * One typed entry point for every conversion / engagement event.
 * Each event is mapped to the matching GA4, Meta Pixel and LinkedIn call, so
 * components never talk to the individual tags directly.
 *
 * GA4 key events to mark in the GA admin: generate_lead, submit_application, contact.
 * Meta standard events used: Lead, SubmitApplication, Contact, ViewContent.
 */

export type LeadSource = "contact_form" | "quote_builder" | "calculator";
export type ContactMethod = "phone" | "whatsapp" | "email" | "map";

export type AnalyticsEvent =
  | { name: "generate_lead"; source: LeadSource; product?: string }
  | {
      name: "submit_application";
      position?: string;
      jobId?: string;
      department?: string;
    }
  /** Careers funnel: list viewed → job opened → form started → submitted. */
  | { name: "view_job_list"; count: number; department?: string }
  | {
      name: "view_job";
      jobId: string;
      title: string;
      department: string;
    }
  | {
      name: "select_job";
      jobId: string;
      title: string;
      list: string;
      index?: number;
    }
  | { name: "application_start"; position?: string; location?: string }
  | { name: "job_filter"; department: string; results: number }
  /** Blog: article opened, read to the end, shared. */
  | {
      name: "view_article";
      slug: string;
      title: string;
      category?: string;
      author?: string;
    }
  | { name: "article_complete"; slug: string; readingMinutes: number }
  | {
      name: "share";
      method: string;
      contentType: "article" | "job" | "product";
      itemId: string;
    }
  | { name: "contact_click"; method: ContactMethod; location: string }
  | { name: "view_product"; slug: string; product: string; category?: string }
  /** Product picked from a list (GA4 select_item). */
  | {
      name: "select_product";
      slug: string;
      product: string;
      list: string;
      index?: number;
    }
  | { name: "cta_click"; label: string; location: string; product?: string }
  | { name: "quote_started"; product: string }
  | { name: "calculator_used"; shape: string }
  /** Anything else: sent to GA4 as a normal event and to Meta as a custom event. */
  | {
      name: "custom";
      eventName: string;
      params?: Record<string, unknown>;
    }
  /**
   * Behaviour analytics (clicks, scroll depth, section views, engagement, vitals).
   * GA4 only: ad pixels get conversions, not every interaction.
   */
  | {
      name: "behavior";
      eventName: string;
      params?: Record<string, unknown>;
      /** Use sendBeacon so the hit survives the page being closed. */
      beacon?: boolean;
    }
  /** Handled errors / failed submissions, reported to GA4 `exception`. */
  | { name: "exception"; description: string; fatal?: boolean };

const newEventId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * GA4 loads afterInteractive, so hits fired during hydration (first page_view, context)
 * wait here until `gtag` (and its `config`) exist, then go out in order.
 */
const gaQueue: Array<[string, ...unknown[]]> = [];
let gaTimer: number | undefined;
function gtagCall(command: "event" | "set", ...args: unknown[]) {
  if (window.gtag) {
    window.gtag(command, ...args);
    return;
  }
  gaQueue.push([command, ...args]);
  if (gaTimer !== undefined) return;
  const started = Date.now();
  gaTimer = window.setInterval(() => {
    if (window.gtag || Date.now() - started > 10000) {
      window.clearInterval(gaTimer);
      gaTimer = undefined;
      const gtag = window.gtag;
      for (const [cmd, ...rest] of gaQueue.splice(0))
        gtag?.(cmd as "event", ...rest);
    }
  }, 100);
}

/** Every GA4 event carries the page group of the URL it fired on (never a stale one). */
function ga(name: string, params: Record<string, unknown>) {
  const { page_type, content_group } = pageContext(window.location.pathname);
  gtagCall("event", name, { page_type, content_group, ...params });
}

function meta(
  kind: "track" | "trackCustom",
  name: string,
  params: Record<string, unknown>,
  eventID: string,
) {
  window.fbq?.(kind, name, params, { eventID });
}

function linkedin(conversionId: number | undefined) {
  if (conversionId !== undefined) {
    window.lintrk?.("track", { conversion_id: conversionId });
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || !analyticsConfig.enabled) return;
  if (analyticsConfig.debug) console.debug("[analytics]", event);

  const eventID = newEventId();
  const { linkedinConversions: li } = analyticsConfig;

  switch (event.name) {
    case "generate_lead":
      ga("generate_lead", {
        lead_source: event.source,
        product: event.product,
      });
      meta(
        "track",
        "Lead",
        { content_name: event.product, lead_source: event.source },
        eventID,
      );
      linkedin(li.lead);
      break;

    case "submit_application":
      ga("submit_application", {
        job_position: event.position,
        job_id: event.jobId,
        department: event.department,
      });
      meta(
        "track",
        "SubmitApplication",
        { content_name: event.position, content_category: event.department },
        eventID,
      );
      linkedin(li.application);
      break;
    case "view_job_list":
      ga("view_item_list", {
        item_list_id: "careers",
        item_list_name: "Open positions",
        job_count: event.count,
        department: event.department,
      });
      break;
    case "view_job":
      ga("view_item", {
        item_list_id: "careers",
        items: [
          {
            item_id: event.jobId,
            item_name: event.title,
            item_category: "Jobs",
            item_category2: event.department,
          },
        ],
      });
      meta(
        "track",
        "ViewContent",
        {
          content_type: "job",
          content_ids: [event.jobId],
          content_name: event.title,
          content_category: event.department,
        },
        eventID,
      );
      break;
    case "select_job":
      ga("select_item", {
        item_list_id: event.list,
        item_list_name: event.list,
        items: [
          {
            item_id: event.jobId,
            item_name: event.title,
            item_category: "Jobs",
            index: event.index,
          },
        ],
      });
      break;
    case "application_start":
      ga("form_start", {
        form_name: "career",
        job_position: event.position,
        form_location: event.location,
      });
      meta(
        "trackCustom",
        "ApplicationStarted",
        { content_name: event.position },
        eventID,
      );
      break;
    case "job_filter":
      ga("job_filter", {
        department: event.department,
        results: event.results,
      });
      break;

    case "contact_click":
      ga("contact", { method: event.method, location: event.location });
      meta("track", "Contact", { method: event.method }, eventID);
      // Map clicks are navigation, not a contact intent worth a LinkedIn conversion.
      if (event.method !== "map") linkedin(li.contact);
      break;

    case "view_product":
      ga("view_item", {
        items: [
          {
            item_id: event.slug,
            item_name: event.product,
            item_category: event.category ?? "Tankers",
          },
        ],
      });
      meta(
        "track",
        "ViewContent",
        {
          content_type: "product",
          content_ids: [event.slug],
          content_name: event.product,
        },
        eventID,
      );
      break;

    case "select_product":
      ga("select_item", {
        item_list_id: event.list,
        item_list_name: event.list,
        items: [
          {
            item_id: event.slug,
            item_name: event.product,
            item_list_name: event.list,
            index: event.index,
          },
        ],
      });
      break;

    case "cta_click":
      ga("cta_click", {
        cta_label: event.label,
        location: event.location,
        product: event.product,
      });
      break;

    case "quote_started":
      ga("quote_started", { product: event.product });
      meta(
        "trackCustom",
        "QuoteStarted",
        { content_name: event.product },
        eventID,
      );
      break;

    case "custom":
      ga(event.eventName, event.params ?? {});
      meta("trackCustom", event.eventName, event.params ?? {}, eventID);
      break;

    case "behavior":
      ga(event.eventName, {
        ...event.params,
        ...(event.beacon ? { transport_type: "beacon" } : {}),
      });
      break;
    case "view_article":
      ga("view_article", {
        article_slug: event.slug,
        article_title: event.title,
        article_category: event.category,
        article_author: event.author,
      });
      meta(
        "track",
        "ViewContent",
        {
          content_type: "article",
          content_ids: [event.slug],
          content_name: event.title,
          content_category: event.category,
        },
        eventID,
      );
      break;
    case "article_complete":
      ga("article_complete", {
        article_slug: event.slug,
        reading_minutes: event.readingMinutes,
      });
      break;
    case "share":
      // GA4 recommended event
      ga("share", {
        method: event.method,
        content_type: event.contentType,
        item_id: event.itemId,
      });
      break;
    case "exception":
      ga("exception", {
        description: event.description,
        fatal: event.fatal ?? false,
      });
      break;

    case "calculator_used":
      ga("calculator_used", { shape: event.shape });
      meta("trackCustom", "CalculatorUsed", { shape: event.shape }, eventID);
      break;
  }
}

/**
 * Page-level context sent with every following GA4 hit (incl. page_view).
 * `content_group` is a built-in GA4 dimension, so "views per page type" works with no setup.
 */
export function setPageContext(ctx: {
  page_type: string;
  content_group: string;
  page_slug?: string;
}): void {
  if (typeof window === "undefined" || !analyticsConfig.enabled) return;
  gtagCall("set", ctx);
  if (analyticsConfig.debug) console.debug("[analytics] context", ctx);
}
