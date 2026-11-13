"use client";

import { MessageCircleIcon, PhoneIcon, RotateCwIcon } from "lucide-react";
import { useEffect } from "react";
import {
  ErrorLayout,
  errorPrimary,
  errorSecondary,
} from "@/components/errors/ErrorLayout";
import { Button, buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics/events";
import { contact, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

/** 500-style boundary for runtime errors inside any route (header and footer stay). */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    track({
      name: "exception",
      description: `${error.name}: ${error.message}${error.digest ? ` (${error.digest})` : ""}`,
      fatal: true,
    });
  }, [error]);

  return (
    <ErrorLayout
      code="500"
      eyebrow="Something went wrong"
      title="We hit a snag loading this page"
      description="It's on our side, not yours. Please try again. If it keeps happening, call or WhatsApp us and we'll help right away."
      actions={
        <>
          <Button
            size="lg"
            className={errorPrimary}
            onClick={() => {
              track({ name: "cta_click", label: "Try again", location: "500" });
              retry();
            }}
          >
            <RotateCwIcon aria-hidden="true" />
            Try again
          </Button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track({
                name: "contact_click",
                method: "whatsapp",
                location: "500",
              })
            }
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              errorSecondary,
            )}
          >
            <MessageCircleIcon aria-hidden="true" />
            WhatsApp us
          </a>
        </>
      }
    >
      <p className="mt-8 text-sm text-white/60">
        Or call{" "}
        <a
          href={`tel:${contact.people[0].tel}`}
          onClick={() =>
            track({ name: "contact_click", method: "phone", location: "500" })
          }
          className="inline-flex items-center gap-1 font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-gold"
        >
          <PhoneIcon aria-hidden="true" className="size-3.5" />
          {contact.people[0].display}
        </a>
        {error.digest ? (
          <span className="mt-3 block text-xs text-white/40">
            Reference: {error.digest}
          </span>
        ) : null}
      </p>
    </ErrorLayout>
  );
}
