"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { SceneModel } from "@/components/three/calc-scene";
import { track } from "@/lib/analytics/events";
import type { Dims } from "@/lib/calculator/geometry";
import {
  type CalcResult,
  calculate,
  type FillSpec,
  type TankInput,
  validate,
} from "@/lib/calculator/model";
import { SHAPE_BY_ID, type ShapeId } from "@/lib/calculator/shapes";
import {
  type AllFields,
  autoSpell,
  defaultDims,
  type FieldState,
  type FillState,
  field,
  initialFields,
  initialFill,
  initialOptions,
  parseField,
  toInputString,
} from "@/lib/calculator/state";
import {
  evalExpr,
  fromMm,
  type LengthUnit,
  LITRES_PER_UNIT,
  MM_PER_UNIT,
} from "@/lib/calculator/units";

type SpellEdit = { value: string; unit: LengthUnit; edited: boolean };

export function useCalculator() {
  const [shape, setShapeState] = useState<ShapeId>("spell");
  const [fields, setFields] = useState<AllFields>(initialFields);
  const [optionOn, setOptionOn] = useState(initialOptions);
  const [fill, setFill] = useState<FillState>(initialFill);
  const [rw, setRw] = useState<SpellEdit>({
    value: "",
    unit: "mm",
    edited: false,
  });
  const [rh, setRh] = useState<SpellEdit>({
    value: "",
    unit: "mm",
    edited: false,
  });
  const [bend, setBend] = useState<FieldState>(field(70));
  const usedRef = useRef(false);

  const meta = SHAPE_BY_ID[shape];

  /** Fire `calculator_used` once per visit, after the first real interaction. */
  const markUsed = useCallback((s: ShapeId) => {
    if (usedRef.current) return;
    usedRef.current = true;
    track({ name: "calculator_used", shape: s });
  }, []);

  const setShape = useCallback(
    (s: ShapeId) => {
      setShapeState(s);
      markUsed(s);
    },
    [markUsed],
  );

  const setValue = useCallback(
    (key: string, patch: Partial<FieldState>) => {
      setFields((prev) => ({
        ...prev,
        [shape]: { ...prev[shape], [key]: { ...prev[shape][key], ...patch } },
      }));
      markUsed(shape);
    },
    [shape, markUsed],
  );

  const analysis = useMemo(() => {
    const current = fields[shape];
    const errors: Record<string, string> = {};
    const dims: Dims = {};

    for (const f of meta.fields) {
      const p = parseField(current[f.key]);
      if (p.error) errors[f.key] = p.error;
      dims[f.key] = p.mm;
    }
    if (meta.option) {
      if (optionOn[shape]) {
        const p = parseField(current[meta.option.key]);
        if (p.error) errors[meta.option.key] = p.error;
        dims[meta.option.key] = p.mm;
      } else {
        dims[meta.option.key] = 0;
      }
    }
    if (shape === "spell") {
      const auto = autoSpell(dims.W, dims.H);
      const rwParsed = rw.edited ? parseField(rw) : { mm: auto.Rw };
      const rhParsed = rh.edited ? parseField(rh) : { mm: auto.Rh };
      const bendParsed = parseField(bend);
      if ("error" in rwParsed && rwParsed.error) errors.Rw = rwParsed.error;
      if ("error" in rhParsed && rhParsed.error) errors.Rh = rhParsed.error;
      if (bendParsed.error) errors.bend = bendParsed.error;
      dims.Rw = rwParsed.mm;
      dims.Rh = rhParsed.mm;
      dims.bend = bendParsed.mm;
    }

    const input: TankInput = { shape, dims };
    const hasParseErrors = Object.keys(errors).length > 0;
    const validation = hasParseErrors ? { ok: false, errors } : validate(input);

    let fillSpec: FillSpec | null = null;
    let fillError: string | undefined;
    if (fill.mode === "depth") {
      const n = evalExpr(fill.depth);
      if (Number.isNaN(n)) fillError = "Enter a number.";
      else if (fill.depthUnit === "percent")
        fillSpec = { mode: "depth", kind: "percent", percent: n };
      else
        fillSpec = {
          mode: "depth",
          kind: "length",
          depthMm: n * MM_PER_UNIT[fill.depthUnit],
        };
    } else {
      const n = evalExpr(fill.volume);
      if (Number.isNaN(n)) fillError = "Enter a number.";
      else
        fillSpec = {
          mode: "volume",
          litres: n * LITRES_PER_UNIT[fill.volumeUnit],
        };
    }

    const result: CalcResult | null =
      validation.ok && fillSpec ? calculate(input, fillSpec) : null;

    const preview: SceneModel = result
      ? {
          shape,
          dims,
          depthMm: result.depthMm,
          maxDepthMm: result.maxDepthMm,
          filledL: result.filledL,
          fillPercent: result.fillPercent,
          valid: true,
        }
      : {
          shape,
          dims: defaultDims(shape),
          depthMm: 0,
          maxDepthMm: 1,
          valid: false,
        };

    return {
      input,
      errors: validation.errors,
      ok: validation.ok,
      fillError,
      result,
      preview,
    };
  }, [fields, shape, meta, optionOn, fill, rw, rh, bend]);

  const toggleOption = useCallback(
    (on: boolean) => {
      setOptionOn((p) => ({ ...p, [shape]: on }));
      markUsed(shape);
    },
    [shape, markUsed],
  );

  const updateFill = useCallback(
    (patch: Partial<FillState>) => {
      setFill((p) => ({ ...p, ...patch }));
      markUsed(shape);
    },
    [shape, markUsed],
  );

  /** Write an mm value into a field, converted to that field's current unit. */
  const applyDimension = useCallback(
    (key: string, mm: number) => {
      setFields((prev) => {
        const cur = prev[shape][key];
        return {
          ...prev,
          [shape]: {
            ...prev[shape],
            [key]: { ...cur, value: toInputString(fromMm(mm, cur.unit)) },
          },
        };
      });
    },
    [shape],
  );

  const reset = useCallback(() => {
    setFields(initialFields());
    setOptionOn(initialOptions());
    setFill(initialFill());
    setRw({ value: "", unit: "mm", edited: false });
    setRh({ value: "", unit: "mm", edited: false });
    setBend(field(70));
  }, []);

  /** Value to display in the Rw / Rh inputs (auto until the user edits). */
  const spellDisplay = useMemo(() => {
    const W = analysis.input.dims.W;
    const H = analysis.input.dims.H;
    const auto =
      Number.isFinite(W) && Number.isFinite(H)
        ? autoSpell(W, H)
        : { Rw: 0, Rh: 0 };
    return {
      rw: rw.edited
        ? rw
        : { ...rw, value: toInputString(fromMm(auto.Rw, rw.unit)) },
      rh: rh.edited
        ? rh
        : { ...rh, value: toInputString(fromMm(auto.Rh, rh.unit)) },
    };
  }, [analysis.input.dims.W, analysis.input.dims.H, rw, rh]);

  return {
    shape,
    meta,
    setShape,
    fields: fields[shape],
    setValue,
    optionOn: optionOn[shape],
    toggleOption,
    fill,
    updateFill,
    rw,
    rh,
    setRw,
    setRh,
    spellDisplay,
    bend,
    setBend,
    applyDimension,
    reset,
    markUsed,
    ...analysis,
  };
}

export type CalculatorApi = ReturnType<typeof useCalculator>;
