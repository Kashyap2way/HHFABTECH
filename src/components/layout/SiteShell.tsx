import type { ReactNode } from "react";
import { Analytics } from "@/components/analytics/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { siteJsonLd } from "@/lib/seo";

/**
 * Public-site chrome (header, footer, WhatsApp, analytics, site JSON-LD).
 * Kept out of the root layout so the embedded Sanity Studio at /studio
 * renders full-screen without the site navigation or tracking tags.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <JsonLd data={siteJsonLd} />
      <Toaster richColors position="top-center" />
      <Analytics />
    </>
  );
}
