"use client";

import { ArrowRightIcon, BoxIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import type { SceneModel } from "@/components/three/calc-scene";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

/**
 * Not rendered (so not downloaded) until the dialog is first opened. ssr:false keeps three.js
 * out of the server render and out of every route's initial JavaScript.
 */
const InstantQuote3D = dynamic(() => import("./InstantQuote3D"), {
  ssr: false,
  loading: () => (
    <div className="relative grid aspect-[4/3] w-full place-items-center sm:aspect-[16/10]">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#475467]">
        <Spinner aria-hidden="true" />
        Loading 3D viewer…
      </p>
    </div>
  ),
});

export function InstantQuoteButton({
  model,
  productName,
  inquiryHref,
}: {
  model: SceneModel;
  productName: string;
  inquiryHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track({
            name: "cta_click",
            label: "Get instant quote",
            location: "calculator",
            product: productName,
          });
          setOpen(true);
        }}
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-12 cursor-pointer rounded-full border-brand/25 px-6 text-base font-semibold text-brand",
        )}
      >
        <BoxIcon aria-hidden="true" />
        Get instant quote
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Your tank on a tanker truck</DialogTitle>
            <DialogDescription>
              Interactive 3D preview of the dimensions you entered. Drag to
              rotate.
            </DialogDescription>
          </DialogHeader>
          {open ? <InstantQuote3D model={model} /> : null}
          <TrackedLink
            href={inquiryHref}
            event={{
              name: "cta_click",
              label: "Send instant quote as inquiry",
              location: "calculator-3d",
              product: productName,
            }}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full rounded-full bg-gold px-6 text-base font-semibold text-brand-dark hover:bg-gold-light sm:w-auto sm:justify-self-end",
            )}
          >
            Send this as an inquiry
            <ArrowRightIcon aria-hidden="true" />
          </TrackedLink>
        </DialogContent>
      </Dialog>
    </>
  );
}
