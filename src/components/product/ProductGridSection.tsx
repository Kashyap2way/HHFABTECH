import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import type { GridSection } from "@/lib/product-details";
import { cn } from "@/lib/utils";

/** Applications / accessories / industries grid. Items may have an icon, an image, or neither. */
export function ProductGridSection({
  section,
  id,
  tone = "white",
}: {
  section: GridSection;
  id: string;
  tone?: "white" | "grey";
}) {
  const withImages = section.items.some((i) => i.image);
  const plain = section.items.every((i) => !i.image && !i.icon);
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "py-16 md:py-20",
        tone === "grey" ? "bg-[#f8f7fb]" : "bg-white",
      )}
    >
      <Container>
        <SectionHeading
          id={id}
          title={section.title}
          description={section.description}
        />
        <ul
          className={cn(
            "grid gap-4",
            withImages
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              : plain
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {section.items.map(({ title, subtitle, icon: Icon, image }) => (
            <li
              key={title}
              className={cn(
                "reveal flex items-center rounded-2xl border border-brand/10 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_20px_40px_-28px_rgb(67_35_111/0.45)]",
                withImages
                  ? "flex-col p-5 text-center"
                  : "gap-2.5 p-3 sm:gap-3 sm:p-4 md:p-5",
              )}
            >
              {image ? (
                <Image
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  sizes="80px"
                  className="mb-4 size-16 object-contain"
                />
              ) : Icon ? (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/[0.07] text-brand sm:size-10">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
              ) : (
                <CheckIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-gold-dark"
                />
              )}
              <span className="min-w-0">
                <span className="block text-sm font-semibold wrap-break-word text-brand sm:text-base">
                  {title}
                </span>
                {subtitle ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {subtitle}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
