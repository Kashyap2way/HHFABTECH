"use client";

import { Poppins } from "next/font/google";
import { useEffect } from "react";
import { track } from "@/lib/analytics/events";
import { contact } from "@/lib/site";
import "./globals.css";

// global-error replaces the root layout, so it brings its own font and styles.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
});

/** Last-resort 500 page: shown when the root layout itself fails. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    track({
      name: "exception",
      description: `${error.name}: ${error.message}`,
      fatal: true,
    });
  }, [error]);

  return (
    <html lang="en-IN" className={poppins.variable}>
      <body className="grid min-h-dvh place-items-center bg-[#150f26] px-6 text-center font-sans text-white antialiased">
        <main>
          <p
            aria-hidden="true"
            className="bg-gradient-to-b from-white/25 to-white/0 bg-clip-text text-[8rem] leading-none font-semibold text-transparent sm:text-[11rem]"
          >
            500
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            HH FABTECH is temporarily unavailable
          </h1>
          <p className="mx-auto mt-4 max-w-md text-white/75">
            Please try again in a moment. For urgent enquiries call{" "}
            <a
              className="font-semibold text-gold underline underline-offset-4"
              href={`tel:${contact.people[0].tel}`}
            >
              {contact.people[0].display}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 h-12 cursor-pointer rounded-full bg-gold px-8 font-semibold text-[#2b1850] transition-colors hover:bg-gold-light"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
