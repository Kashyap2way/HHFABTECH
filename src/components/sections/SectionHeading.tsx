import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "center" | "left";
  /** Light text for dark sections */
  tone?: "dark" | "light";
  className?: string;
};

/** Eyebrow + h2 + gold rule + lead paragraph, used by every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div
      className={cn(
        "mb-10 max-w-3xl md:mb-14",
        center && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-sm font-semibold tracking-[0.18em] uppercase",
            tone === "light" ? "text-gold" : "text-gold-dark",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={cn(
          "text-3xl leading-tight font-bold text-balance md:text-4xl lg:text-[2.75rem]",
          tone === "light" ? "text-white" : "text-brand",
        )}
      >
        {title}
      </h2>
      <span
        aria-hidden="true"
        className={cn(
          "mt-5 block h-1 w-14 rounded-full bg-gradient-to-r from-gold to-gold-dark",
          center && "mx-auto",
        )}
      />
      {description ? (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed text-pretty md:text-lg",
            tone === "light" ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
