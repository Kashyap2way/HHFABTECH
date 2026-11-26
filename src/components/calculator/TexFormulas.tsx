"use client";

import "katex/dist/katex.min.css";
import katex from "katex";
import { useMemo } from "react";

/**
 * Typeset formulas with KaTeX. Loaded lazily (next/dynamic) from the details panel so the
 * library and its CSS are only fetched when someone opens it.
 *
 * Input is LaTeX built from constant templates and formatted numbers only, and KaTeX escapes
 * its output (trust: false), so the generated markup is safe to inject.
 */
export default function TexFormulas({
  items,
}: {
  items: ReadonlyArray<{ label: string; tex: string; numeric?: boolean }>;
}) {
  const html = useMemo(
    () =>
      items.map((it) =>
        katex.renderToString(it.tex, {
          displayMode: true,
          throwOnError: false,
          output: "htmlAndMathml",
          trust: false,
          strict: "ignore",
        }),
      ),
    [items],
  );
  return (
    <ol className="grid gap-2">
      {items.map((it, i) => (
        <li
          key={it.label}
          className="rounded-xl border border-brand/10 bg-white px-3 py-2"
        >
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {it.label}
          </p>
          <div
            className={
              it.numeric
                ? "overflow-x-auto text-[#17649b] [&_.katex-display]:my-2"
                : "overflow-x-auto text-brand [&_.katex-display]:my-2"
            }
            // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output from constant templates and numbers (trust: false)
            dangerouslySetInnerHTML={{ __html: html[i] }}
          />
        </li>
      ))}
    </ol>
  );
}
