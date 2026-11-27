"use client";

import { ArrowRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import type { SceneModel } from "@/components/three/calc-scene";
import { buttonVariants } from "@/components/ui/button";
import { DeliveryCalendar } from "@/components/ui/delivery-calendar";
import { Spinner } from "@/components/ui/spinner";
import { estimateDelivery } from "@/lib/delivery";
import {
  ACCESSORIES,
  baffles,
  DENSITY,
  defaultQuote,
  loadQuote,
  MATERIALS,
  type MaterialId,
  PRODUCTS,
  type ProductId,
  price,
  type QuoteState,
  saveQuote,
  sizeTank,
  toKL,
} from "@/lib/quote/core";
import { cn } from "@/lib/utils";

/**
 * three.js is only downloaded when a valid capacity has been entered and this viewer renders,
 * so visitors who just browse the quote form never fetch any 3D code.
 */
const Truck3D = dynamic(() => import("@/components/calculator/InstantQuote3D"), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-[4/3] w-full place-items-center sm:aspect-[16/10]">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#475467]">
        <Spinner aria-hidden="true" />
        Loading 3D viewer…
      </p>
    </div>
  ),
});

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const card = "rounded-2xl border border-brand/10 bg-white p-5 shadow-sm sm:p-6";
const label = "mb-1.5 block text-xs font-semibold text-[#667085]";
const field =
  "h-11 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-base text-[#150f26] focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/30 focus-visible:outline-none";

function CardTitle({ n, children }: { n?: number; children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 text-lg font-semibold text-brand">
      {n ? (
        <b className="grid size-7 place-items-center rounded-full bg-gold text-sm text-brand-dark">
          {n}
        </b>
      ) : null}
      {children}
    </h2>
  );
}

export function QuoteBuilder() {
  const ids = useId();
  const [s, setS] = useState<QuoteState>(defaultQuote);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [msg, setMsg] = useState("");

  // Browser-only state (saved selections, the clock) is read after mount so the prerender stays static.
  useEffect(() => {
    setS(loadQuote());
    setToday(new Date());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) saveQuote(s);
  }, [s, ready]);

  const patch = (p: Partial<QuoteState>) => {
    setMsg("");
    setS((prev) => ({ ...prev, ...p }));
  };

  const density = s.density && s.density > 0 ? s.density : DENSITY[s.product];
  const capValue = Number.parseFloat(s.capacity);
  const kl = capValue > 0 ? toKL(capValue, s.unit, density) : 0;
  const litres = kl * 1000;
  const size = useMemo(() => sizeTank(litres), [litres]);
  const baf = useMemo(() => baffles(litres), [litres]);
  const pr = price({ capacityKL: kl, material: s.material, accessories: s.accessories });
  const est = today ? estimateDelivery(today, kl) : null;

  const model = useMemo<SceneModel | null>(
    () =>
      size
        ? {
            shape: "spell",
            dims: size.dims,
            depthMm: 0,
            maxDepthMm: size.H,
            valid: true,
          }
        : null,
    [size],
  );

  const productName = PRODUCTS.find((p) => p[0] === s.product)?.[1] ?? "";
  const materialName = MATERIALS.find((m) => m[0] === s.material)?.[1] ?? "";
  const money = (v: number | undefined) =>
    pr && v !== undefined ? `₹ ${inr.format(Math.round(v))}` : "₹ X";
  const dateText = est
    ? est.date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const inquiryHref = (() => {
    if (!kl) return null;
    const acc = ACCESSORIES.filter((a) => s.accessories.includes(a[0])).map(
      (a) => a[1],
    );
    const spec = [
      `Product: ${productName}`,
      `Capacity: ${num.format(kl)} KL`,
      `Material: ${materialName}`,
      size
        ? `Size: ${size.W} mm wide × ${size.H} mm high × ${Math.round(size.L)} mm long`
        : "",
      `Baffle plates: ${baf.plates}`,
      `Accessories: ${acc.join(", ") || "none"}`,
      `Estimated delivery: ${dateText} (estimate)`,
      "Source: HH FABTECH quote builder",
    ]
      .filter(Boolean)
      .join("\n");
    const q = new URLSearchParams({ cap: `${num.format(kl)} KL`, spec });
    return `/contact?${q.toString()}#inquiry`;
  })();

  const dims: [string, string][] = [
    ["Width (max 2400)", size ? `${size.W} mm` : "—"],
    ["Height (max 1830)", size ? `${size.H} mm` : "—"],
    ["Length", size ? `${inr.format(Math.round(size.L))} mm` : "—"],
    ["Dish ends", size ? `${size.dishEnds} × ${size.emboss} mm emboss` : "—"],
    ["Baffles", litres ? `${baf.plates} plates · ${baf.sections} sections` : "—"],
    ["Per section", litres ? `${inr.format(Math.round(baf.eachL))} L each` : "—"],
  ];

  return (
    <div className="grid gap-6">
      <section aria-label="3D preview" className={card}>
        <div className="relative overflow-hidden rounded-xl bg-[#f4f1fa]">
          {model ? (
            <Truck3D model={model} />
          ) : (
            <div className="grid aspect-[4/3] w-full place-items-center px-6 text-center sm:aspect-[16/10]">
              <p className="text-sm font-medium text-[#667085]">
                Enter a capacity below to see your tanker here in 3D.
              </p>
            </div>
          )}
        </div>
        {size ? (
          <p
            aria-live="polite"
            className="mt-3 text-center text-sm font-semibold text-brand"
          >
            {size.W} × {size.H} × {inr.format(Math.round(size.L))} mm
          </p>
        ) : null}
        <p className="mt-1 text-center text-[11px] text-[#667085]">
          Drag to rotate · scroll to zoom · right-drag to pan
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className={card}>
            <CardTitle n={1}>Product</CardTitle>
            <label className={label} htmlFor={`${ids}-product`}>
              Tanker type
            </label>
            <select
              id={`${ids}-product`}
              className={field}
              value={s.product}
              onChange={(e) =>
                patch({ product: e.target.value as ProductId })
              }
            >
              {PRODUCTS.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </section>

          <section className={card}>
            <CardTitle n={2}>Capacity</CardTitle>
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <div>
                <label className={label} htmlFor={`${ids}-cap`}>
                  Required capacity
                </label>
                <input
                  id={`${ids}-cap`}
                  className={field}
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 20"
                  value={s.capacity}
                  onChange={(e) =>
                    patch({ capacity: e.target.value.replace(/[^0-9.]/g, "") })
                  }
                />
              </div>
              <fieldset className="m-0 border-0 p-0">
                <legend className={label}>Unit</legend>
                <div className="flex h-11 overflow-hidden rounded-lg border border-[#d0d5dd]">
                  {(["KL", "TON"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      aria-pressed={s.unit === u}
                      onClick={() => patch({ unit: u })}
                      className={cn(
                        "cursor-pointer px-4 text-sm font-semibold transition-colors",
                        s.unit === u
                          ? "bg-brand text-white"
                          : "bg-white text-[#344054] hover:bg-[#f4f1fa]",
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            {s.unit === "TON" ? (
              <div className="mt-3">
                <label className={label} htmlFor={`${ids}-density`}>
                  Liquid density (tonnes per KL)
                </label>
                <input
                  id={`${ids}-density`}
                  className={field}
                  type="text"
                  inputMode="decimal"
                  placeholder={`default ${DENSITY[s.product]} t/KL`}
                  value={s.density ?? ""}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    patch({ density: v > 0 ? v : null });
                  }}
                />
              </div>
            ) : null}
            <Link
              href="/calculator"
              className="mt-4 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              I don't know the capacity. Calculate now →
            </Link>
            {kl > 0 && !size ? (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                This capacity is too small for the standard cross-section. Use
                the calculator for a custom size.
              </p>
            ) : null}
          </section>

          <section className={card}>
            <CardTitle n={3}>Material</CardTitle>
            <div
              role="radiogroup"
              aria-label="Material"
              className="flex flex-wrap gap-2"
            >
              {MATERIALS.map(([id, name]) => (
                <label
                  key={id}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-gold/40",
                    s.material === id
                      ? "border-brand bg-brand text-white"
                      : "border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f4f1fa]",
                  )}
                >
                  <input
                    type="radio"
                    name={`${ids}-material`}
                    value={id}
                    checked={s.material === id}
                    onChange={() => patch({ material: id as MaterialId })}
                    className="sr-only"
                  />
                  {name}
                </label>
              ))}
            </div>
          </section>

          <section className={card}>
            <CardTitle n={4}>Accessories</CardTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              {ACCESSORIES.map(([id, name]) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#e6e8ec] p-3 text-sm text-[#344054] hover:bg-[#faf9fd]"
                >
                  <input
                    type="checkbox"
                    checked={s.accessories.includes(id)}
                    onChange={(e) =>
                      patch({
                        accessories: e.target.checked
                          ? [...s.accessories, id]
                          : s.accessories.filter((x) => x !== id),
                      })
                    }
                    className="mt-0.5 size-4 accent-[#43236f]"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={card}>
            <CardTitle n={5}>Size and construction (auto-calculated)</CardTitle>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dims.map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg bg-[#f8f7fb] p-3 text-sm"
                >
                  <dt className="text-[11px] font-semibold text-[#667085]">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-[#150f26]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-[#667085]">
              Uses the same Spell profile, dish-end and baffle rules as the
              calculator. Estimate for quoting only.
            </p>
          </section>
        </div>

        <aside className="grid gap-6 lg:sticky lg:top-24">
          <section className={card}>
            <CardTitle>Your quote</CardTitle>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-[#667085]">Product</dt>
              <dd className="text-right font-medium">{productName}</dd>
              <dt className="text-[#667085]">Capacity</dt>
              <dd className="text-right font-medium">
                {kl ? `${num.format(kl)} KL` : "—"}
              </dd>
              <dt className="text-[#667085]">Material</dt>
              <dd className="text-right font-medium">{materialName}</dd>
              <dt className="text-[#667085]">Accessories</dt>
              <dd className="text-right font-medium">
                {s.accessories.length} of {ACCESSORIES.length} selected
              </dd>
              <dt className="text-[#667085]">Subtotal</dt>
              <dd className="text-right font-medium">{money(pr?.subtotal)}</dd>
              <dt className="text-[#667085]">GST 18%</dt>
              <dd className="text-right font-medium">{money(pr?.gst)}</dd>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-[#e6e8ec] pt-4">
              <span className="font-semibold">Grand total</span>
              <strong className="text-2xl text-brand">{money(pr?.total)}</strong>
            </div>
            <p className="mt-2 text-[11px] text-[#667085]">
              {pr
                ? "Indicative price. Final quote is confirmed by HH FABTECH."
                : "Pricing is confirmed by HH FABTECH. Send this as an inquiry and we will reply with a quote."}
            </p>
          </section>

          <section className={card}>
            <CardTitle>Estimated delivery</CardTitle>
            <strong className="text-lg">{dateText}</strong>
            <p className="mt-1 mb-4 text-xs text-[#667085]">
              {est
                ? `${est.workingDays} working days${est.peak ? " (includes peak-season allowance)" : ""}. Estimate only.`
                : ""}
            </p>
            {est ? <DeliveryCalendar deliveryDate={est.date} /> : null}
          </section>

          <div className="grid gap-2">
            {inquiryHref ? (
              <TrackedLink
                href={inquiryHref}
                event={{
                  name: "cta_click",
                  label: "Send quote as inquiry",
                  location: "quote_builder",
                  product: productName,
                }}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full rounded-full bg-gold px-6 text-base font-bold text-brand-dark hover:bg-gold-light",
                )}
              >
                Send this quote as inquiry
                <ArrowRightIcon aria-hidden="true" />
              </TrackedLink>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setMsg(
                    "Please enter the tank capacity first, or use “Calculate now”.",
                  )
                }
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full cursor-pointer rounded-full bg-gold px-6 text-base font-bold text-brand-dark hover:bg-gold-light",
                )}
              >
                Send this quote as inquiry
                <ArrowRightIcon aria-hidden="true" />
              </button>
            )}
            {msg ? (
              <p role="alert" className="text-center text-sm font-medium text-red-700">
                {msg}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
