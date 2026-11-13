import { ArrowRightIcon } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { CalculatorTank3D } from "@/components/three/CalculatorTank3D";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chips = [
  "11 tank shapes",
  "Partial-fill volume",
  "Dish-end volume",
  "Step-by-step formulas",
  "Free, no sign-up",
];

function TankArt() {
  return (
    <svg
      viewBox="0 0 480 300"
      aria-hidden="true"
      focusable="false"
      className="animate-float-y w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]"
    >
      <defs>
        <linearGradient id="cpG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e7b4" />
          <stop offset="1" stopColor="#d7b65d" />
        </linearGradient>
        <linearGradient id="cpW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4f2" stopOpacity=".95" />
          <stop offset="1" stopColor="#2d7fc0" stopOpacity=".92" />
        </linearGradient>
        <clipPath id="cpC">
          <path d="M110 76H370A34 74 0 0 1 370 224H110A34 74 0 0 1 110 76Z" />
        </clipPath>
      </defs>
      <ellipse cx="240" cy="266" rx="176" ry="11" fill="rgba(0,0,0,.35)" />
      <g clipPath="url(#cpC)">
        <path
          className="animate-wave"
          d="M-120 150 q30 -10 60 0 t60 0 q30 -10 60 0 t60 0 q30 -10 60 0 t60 0 q30 -10 60 0 t60 0 q30 -10 60 0 t60 0 V240 H-120Z"
          fill="url(#cpW)"
        />
      </g>
      <path
        d="M110 76H370A34 74 0 0 1 370 224H110A34 74 0 0 1 110 76Z"
        fill="rgba(255,255,255,.07)"
        stroke="url(#cpG)"
        strokeWidth="2.6"
      />
      <g fill="none" stroke="#f6e7b4" strokeOpacity=".5" strokeWidth="1.2">
        {[150, 190, 230, 270, 310, 350].map((cx) => (
          <ellipse key={cx} cx={cx} cy="150" rx="13" ry="74" />
        ))}
        <path d="M110 113H370M110 150H370M110 187H370" strokeOpacity=".38" />
        <ellipse
          cx="82"
          cy="150"
          rx="26"
          ry="74"
          stroke="url(#cpG)"
          strokeOpacity=".9"
          strokeWidth="1.6"
        />
      </g>
      <g stroke="#f6e7b4" strokeOpacity=".55" strokeWidth="1" fill="none">
        <path d="M50 244H430" />
        <path d="M50 238v12M430 238v12" />
      </g>
    </svg>
  );
}

export function CalculatorPromo() {
  return (
    <section
      aria-labelledby="calc-title"
      className="relative isolate overflow-hidden bg-[#150f26] py-16 text-white md:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_80%_at_12%_8%,rgb(111_66_193/0.55),transparent_62%),radial-gradient(45%_70%_at_92%_18%,rgb(244_180_0/0.3),transparent_62%),radial-gradient(60%_80%_at_62%_112%,rgb(39_132_198/0.4),transparent_62%)]"
      />
      <Container>
        <div className="reveal grid items-center gap-10 rounded-[2rem] border border-white/15 bg-white/[0.06] p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_50px_90px_-40px_rgb(0_0_0/0.7)] backdrop-blur-xl md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-gold/15 px-4 py-1.5 text-sm font-semibold text-[#f6dd8a]">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-gold" />
              </span>
              New · Free tool
            </p>
            <h2
              id="calc-title"
              className="text-3xl leading-tight font-bold text-balance md:text-4xl lg:text-[2.75rem]"
            >
              Work out your tank capacity in seconds
            </h2>
            <p className="mt-5 max-w-[52ch] leading-relaxed text-white/80 md:text-lg">
              Total and partial-fill volume for spell, circle, oval, vertical,
              cone, capsule, sphere and dished tanks, in litres, KL, m³ and
              gallons.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-white/90"
                >
                  {c}
                </li>
              ))}
            </ul>
            <TrackedLink
              href="/calculator"
              event={{
                name: "cta_click",
                label: "Try the calculator",
                location: "home_calculator_promo",
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 rounded-full bg-gold px-7 text-base font-bold text-brand-dark hover:bg-gold-light",
              )}
            >
              Try the calculator
              <ArrowRightIcon aria-hidden="true" />
            </TrackedLink>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            {/* 3D loads only when this section nears the viewport; the SVG is the instant fallback */}
            <CalculatorTank3D fallback={<TankArt />} />
          </div>
        </div>
      </Container>
    </section>
  );
}
