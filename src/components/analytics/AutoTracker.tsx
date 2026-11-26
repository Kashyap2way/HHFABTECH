"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useRef } from "react";
import { analyticsConfig } from "@/lib/analytics/config";
import { setPageContext, track } from "@/lib/analytics/events";
import { pageContext } from "@/lib/analytics/page-type";

/**
 * Site-wide behaviour analytics, so every page gets detailed data with no per-component code:
 *
 *  page_view        every route (incl. client navigation), with page_type + content_group
 *  ui_click         every link / button click: text, URL, link type, page section
 *  contact_click    tel: / mailto: / WhatsApp links not already tracked explicitly
 *  file_download    links to PDFs, images, DWG, ZIP …
 *  scroll_depth     25 / 50 / 75 / 90 % of each page
 *  section_view     each <section aria-labelledby> seen (≥ 40 % visible), once per page
 *  page_engagement  visible time + max scroll when leaving a page (sendBeacon)
 *  form_abandon     a form was started but not submitted before leaving
 *  web_vitals       LCP, INP, CLS, FCP, TTFB per page
 *  js_error         uncaught errors (throttled), as GA4 `exception`
 *
 * Elements can opt out with data-track="off" or add a label with data-track-label="…".
 */

const DOWNLOAD_RE = /\.(pdf|docx?|xlsx?|csv|zip|dwg|jpe?g|png|webp)(\?|#|$)/i;
const SCROLL_MARKS = [25, 50, 75, 90] as const;

const clean = (s: string | null | undefined, max = 100) =>
  (s ?? "").replace(/\s+/g, " ").trim().slice(0, max) || undefined;

/** Human name of the section an element is in: its heading text, else its id. */
function sectionOf(el: Element): string | undefined {
  const section = el.closest(
    "section, header, footer, nav, aside, form, [data-section]",
  );
  if (!section) return undefined;
  const named = section.getAttribute("data-section");
  if (named) return named;
  if (section.tagName === "HEADER") return "header";
  if (section.tagName === "FOOTER") return "footer";
  if (section.tagName === "NAV")
    return clean(section.getAttribute("aria-label"), 60) ?? "nav";
  if (section.tagName === "FORM")
    return `form:${section.getAttribute("name") ?? "form"}`;
  const labelledBy = section.getAttribute("aria-labelledby");
  const heading = labelledBy ? document.getElementById(labelledBy) : null;
  return (
    clean(heading?.textContent, 60) ??
    clean(section.getAttribute("aria-label"), 60) ??
    (section.id || undefined)
  );
}

type LinkType =
  | "internal"
  | "anchor"
  | "outbound"
  | "phone"
  | "email"
  | "whatsapp"
  | "download";

function linkType(a: HTMLAnchorElement): LinkType {
  const href = a.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  if (/wa\.me|whatsapp\.com/.test(a.href)) return "whatsapp";
  if (a.hasAttribute("download") || DOWNLOAD_RE.test(a.pathname))
    return "download";
  if (href.startsWith("#")) return "anchor";
  try {
    return new URL(a.href).origin === window.location.origin
      ? a.pathname === window.location.pathname && a.hash
        ? "anchor"
        : "internal"
      : "outbound";
  } catch {
    return "internal";
  }
}

export function AutoTracker() {
  const pathname = usePathname();
  const ctxRef = useRef(pageContext(pathname));
  const reportedVitals = useRef(new Set<string>());

  useReportWebVitals((metric) => {
    // The callback can be re-registered on navigation; report each metric once.
    if (reportedVitals.current.has(metric.id)) return;
    reportedVitals.current.add(metric.id);
    track({
      name: "behavior",
      eventName: "web_vitals",
      params: {
        metric_name: metric.name,
        // GA expects integers; CLS is scaled ×1000 as Google recommends.
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value,
        ),
        metric_rating: metric.rating,
        metric_id: metric.id,
        page_type: ctxRef.current.page_type,
      },
      beacon: true,
    });
  });

  // ---- page view + per-page observers (scroll, sections, engagement, forms) ----
  useEffect(() => {
    if (!analyticsConfig.enabled) return;
    const ctx = pageContext(pathname);
    ctxRef.current = ctx;
    setPageContext(ctx);
    track({
      name: "behavior",
      eventName: "page_view",
      params: {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title,
        page_referrer: document.referrer || undefined,
      },
    });

    // Scroll depth
    const reached = new Set<number>();
    let maxScroll = 0;
    const pageStart = performance.now();
    const onScroll = () => {
      // Skip the router's scroll reset just after navigation.
      if (performance.now() - pageStart < 600) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct =
        scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      maxScroll = Math.max(maxScroll, Math.min(100, pct));
      for (const m of SCROLL_MARKS) {
        if (maxScroll >= m && !reached.has(m)) {
          reached.add(m);
          track({
            name: "behavior",
            eventName: "scroll_depth",
            params: { percent_scrolled: m, page_type: ctx.page_type },
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Section views (wait a tick so streamed sections are in the DOM)
    const seen = new Set<Element>();
    let io: IntersectionObserver | null = null;
    const observeSections = () => {
      if (typeof IntersectionObserver === "undefined") return;
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting || seen.has(e.target)) continue;
            seen.add(e.target);
            io?.unobserve(e.target);
            track({
              name: "behavior",
              eventName: "section_view",
              params: {
                section_name: sectionOf(e.target) ?? e.target.id,
                section_index: [
                  ...document.querySelectorAll("main section[aria-labelledby]"),
                ].indexOf(e.target),
                page_type: ctx.page_type,
              },
            });
          }
        },
        { threshold: 0.4 },
      );
      for (const s of document.querySelectorAll(
        "main section[aria-labelledby], main [data-section]",
      ))
        if (!seen.has(s)) io.observe(s);
    };
    const sectionTimer = window.setTimeout(observeSections, 400);
    const mo = new MutationObserver(() => observeSections());
    const main = document.getElementById("main");
    if (main) mo.observe(main, { childList: true, subtree: false });

    // Visible (engaged) time on this page
    let visibleSince =
      document.visibilityState === "visible" ? performance.now() : null;
    let engagedMs = 0;
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        visibleSince = performance.now();
      } else if (visibleSince !== null) {
        engagedMs += performance.now() - visibleSince;
        visibleSince = null;
        flush("hidden");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Forms started but never submitted
    const started = new Map<string, string>();
    const submitted = new Set<string>();
    const onFocusIn = (e: FocusEvent) => {
      const field = e.target as HTMLElement | null;
      const form = field?.closest("form");
      const name = form?.getAttribute("name");
      if (!name || submitted.has(name)) return;
      started.set(name, field?.getAttribute("name") ?? "");
    };
    const onSubmit = (e: SubmitEvent) => {
      const name = (e.target as HTMLFormElement).getAttribute("name");
      if (name) submitted.add(name);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("submit", onSubmit, true);

    const flush = (reason: "hidden" | "navigate") => {
      const total =
        engagedMs +
        (visibleSince !== null ? performance.now() - visibleSince : 0);
      if (total < 1000 && reason === "hidden") return;
      track({
        name: "behavior",
        eventName: "page_engagement",
        params: {
          engaged_seconds: Math.round(total / 1000),
          max_scroll_percent: maxScroll,
          page_type: ctx.page_type,
          exit_reason: reason,
        },
        beacon: true,
      });
      for (const [form, lastField] of started) {
        if (submitted.has(form)) continue;
        track({
          name: "behavior",
          eventName: "form_abandon",
          params: {
            form_name: form,
            last_field: lastField || undefined,
            page_type: ctx.page_type,
          },
          beacon: true,
        });
      }
      started.clear();
      engagedMs = 0;
      visibleSince =
        document.visibilityState === "visible" ? performance.now() : null;
    };

    return () => {
      flush("navigate");
      window.clearTimeout(sectionTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("submit", onSubmit, true);
      io?.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // ---- clicks (one delegated listener for the whole site) ----
  useEffect(() => {
    if (!analyticsConfig.enabled) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>(
        "a[href], button, [role='button'], [role='radio'], [role='tab'], summary, [data-track-label]",
      );
      if (!el || el.closest("[data-track='off']")) return;

      const ctx = ctxRef.current;
      // Cards: use their heading rather than all the text inside the link.
      const label = clean(
        el.getAttribute("data-track-label") ??
          el.getAttribute("aria-label") ??
          el.querySelector("h2, h3, h4")?.textContent ??
          el.textContent ??
          el.getAttribute("title"),
      );
      const base = {
        link_text: label,
        element: el.tagName.toLowerCase(),
        section_name: sectionOf(el),
        page_type: ctx.page_type,
      };

      if (el instanceof HTMLAnchorElement) {
        const type = linkType(el);
        track({
          name: "behavior",
          eventName: "ui_click",
          params: { ...base, link_url: el.href, link_type: type },
          beacon: type === "outbound" || type === "download",
        });
        if (type === "download") {
          track({
            name: "behavior",
            eventName: "file_download",
            params: {
              file_name: el.pathname.split("/").pop(),
              link_url: el.href,
              page_type: ctx.page_type,
            },
            beacon: true,
          });
        }
        // Contact links that aren't wrapped in TrackedAnchor still count as contact intent.
        if (
          (type === "phone" || type === "email" || type === "whatsapp") &&
          !el.hasAttribute("data-tracked")
        ) {
          track({
            name: "contact_click",
            method: type === "whatsapp" ? "whatsapp" : type,
            location: base.section_name ?? ctx.page_type,
          });
        }
        return;
      }

      track({
        name: "behavior",
        eventName: "ui_click",
        params: {
          ...base,
          link_type: "button",
          control_state:
            el.getAttribute("aria-pressed") ??
            el.getAttribute("aria-checked") ??
            el.getAttribute("aria-expanded") ??
            undefined,
        },
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // ---- uncaught errors (max 5 per page load) ----
  useEffect(() => {
    if (!analyticsConfig.enabled) return;
    let count = 0;
    const report = (description: string) => {
      if (count++ >= 5) return;
      track({ name: "exception", description: description.slice(0, 150) });
    };
    const onError = (e: ErrorEvent) => report(`js_error: ${e.message}`);
    const onRejection = (e: PromiseRejectionEvent) =>
      report(`unhandled_rejection: ${String(e.reason)}`);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
