import { AlertTriangleIcon, InfoIcon, LightbulbIcon } from "lucide-react";
import Link from "next/link";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity";
import { Image } from "next-sanity/image";
import type { ReactNode } from "react";
import { headingsOf } from "@/lib/blog/format";
import type { BodyCallout, BodyFigure, PostBody } from "@/lib/blog/types";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Renders the article body as semantic HTML: h2–h4 with anchor ids (matching the table of
 * contents), lists, quotes, <figure>/<figcaption> images, and callouts as <aside role="note">.
 * Internal links use next/link; external links open safely in a new tab.
 */

const CALLOUT = {
  tip: {
    icon: LightbulbIcon,
    label: "Tip",
    cls: "border-gold/50 bg-gold/10 text-brand-dark",
  },
  note: {
    icon: InfoIcon,
    label: "Note",
    cls: "border-brand/20 bg-brand/[0.04] text-brand-dark",
  },
  warning: {
    icon: AlertTriangleIcon,
    label: "Warning",
    cls: "border-amber-400/60 bg-amber-50 text-amber-950",
  },
} as const;

function isInternal(href: string) {
  if (href.startsWith("/") || href.startsWith("#")) return true;
  try {
    return new URL(href).origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

export function PortableBody({ body }: { body: PostBody }) {
  const ids = new Map(headingsOf(body).map((h) => [h.key, h.id]));
  const heading =
    (Tag: "h2" | "h3", cls: string) =>
    ({
      children,
      value,
    }: {
      children?: ReactNode;
      value: PortableTextBlock;
    }) => (
      <Tag
        id={value._key ? ids.get(value._key) : undefined}
        className={cn("scroll-mt-28 font-bold text-brand", cls)}
      >
        {children}
      </Tag>
    );

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h2: heading("h2", "mt-12 mb-4 text-2xl md:text-[1.75rem]"),
      h3: heading("h3", "mt-9 mb-3 text-xl"),
      h4: ({ children }) => (
        <h4 className="mt-7 mb-2 text-lg font-semibold text-brand">
          {children}
        </h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-8 border-l-4 border-gold pl-5 text-lg text-foreground/80 italic">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="my-5 list-disc space-y-2 pl-6 marker:text-gold-dark">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="my-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-brand">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),
      code: ({ children }) => (
        <code className="rounded bg-brand/[0.07] px-1.5 py-0.5 font-mono text-[0.9em] text-brand">
          {children}
        </code>
      ),
      link: ({ value, children }) => {
        const href = String(value?.href ?? "");
        if (!href) return <>{children}</>;
        const cls =
          "font-medium text-brand underline decoration-gold/70 decoration-2 underline-offset-4 hover:decoration-brand";
        if (isInternal(href)) {
          const path = href.startsWith("http")
            ? new URL(href).pathname + new URL(href).hash
            : href;
          return (
            <Link href={path} className={cls}>
              {children}
            </Link>
          );
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
          >
            {children}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      },
    },
    types: {
      figure: ({ value }: { value: BodyFigure }) =>
        value.url ? (
          <figure className="my-10">
            <Image
              src={value.url}
              alt={value.alt}
              width={value.width}
              height={value.height}
              sizes="(min-width: 1024px) 760px, 100vw"
              placeholder={value.lqip ? "blur" : "empty"}
              blurDataURL={value.lqip ?? undefined}
              className="h-auto w-full rounded-2xl"
            />
            {value.caption ? (
              <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                {value.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null,
      callout: ({ value }: { value: BodyCallout }) => {
        const c = CALLOUT[value.tone] ?? CALLOUT.note;
        const Icon = c.icon;
        return (
          <aside
            role="note"
            aria-label={c.label}
            className={cn("my-8 flex gap-3 rounded-2xl border p-5", c.cls)}
          >
            <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p className="!my-0 leading-relaxed">
              <strong className="font-semibold">{c.label}: </strong>
              {value.text}
            </p>
          </aside>
        );
      },
    },
  };

  return (
    <div className="text-[1.0625rem] leading-[1.8] text-foreground/85 [&_li>p]:my-0 [&>p]:my-5">
      <PortableText
        value={body as PortableTextBlock[]}
        components={components}
      />
    </div>
  );
}
