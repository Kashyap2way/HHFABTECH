"use client";

import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { fmt, LENGTH_UNITS } from "@/lib/calculator/units";
import { cn } from "@/lib/utils";
import {
  BafflePanel,
  DetailsPanel,
  SheetPanel,
  SolvePanel,
  useBaffles,
} from "./AdvancedPanels";
import { DimensionField } from "./DimensionField";
import { FillControls } from "./FillControls";
import { Preview } from "./Preview3D";
import { ResultsPanel } from "./ResultsPanel";
import { ShapePicker } from "./ShapePicker";
import { useCalculator } from "./useCalculator";
import { VerticalWeightPanel } from "./VerticalWeightPanel";
import { WeightPanel } from "./WeightPanel";

const Step = ({ n, children }: { n: string; children: ReactNode }) => (
  <p className="mb-[5px] text-[11px] font-extrabold tracking-[0.15em] text-gold-dark uppercase">
    {n} / {children}
  </p>
);

function Panel({
  value,
  title,
  subtitle,
  children,
}: {
  value: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-2xl border border-[#e7e9ed] bg-[#fafbfc] px-4 not-last:mb-3 data-[open]:bg-white sm:px-5"
    >
      <AccordionTrigger className="py-4 text-left hover:no-underline">
        <span>
          <span className="block text-[15px] font-semibold text-[#150f26]">
            {title}
          </span>
          <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-6">{children}</AccordionContent>
    </AccordionItem>
  );
}

export function Calculator() {
  const calc = useCalculator();
  const { meta, shape, fields, errors, result } = calc;
  const baffle = useBaffles(result?.capacityL ?? 0);

  // Contact-form prefill (the form reads ?cap= and ?spec=).
  const inquiry = (() => {
    if (!result) return "/contact#inquiry";
    const dims = [
      ...meta.fields,
      ...(meta.option && calc.optionOn ? [meta.option.field] : []),
    ]
      .map((f) => `${f.label}: ${fmt(calc.input.dims[f.key], 0)} mm`)
      .join("\n");
    const spec = [
      `Product: ${meta.name} (from the tank volume calculator)`,
      dims,
      `Capacity: ${fmt(result.capacityL, 0)} L (${fmt(result.capacityL / 1000, 2)} KL)`,
      `Fill: ${fmt(result.fillPercent, 1)}% (${fmt(result.filledL, 0)} L)`,
    ].join("\n");
    const q = new URLSearchParams({
      cap: `${fmt(result.capacityL / 1000, 2)} KL`,
      spec,
    });
    return `/contact?${q.toString()}#inquiry`;
  })();

  const showError = (key: string) =>
    fields[key] && fields[key].value.trim() === "" ? undefined : errors[key];

  return (
    <div className="bg-[#f6f7fa] pb-16 md:pb-24">
      <Container className="relative z-[2] -mt-8 md:-mt-10">
        <div className="overflow-hidden rounded-3xl border border-[#111827]/[0.08] bg-white/[0.97] shadow-[0_24px_70px_rgb(16_24_40/0.12)]">
          <section
            aria-labelledby="shape-title"
            className="border-b border-[#eaecf0] p-5 sm:p-[30px]"
          >
            <div className="mb-[22px]">
              <Step n="01">Select profile</Step>
              <h2
                id="shape-title"
                className="text-2xl leading-tight font-bold text-[#150f26]"
              >
                Choose your tank shape
              </h2>
              <p className="mt-[7px] text-[13px] text-[#667085]">
                The calculation model changes automatically with the selected
                shape.
              </p>
            </div>
            <ShapePicker value={shape} onChange={calc.setShape} />
          </section>

          <section
            aria-labelledby="workspace-title"
            className="grid lg:min-h-[560px] lg:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.92fr)]"
          >
            <div className="border-b border-[#eaecf0] bg-[radial-gradient(circle_at_50%_35%,rgb(255_255_255/0.98),rgb(246_248_251/0.94))] p-5 sm:p-[34px] lg:border-r lg:border-b-0">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                <Preview model={calc.preview} shapeName={`${meta.name}`} />
              </div>
            </div>

            <div className="bg-white p-5 sm:p-[34px]">
              <Step n="02">Enter dimensions</Step>
              <h2
                id="workspace-title"
                className="text-xl font-bold text-[#150f26]"
              >
                {meta.name}
              </h2>
              <p className="mt-[7px] mb-6 text-[13px] leading-relaxed text-[#667085]">
                {meta.description} Use internal dimensions; sums such as 2400/2
                are accepted.
              </p>
              <div className="grid gap-[18px]">
                {meta.fields.map((f) => (
                  <DimensionField
                    key={f.key}
                    label={f.label}
                    symbol={f.symbol}
                    hint={f.hint}
                    error={showError(f.key)}
                    placeholder={`e.g. ${f.defaultMm}`}
                    value={fields[f.key].value}
                    unit={fields[f.key].unit}
                    units={LENGTH_UNITS}
                    onValueChange={(value) => calc.setValue(f.key, { value })}
                    onUnitChange={(unit) => calc.setValue(f.key, { unit })}
                  />
                ))}

                {meta.option ? (
                  <div className="rounded-2xl border border-brand/10 bg-[#fbfaff] p-4">
                    <label
                      htmlFor="shape-option"
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        id="shape-option"
                        type="checkbox"
                        checked={calc.optionOn}
                        onChange={(e) => calc.toggleOption(e.target.checked)}
                        className="mt-1 size-4 shrink-0 accent-[var(--color-brand)]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-brand">
                          {meta.option.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {meta.option.description}
                        </span>
                      </span>
                    </label>
                    {calc.optionOn ? (
                      <DimensionField
                        className="mt-4"
                        label={meta.option.field.label}
                        symbol={meta.option.field.symbol}
                        hint={meta.option.field.hint}
                        error={errors[meta.option.key]}
                        value={fields[meta.option.key].value}
                        unit={fields[meta.option.key].unit}
                        units={LENGTH_UNITS}
                        onValueChange={(value) =>
                          calc.setValue(meta.option?.key ?? "", { value })
                        }
                        onUnitChange={(unit) =>
                          calc.setValue(meta.option?.key ?? "", { unit })
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <FillControls calc={calc} />
              </div>
              <div className="mt-6">
                <ResultsPanel calc={calc} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <TrackedLink
                  href={inquiry}
                  event={{
                    name: "cta_click",
                    label: "Inquire about this tank",
                    location: "calculator",
                    product: meta.name,
                  }}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-full bg-gold px-6 text-base font-semibold text-brand-dark hover:bg-gold-light",
                  )}
                >
                  Inquire about this tank
                  <ArrowRightIcon aria-hidden="true" />
                </TrackedLink>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={calc.reset}
                  className="h-12 rounded-full px-5 text-brand"
                >
                  <RotateCcwIcon aria-hidden="true" />
                  Reset
                </Button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Results are geometric volumes from the dimensions you enter.
                Shell thickness, fittings, ullage and manufacturing tolerances
                are not included.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="advanced-title"
            className="border-t border-[#eaecf0] bg-[#fcfcfd] p-5 sm:p-[30px]"
          >
            <div className="mb-[22px]">
              <Step n="04">Advanced options</Step>
              <h2
                id="advanced-title"
                className="text-2xl leading-tight font-bold text-[#150f26]"
              >
                Geometry, sizing and fabrication estimates
              </h2>
              <p className="mt-[7px] text-[13px] text-[#667085]">
                Optional tools. The main calculator updates automatically.
              </p>
            </div>
            <Accordion multiple>
              {shape === "spell" ? (
                <Panel
                  value="spell"
                  title="Spell profile geometry"
                  subtitle="Edit the central rectangle and corner bend radius."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DimensionField
                      label="Rwidth"
                      symbol="Rw"
                      error={errors.Rw}
                      value={calc.spellDisplay.rw.value}
                      unit={calc.rw.unit}
                      units={LENGTH_UNITS}
                      onValueChange={(value) =>
                        calc.setRw({
                          ...calc.spellDisplay.rw,
                          value,
                          edited: true,
                        })
                      }
                      onUnitChange={(unit) =>
                        calc.setRw({ ...calc.spellDisplay.rw, unit })
                      }
                    />
                    <DimensionField
                      label="Rheight"
                      symbol="Rh"
                      error={errors.Rh}
                      value={calc.spellDisplay.rh.value}
                      unit={calc.rh.unit}
                      units={LENGTH_UNITS}
                      onValueChange={(value) =>
                        calc.setRh({
                          ...calc.spellDisplay.rh,
                          value,
                          edited: true,
                        })
                      }
                      onUnitChange={(unit) =>
                        calc.setRh({ ...calc.spellDisplay.rh, unit })
                      }
                    />
                    <DimensionField
                      label="Corner bend radius"
                      symbol="r"
                      hint="Default 70 mm (half of the 140 mm roll-bend machine)."
                      error={errors.bend}
                      value={calc.bend.value}
                      unit={calc.bend.unit}
                      units={LENGTH_UNITS}
                      onValueChange={(value) =>
                        calc.setBend({ ...calc.bend, value })
                      }
                      onUnitChange={(unit) =>
                        calc.setBend({ ...calc.bend, unit })
                      }
                    />
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Rw and Rh scale automatically with the overall width and
                    height until you type your own. Rw must not exceed the width
                    and Rh must not exceed the height.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 rounded-full"
                    onClick={() => {
                      calc.setRw({
                        value: "",
                        unit: calc.rw.unit,
                        edited: false,
                      });
                      calc.setRh({
                        value: "",
                        unit: calc.rh.unit,
                        edited: false,
                      });
                    }}
                  >
                    Reset to automatic
                  </Button>
                </Panel>
              ) : null}
              <Panel
                value="solve"
                title="Calculate a dimension from a known volume"
                subtitle="Enter a target capacity and solve for one dimension."
              >
                <SolvePanel calc={calc} />
              </Panel>
              {meta.horizontal ? (
                <Panel
                  value="baffles"
                  title="Baffle plate / compartment estimate"
                  subtitle="Sections, plates and size of each compartment."
                >
                  <BafflePanel b={baffle} />
                </Panel>
              ) : null}
              {meta.hasProfile ? (
                <Panel
                  value="sheet"
                  title="Sheet length and corner marking"
                  subtitle="Developed length for roll bending."
                >
                  <SheetPanel calc={calc} />
                </Panel>
              ) : null}
              {meta.hasProfile ? (
                <Panel
                  value="weight"
                  title="Material and estimated fabrication weight"
                  subtitle="Password protected steel weight estimate."
                >
                  <WeightPanel calc={calc} baffle={baffle} />
                </Panel>
              ) : null}
              {shape === "verticalCylinder" ? (
                <Panel
                  value="vertical-weight"
                  title="Steel weight estimate (vertical tank)"
                  subtitle="Plate courses, bottom and roof, with operating weight."
                >
                  <VerticalWeightPanel calc={calc} />
                </Panel>
              ) : null}
              <Panel
                value="details"
                title="Calculation details"
                subtitle="Formulas and the values from your inputs."
              >
                <DetailsPanel calc={calc} />
              </Panel>
            </Accordion>
          </section>
        </div>
      </Container>
    </div>
  );
}
