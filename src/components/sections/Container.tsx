import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Page-width wrapper shared with the header and footer. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-10 2xl:px-12",
        className,
      )}
      {...props}
    />
  );
}
