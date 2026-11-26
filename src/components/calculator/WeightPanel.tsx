"use client";

import { LockIcon, LockOpenIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { track } from "@/lib/analytics/events";
import {
  evalExpr,
  fmt,
  LENGTH_UNITS,
  type LengthUnit,
  MM_PER_UNIT,
} from "@/lib/calculator/units";
import type { BaffleState } from "./AdvancedPanels";
import { Metric, profileAreaPerimeter } from "./AdvancedPanels";
import { DimensionField } from "./DimensionField";
import type { CalculatorApi } from "./useCalculator";

const MATERIALS = [
  { value: "ms", label: "MS E250 · 7,850 kg/m³" },
  { value: "ss304", label: "SS 304 · 7,930 kg/m³" },
  { value: "ss316", label: "SS 316 · 8,000 kg/m³" },
  { value: "al", label: "Aluminium · 2,700 kg/m³" },
  { value: "custom", label: "Custom density" },
] as const;

type Weights = {
  shellKg: number;
  dishKg: number;
  baffleKg: number;
  steelKg: number;
  liquidKg: number | null;
  operatingKg: number | null;
};

const selectCls =
  "w-full [&_select]:h-11 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base md:[&_select]:text-[15px]";

async function post<T>(
  url: string,
  body: unknown,
  token?: string,
): Promise<{ status: number; json: T | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  let json: T | null = null;
  try {
    json = (await res.json()) as T;
  } catch {
    // Not JSON: the endpoint is missing (e.g. local `next dev` without Netlify functions).
  }
  return { status: res.status, json };
}

/**
 * Password-gated steel weight estimate. The password check and the calculation both run in Netlify
 * functions (netlify/functions), so the formula and the password never reach the browser.
 */
export function WeightPanel({
  calc,
  baffle,
}: {
  calc: CalculatorApi;
  baffle: BaffleState;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [lockMsg, setLockMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [material, setMaterial] =
    useState<(typeof MATERIALS)[number]["value"]>("ms");
  const [density, setDensity] = useState("7850");
  const [shell, setShell] = useState("3");
  const [shellUnit, setShellUnit] = useState<LengthUnit>("mm");
  const [dish, setDish] = useState("4");
  const [dishUnit, setDishUnit] = useState<LengthUnit>("mm");
  const [liquid, setLiquid] = useState("");
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<Weights | null>(null);

  const ap = profileAreaPerimeter(calc);

  const unlock = async () => {
    setLockMsg("");
    setBusy(true);
    try {
      const r = await post<{ token?: string; error?: string }>(
        "/api/weight-auth",
        { password },
      );
      if (r.status === 200 && r.json?.token) {
        setToken(r.json.token);
        setPassword("");
        track({ name: "custom", eventName: "weight_unlock" });
      } else if (r.status === 503)
        setLockMsg("The weight estimate is not configured yet.");
      else if (r.status === 401)
        setLockMsg("Access denied. Check the password.");
      else if (r.status === 429)
        setLockMsg("Too many attempts. Wait a minute and try again.");
      else
        setLockMsg("The weight estimate is only available on the live site.");
    } catch {
      setLockMsg("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const run = async () => {
    setMsg("");
    if (!ap || !calc.ok || !calc.result) {
      setMsg("Enter valid tank dimensions first.");
      return;
    }
    const liquidDensity = liquid.trim() === "" ? undefined : evalExpr(liquid);
    setBusy(true);
    try {
      const r = await post<
        Weights & { error?: string; errors?: Record<string, string> }
      >(
        "/api/weight-calc",
        {
          A_mm2: ap.A,
          P_mm: ap.P,
          L_mm: calc.input.dims.L,
          shellMm: (evalExpr(shell) || 0) * MM_PER_UNIT[shellUnit],
          dishMm: (evalExpr(dish) || 0) * MM_PER_UNIT[dishUnit],
          material,
          customDensity: material === "custom" ? evalExpr(density) : undefined,
          baffles: baffle.enabled ? baffle.result.plates : 0,
          ...(liquidDensity !== undefined
            ? { filledM3: calc.result.filledL / 1000, liquidDensity }
            : {}),
        },
        token ?? undefined,
      );
      if (r.status === 401) {
        setToken(null);
        setLockMsg("Session expired. Enter the password again.");
      } else if (r.status === 200 && r.json) {
        setOut(r.json);
        track({
          name: "custom",
          eventName: "weight_estimate",
          params: { shape: calc.shape },
        });
      } else {
        setMsg("Check the thickness, density and liquid density values.");
      }
    } catch {
      setMsg("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void unlock();
        }}
      >
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <LockIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-brand"
          />
          Weight estimation is password protected. Enter the access password to
          unlock it.
        </p>
        <FormField label="Access password" error={lockMsg || null}>
          {(c) => (
            <Input
              {...c}
              type="password"
              autoComplete="off"
              maxLength={200}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg bg-white px-3 text-base md:text-[15px]"
            />
          )}
        </FormField>
        <Button
          type="submit"
          size="lg"
          loading={busy}
          disabled={!password}
          className="h-11 rounded-full px-6 font-semibold sm:w-fit"
        >
          Unlock
        </Button>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <LockOpenIcon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-emerald-600"
        />
        Shell defaults to 3 mm; dish ends and baffle plates to 4 mm.
      </p>
      <FormField label="Material">
        {(c) => (
          <NativeSelect
            {...c}
            value={material}
            onChange={(e) => setMaterial(e.target.value as typeof material)}
            className={selectCls}
          >
            {MATERIALS.map((m) => (
              <NativeSelectOption key={m.value} value={m.value}>
                {m.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </FormField>
      {material === "custom" ? (
        <FormField label="Density (kg/m³)">
          {(c) => (
            <Input
              {...c}
              type="text"
              inputMode="decimal"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="h-11 rounded-lg bg-white px-3 text-base md:text-[15px]"
            />
          )}
        </FormField>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <DimensionField
          label="Shell thickness"
          symbol="ts"
          value={shell}
          unit={shellUnit}
          units={LENGTH_UNITS}
          onValueChange={setShell}
          onUnitChange={setShellUnit}
        />
        <DimensionField
          label="Dish / baffle thickness"
          symbol="td"
          value={dish}
          unit={dishUnit}
          units={LENGTH_UNITS}
          onValueChange={setDish}
          onUnitChange={setDishUnit}
        />
      </div>
      <FormField
        label="Liquid density (optional)"
        hint="kg/m³, e.g. 1000 water, 830 diesel. Leave blank for steel weight only."
      >
        {(c) => (
          <Input
            {...c}
            type="text"
            inputMode="decimal"
            value={liquid}
            onChange={(e) => setLiquid(e.target.value)}
            className="h-11 rounded-lg bg-white px-3 text-base md:text-[15px]"
          />
        )}
      </FormField>
      <Button
        type="button"
        size="lg"
        loading={busy}
        onClick={() => void run()}
        className="h-11 rounded-full px-6 font-semibold sm:w-fit"
      >
        Calculate weight
      </Button>
      {msg ? (
        <p role="alert" className="text-sm text-destructive">
          {msg}
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
        <Metric label="Shell" value={out ? `${fmt(out.shellKg, 1)} kg` : "—"} />
        <Metric
          label="Two dish ends"
          value={out ? `${fmt(out.dishKg, 1)} kg` : "—"}
        />
        <Metric
          label="Baffle plates"
          value={out ? `${fmt(out.baffleKg, 1)} kg` : "—"}
        />
        <Metric
          label="Total steel"
          value={out ? `${fmt(out.steelKg, 1)} kg` : "—"}
          className="border-brand/30 bg-brand/[0.04]"
        />
        <Metric
          label="Liquid"
          value={out?.liquidKg != null ? `${fmt(out.liquidKg, 1)} kg` : "—"}
        />
        <Metric
          label="Operating weight"
          value={
            out?.operatingKg != null ? `${fmt(out.operatingKg, 1)} kg` : "—"
          }
        />
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Estimates only. Steel = shell + two dish ends + baffles. Fittings,
        manholes, brackets, valves, welds and chassis are not included.
      </p>
    </div>
  );
}
