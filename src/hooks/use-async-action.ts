"use client";

import { useCallback, useRef, useState } from "react";
import { type AnalyticsEvent, track } from "@/lib/analytics/events";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

type Options<T> = {
  /** Event sent when the action resolves (e.g. a lead conversion). */
  onSuccessEvent?: AnalyticsEvent | ((result: T) => AnalyticsEvent);
  /** Reported to GA4 as an `exception` when the action throws. */
  reportErrors?: boolean;
};

/**
 * Wraps any async action (form submit, fetch) with loading / error / success state,
 * and optionally fires a conversion event on success.
 *
 *   const submit = useAsyncAction(sendForm, {
 *     onSuccessEvent: { name: "generate_lead", source: "contact_form" },
 *   });
 *   <Button loading={submit.isLoading} onClick={() => submit.run(data)}>Send</Button>
 *   {submit.error && <Alert variant="destructive">{submit.error}</Alert>}
 */
export function useAsyncAction<Args extends unknown[], T>(
  action: (...args: Args) => Promise<T>,
  { onSuccessEvent, reportErrors = true }: Options<T> = {},
) {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef({ onSuccessEvent, reportErrors });
  optionsRef.current = { onSuccessEvent, reportErrors };

  const run = useCallback(async (...args: Args): Promise<T | undefined> => {
    setStatus("loading");
    setError(null);
    try {
      const result = await actionRef.current(...args);
      setStatus("success");
      const { onSuccessEvent: ev } = optionsRef.current;
      if (ev) track(typeof ev === "function" ? ev(result) : ev);
      return result;
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.";
      setStatus("error");
      setError(message);
      if (optionsRef.current.reportErrors) {
        track({ name: "exception", description: message });
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    run,
    reset,
    status,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
}
