"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  /** Event to send when the link is clicked. */
  event: AnalyticsEvent;
};

/** next/link that reports an analytics event on click. Use for internal CTAs. */
export function TrackedLink({ event, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      data-tracked=""
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}

type TrackedAnchorProps = Omit<ComponentProps<"a">, "href" | "children"> & {
  href: string;
  children: ReactNode;
  event: AnalyticsEvent;
};

/** Plain <a> (tel:, mailto:, external URLs) that reports an analytics event on click. */
export function TrackedAnchor({
  event,
  onClick,
  href,
  children,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      href={href}
      data-tracked=""
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
