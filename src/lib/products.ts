/** Product catalogue shared by the home page, contact form, footer and SEO. */

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  /** Smaller variant for mobile / card widths, if one exists. */
  small?: { src: string; width: number };
};

export type Product = {
  slug: string;
  name: string;
  /** One-line card description */
  blurb: string;
  /** Longer description for the Products listing page */
  listBlurb: string;
  /** Short tag shown on the card */
  tag: string;
  image: ProductImage;
};

export const products: readonly Product[] = [
  {
    slug: "petroleum-tanker",
    name: "Petroleum / Diesel Tanker",
    tag: "12 – 40 KL",
    blurb:
      "Fuel tankers for IOCL, HPCL, Jio-bp, Nayara and Essar, with top or bottom loading and custom compartments.",
    listBlurb:
      "High-strength petroleum and diesel tankers manufactured with superior engineering for safe transportation of petroleum products.",
    image: {
      src: "/images/products/petroleum.webp",
      width: 1658,
      height: 640,
      small: { src: "/images/products/petroleum-1140.webp", width: 1140 },
    },
  },
  {
    slug: "chemical-tanker",
    name: "Chemical Tanker",
    tag: "10 – 20 Ton",
    blurb:
      "Corrosion-resistant tankers for HCL, H₂SO₄, HNO₃ and other hazardous liquids, built for long service life.",
    listBlurb:
      "Designed for transportation of industrial chemicals with high corrosion resistance and safety standards.",
    image: {
      src: "/images/products/chemical.webp",
      width: 1393,
      height: 752,
      small: { src: "/images/products/chemical-815.webp", width: 815 },
    },
  },
  {
    slug: "ss-tanker",
    name: "SS Tanker",
    tag: "SS 304 / SS 316",
    blurb:
      "Food-grade stainless steel tankers for milk, edible oil, pharmaceutical and specialty liquids.",
    listBlurb:
      "Stainless steel tankers suitable for food, pharmaceutical and specialty liquid transportation.",
    image: {
      src: "/images/products/SS.webp",
      width: 1264,
      height: 843,
      small: { src: "/images/products/SS-660.webp", width: 660 },
    },
  },
  {
    slug: "fuel-bowser",
    name: "Fuel Bowser",
    tag: "500 – 5000 L",
    blurb:
      "Mobile diesel dispensing units with pump, flow meter and nozzle options for on-site refuelling.",
    listBlurb:
      "Rugged mobile fuel bowsers built for efficient fuel transportation and on-site refuelling applications.",
    image: { src: "/images/products/bowser.webp", width: 516, height: 387 },
  },
  {
    slug: "storage-tank",
    name: "Vertical / Capsule Storage Tank",
    tag: "5 – 40 KL",
    blurb:
      "Hydro-tested storage tanks for petroleum, water, chemicals and industrial liquids.",
    listBlurb:
      "Industrial storage tanks fabricated for petroleum, chemicals, water and industrial liquid storage.",
    image: {
      src: "/images/products/storage.webp",
      width: 1376,
      height: 768,
      small: { src: "/images/products/storage-788.webp", width: 788 },
    },
  },
  {
    slug: "water-tanker",
    name: "Water Tanker",
    tag: "5 – 20 KL",
    blurb:
      "MS and SS water tankers for municipal supply, construction, mining and agriculture.",
    listBlurb:
      "Heavy-duty water tankers suitable for construction, municipal and industrial water transportation.",
    image: {
      src: "/images/products/water.webp",
      width: 750,
      height: 600,
      small: { src: "/images/products/water-550.webp", width: 550 },
    },
  },
];

/** Options for the contact form "Product interested in" field. */
export const productOptions: readonly string[] = [
  ...products.map((p) => p.name),
  "Custom Fabrication",
];
