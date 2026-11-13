import Image from "next/image";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const logos = [
  { src: "/images/petroleum/peso/logo1.png", width: 164, height: 63 },
  { src: "/images/petroleum/peso/logo2.png", width: 400, height: 150 },
  { src: "/images/petroleum/peso/logo3.jpg", width: 310, height: 352 },
  { src: "/images/petroleum/peso/logo4.png", width: 900, height: 500 },
  { src: "/images/petroleum/peso/logo5.png", width: 1300, height: 377 },
] as const;

/** CSS-only marquee (no JS). The list is rendered twice; the copy is hidden from AT. */
export function PesoLogos() {
  const row = (hidden: boolean) =>
    logos.map((l, i) => (
      <li
        key={`${hidden ? "b" : "a"}-${l.src}`}
        aria-hidden={hidden || undefined}
        className="flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl border border-brand/10 bg-white px-6 md:h-28 md:w-56"
      >
        <Image
          src={l.src}
          alt={hidden ? "" : `PESO-approved accessory supplier ${i + 1}`}
          width={l.width}
          height={l.height}
          sizes="200px"
          className="max-h-14 w-auto object-contain md:max-h-16"
        />
      </li>
    ));

  return (
    <section
      aria-labelledby="peso-title"
      className="overflow-hidden bg-white py-16 md:py-20"
    >
      <Container>
        <SectionHeading
          id="peso-title"
          eyebrow="Approved component suppliers"
          title="PESO-approved accessories"
        />
      </Container>
      <div className="[mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="animate-marquee flex w-max gap-5">
          {row(false)}
          {row(true)}
        </ul>
      </div>
    </section>
  );
}
