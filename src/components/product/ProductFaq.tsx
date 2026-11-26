"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/analytics/events";
import type { Faq } from "@/lib/product-details";

/** FAQ accordion. Each opened question is reported as `faq_open` (shows what buyers ask). */
export function ProductFaq({
  faqs,
  product,
}: {
  faqs: readonly Faq[];
  product: string;
}) {
  return (
    <Accordion
      className="rounded-2xl border border-brand/10 bg-white px-5 md:px-7"
      onValueChange={(value) => {
        const opened = (Array.isArray(value) ? value : [value]).filter(Boolean);
        const last = opened[opened.length - 1];
        if (typeof last === "string") {
          track({
            name: "custom",
            eventName: "faq_open",
            params: { question: last, product },
          });
        }
      }}
    >
      {faqs.map((f) => (
        <AccordionItem key={f.q} value={f.q}>
          <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
