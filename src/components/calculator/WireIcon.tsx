import type { ShapeId } from "@/lib/calculator/shapes";
import { globeIconMarkup, wireIconMarkup } from "@/lib/calculator/wire-icons";
import { cn } from "@/lib/utils";

/** Static, trusted SVG markup generated from fixed geometry (no user input). */
export function WireIcon({
  shape,
  className,
}: {
  shape: ShapeId | "globe";
  className?: string;
}) {
  const markup = shape === "globe" ? globeIconMarkup() : wireIconMarkup(shape);
  return (
    <svg
      viewBox="0 0 180 100"
      aria-hidden="true"
      focusable="false"
      className={cn("w-ico", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is generated from constant geometry only
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
