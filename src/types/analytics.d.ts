type GtagCommand = "js" | "config" | "event" | "set" | "consent";

type FbqFunction = {
  (command: "init", pixelId: string, params?: Record<string, unknown>): void;
  (
    command: "track" | "trackCustom",
    event: string,
    params?: Record<string, unknown>,
    options?: { eventID?: string },
  ): void;
  (command: "consent", action: "grant" | "revoke"): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};

interface Window {
  dataLayer?: unknown[];
  gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  fbq?: FbqFunction;
  _fbq?: FbqFunction;
  lintrk?: (action: "track", params: { conversion_id: number }) => void;
  _linkedin_data_partner_ids?: string[];
}
