"use client";

import { CheckIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const btn =
  "inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand/15 bg-white text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/** Share links (no third-party scripts). Each click is a GA4 `share` event. */
export function ShareButtons({
  url,
  title,
  slug,
}: {
  url: string;
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const targets = [
    {
      method: "whatsapp",
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
      path: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z",
    },
    {
      method: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.7 4.8 6.1V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z",
    },
    {
      method: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      path: "M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H16l.5-4h-3V8.9c0-.6.3-.9.5-.9Z",
    },
    {
      method: "x",
      label: "Share on X",
      href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`,
      path: "M17.8 3H21l-7 8 8.2 10h-6.4l-5-6.2L5 21H1.8l7.5-8.6L1.5 3H8l4.6 5.7L17.8 3Zm-1.1 16.2h1.8L7.4 4.7H5.5l11.2 14.5Z",
    },
  ];

  const report = (method: string) =>
    track({ name: "share", method, contentType: "article", itemId: slug });

  return (
    <ul
      className="flex flex-wrap items-center gap-2"
      aria-label="Share this article"
    >
      {targets.map((t) => (
        <li key={t.method}>
          <a
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            title={t.label}
            data-tracked=""
            onClick={() => report(t.method)}
            className={btn}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4 fill-current"
            >
              <path d={t.path} />
            </svg>
            <span className="sr-only">{t.label}</span>
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Copy link"}
          title="Copy link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard blocked: nothing to do */
            }
            report("copy_link");
          }}
          className={cn(btn, copied && "border-emerald-500 text-emerald-600")}
        >
          {copied ? (
            <CheckIcon aria-hidden="true" className="size-4" />
          ) : (
            <LinkIcon aria-hidden="true" className="size-4" />
          )}
        </button>
      </li>
      <li aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </li>
    </ul>
  );
}
