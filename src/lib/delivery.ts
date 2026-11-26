/**
 * Delivery estimation, ported from the legacy quote builder (quote-core.js).
 * Pure functions: no clock access, the caller passes the start date.
 *
 * All values below are placeholders carried over from the old site and must be
 * confirmed before going live (holidays especially).
 */

export type DeliveryConfig = {
  baseWorkingDays: number;
  extraDaysPer10KL: number;
  /** 0 = January */
  peakMonths: readonly number[];
  peakFactor: number;
  /** ISO dates (YYYY-MM-DD) that are not working days besides Sundays */
  holidays: readonly string[];
};

export const defaultDeliveryConfig: DeliveryConfig = {
  baseWorkingDays: 25,
  extraDaysPer10KL: 2,
  peakMonths: [2, 3, 4, 9, 10],
  peakFactor: 1.25,
  holidays: [
    "2026-11-08",
    "2026-11-10",
    "2026-12-25",
    "2027-01-14",
    "2027-01-26",
  ],
};

/** Local-time YYYY-MM-DD (avoids the UTC shift of toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isWorkingDay(
  d: Date,
  config: DeliveryConfig = defaultDeliveryConfig,
): boolean {
  return d.getDay() !== 0 && !config.holidays.includes(toISODate(d));
}

export type DeliveryEstimate = {
  date: Date;
  workingDays: number;
  peak: boolean;
  factor: number;
};

/** Working days from `start`, stretched by the peak-season factor. */
export function estimateDelivery(
  start: Date,
  capacityKL: number,
  config: DeliveryConfig = defaultDeliveryConfig,
): DeliveryEstimate {
  const peak = config.peakMonths.includes(start.getMonth());
  const factor = peak ? config.peakFactor : 1;
  const days = Math.ceil(
    (config.baseWorkingDays +
      Math.floor(Math.max(0, capacityKL) / 10) * config.extraDaysPer10KL) *
      factor,
  );

  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    if (isWorkingDay(date, config)) left--;
  }
  return { date, workingDays: days, peak, factor };
}
