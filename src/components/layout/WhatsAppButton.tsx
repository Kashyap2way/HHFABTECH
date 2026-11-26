"use client";

import { MessageCircleIcon } from "lucide-react";
import { track } from "@/lib/analytics/events";
import { whatsappHref } from "@/lib/site";

/**
 * Floating WhatsApp button, bottom right (as on the legacy site).
 * Collapsed to a 64px circle; expands to show "Chat With Us" on hover or keyboard focus.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      onClick={() =>
        track({
          name: "contact_click",
          method: "whatsapp",
          location: "floating_button",
        })
      }
      className="group fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white/90 shadow-[0_15px_40px_rgb(0_0_0/0.18)] backdrop-blur-md transition-[width,box-shadow] duration-500 ease-premium hover:w-[11.5rem] hover:shadow-[0_18px_44px_rgb(37_211_102/0.35)] focus-visible:w-[11.5rem] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-6 sm:h-16 sm:w-16 sm:hover:w-[13rem] sm:focus-visible:w-[13rem] motion-safe:animate-float"
    >
      <svg
        viewBox="0 0 448 512"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="mx-3.5 size-7 shrink-0 text-[#25D366] transition-transform duration-300 group-hover:-rotate-12 sm:mx-4 sm:size-8"
      >
        <path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z" />
      </svg>
      <span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap text-brand opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100 sm:text-base">
        Chat With Us
      </span>
      <MessageCircleIcon className="sr-only" aria-hidden="true" />
    </a>
  );
}
