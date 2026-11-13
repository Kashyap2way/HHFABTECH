import Image from "next/image";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const facts = [
  { value: "1967", label: "Fabrication roots as HH Brothers" },
  { value: "6", label: "Tanker and tank product lines" },
  { value: "Pan India", label: "Supply and customer support" },
] as const;

export function StorySection() {
  return (
    <section aria-labelledby="story-title" className="bg-white py-16 md:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="story-title"
            align="left"
            eyebrow="About the company"
            title="Engineering excellence built on experience"
            className="mb-6 md:mb-8"
          />
          <div className="space-y-4 leading-relaxed text-muted-foreground md:text-lg">
            <p>
              HH FABTECH is a trusted manufacturer of petroleum, diesel,
              chemical, stainless steel and water tankers, delivering reliable
              and durable transportation solutions for industries across India.
            </p>
            <p>
              Built on decades of fabrication expertise, we combine modern
              manufacturing technology with skilled craftsmanship to produce
              tanker solutions that meet customer requirements and industry
              standards.
            </p>
            <p>
              Our commitment is to quality, innovation, safety and timely
              delivery, so every product reflects our dedication to engineering
              excellence.
            </p>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div
                key={f.label}
                className="flex flex-col-reverse gap-1 rounded-2xl border border-brand/10 bg-[#f8f7fb] p-5"
              >
                <dt className="text-sm leading-snug text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="text-2xl font-bold text-brand">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Photo collage */}
        <div className="reveal grid grid-cols-5 grid-rows-[auto_auto] gap-4">
          <div className="col-span-5 overflow-hidden rounded-3xl shadow-[0_40px_80px_-40px_rgb(21_15_38/0.5)] sm:col-span-3 sm:row-span-2">
            <Image
              src="/images/hero/hero4.webp"
              alt="Vertical storage tanks fabricated by HH FABTECH"
              width={1376}
              height={768}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 55vw, 90vw"
              className="aspect-[4/5] size-full object-cover max-sm:aspect-[16/10]"
            />
          </div>
          <div className="col-span-5 overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-36px_rgb(21_15_38/0.45)] sm:col-span-2">
            <Image
              src="/images/products/SS.webp"
              alt="Stainless steel tanker"
              width={1264}
              height={843}
              sizes="(min-width: 1024px) 250px, 40vw"
              className="aspect-square size-full object-cover"
            />
          </div>
          <div className="col-span-5 flex flex-col justify-end rounded-3xl bg-brand p-6 text-white sm:col-span-2">
            <p className="text-sm font-semibold tracking-[0.14em] text-gold uppercase">
              Based in
            </p>
            <p className="mt-1 text-xl leading-snug font-semibold">
              Sanathal, Ahmedabad, Gujarat
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
