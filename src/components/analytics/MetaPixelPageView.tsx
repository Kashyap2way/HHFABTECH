"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sends a Meta Pixel PageView on the first load and on every client-side route
 * change. The base snippet only calls `fbq('init')`, so there is no duplicate.
 */
export function MetaPixelPageView() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value read inside the effect
  useEffect(() => {
    // The pixel script loads afterInteractive; fbq queues calls until it is ready.
    const send = () => window.fbq?.("track", "PageView");
    if (window.fbq) {
      send();
      return;
    }
    // fbq is defined by the inline base code a moment after hydration.
    const id = window.setInterval(() => {
      if (window.fbq) {
        window.clearInterval(id);
        send();
      }
    }, 100);
    const stop = window.setTimeout(() => window.clearInterval(id), 5000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [pathname]);

  return null;
}
