import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import { TrackedAnchor, TrackedLink } from "@/components/analytics/TrackedLink";
import { buttonVariants } from "@/components/ui/button";
import { contact, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

/** Closing conversion band: quote form, WhatsApp and phone. `location` tags the analytics events. */
export function CtaBand({
  title = "Looking for a reliable tanker manufacturer?",
  text = "Tell us your capacity, product and chassis. Our team will get back with specifications and a quotation.",
  location,
  quoteHref = "/contact#inquiry",
  product,
}: {
  title?: string;
  text?: string;
  location: string;
  /** Override the quote link, e.g. with a product prefill */
  quoteHref?: string;
  /** Product name for analytics */
  product?: string;
}) {
  return (
    <section
      aria-labelledby={`${location}-cta-title`}
      className="bg-white py-16 md:py-20"
    >
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand px-6 py-12 text-center text-white md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_85%_0%,rgb(244_180_0/0.25),transparent_60%),radial-gradient(60%_120%_at_0%_100%,rgb(111_66_193/0.6),transparent_65%),linear-gradient(135deg,#2b1850,#43236f_55%,#5f3298)]"
          />
          <h2
            id={`${location}-cta-title`}
            className="mx-auto max-w-3xl text-3xl leading-tight font-bold text-balance md:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/85 md:text-lg">
            {text}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <TrackedLink
              href={quoteHref}
              event={{
                name: "cta_click",
                label: "Request a Quote",
                location,
                product,
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light",
              )}
            >
              Request a Quote
            </TrackedLink>
            <TrackedAnchor
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              event={{ name: "contact_click", method: "whatsapp", location }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/20 hover:text-white",
              )}
            >
              <MessageCircleIcon aria-hidden="true" />
              WhatsApp us
            </TrackedAnchor>
            <TrackedAnchor
              href={`tel:${contact.people[0].tel}`}
              event={{ name: "contact_click", method: "phone", location }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/20 hover:text-white",
              )}
            >
              <PhoneIcon aria-hidden="true" />
              {contact.people[0].display}
            </TrackedAnchor>
          </div>
        </div>
      </Container>
    </section>
  );
}
