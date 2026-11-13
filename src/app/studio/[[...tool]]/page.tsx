import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { NextStudio } from "next-sanity/studio";
import { Suspense } from "react";
import { isSanityConfigured } from "@/sanity/env";
import config from "../../../../sanity.config";

/**
 * Embedded Sanity Studio. Outside the (site) group, so no header, footer or analytics,
 * and never indexed. The Studio bundle is only downloaded on this route.
 */
// Same values next-sanity/studio exports, written inline: that module is a client module.
export const metadata: Metadata = {
  title: "Content Studio",
  referrer: "same-origin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Prerender the /studio shell; the Studio's own client router handles every sub-path. */
export function generateStaticParams() {
  return [{ tool: [] }];
}

/**
 * The Studio is a client-only app whose sub-paths are request-time params. This marker tells
 * Cache Components that deferring to request time is intentional (see generateMetadata docs).
 */
async function RequestTime() {
  await connection();
  return null;
}

export default function StudioPage() {
  return (
    <>
      {isSanityConfigured ? <NextStudio config={config} /> : <NotConfigured />}
      <Suspense>
        <RequestTime />
      </Suspense>
    </>
  );
}

function NotConfigured() {
  return (
    <div className="grid min-h-dvh place-items-center bg-brand-deep p-6 text-center text-white">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">Sanity is not configured yet</h1>
        <p className="mt-3 text-white/75">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> in the environment, then
          rebuild. See <code>.env.example</code>.
        </p>
      </div>
    </div>
  );
}
