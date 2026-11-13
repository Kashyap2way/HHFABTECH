"use client";

import { useEffect, useRef, useState } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

/**
 * Reading progress bar (decorative) + article analytics:
 *  view_article on mount, article_complete when the end of the body scrolls into view.
 */
export function ArticleTracking({
  view,
  readingMinutes,
}: {
  view: Extract<AnalyticsEvent, { name: "view_article" }>;
  readingMinutes: number;
}) {
  const [progress, setProgress] = useState(0);
  const done = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fire once per article
  useEffect(() => {
    track(view);
    done.current = false;
    const body = document.getElementById("article-body");
    const end = document.getElementById("article-end");
    const onScroll = () => {
      if (!body) return;
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(total <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io =
      end && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            if (e?.isIntersecting && !done.current) {
              done.current = true;
              track({
                name: "article_complete",
                slug: view.slug,
                readingMinutes,
              });
            }
          })
        : null;
    if (end) io?.observe(end);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [view.slug]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-[var(--header-h)] z-40 h-1 origin-left bg-gradient-to-r from-gold to-gold-dark motion-reduce:hidden"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
