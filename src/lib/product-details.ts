/**
 * Full content for each product detail page. Server-only data: it is rendered
 * by server components and turned into JSON-LD, never shipped as JS.
 *
 * Every fact here comes from the legacy product pages in /html. FAQs are
 * written only from those facts so the structured data stays truthful.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlarmSmokeIcon,
  BadgeCheckIcon,
  BrushIcon,
  BuildingIcon,
  CogIcon,
  ConstructionIcon,
  DropletIcon,
  FactoryIcon,
  FlameIcon,
  FlaskConicalIcon,
  FuelIcon,
  GaugeIcon,
  LockIcon,
  MilkIcon,
  MountainIcon,
  OctagonAlertIcon,
  PickaxeIcon,
  PlugZapIcon,
  RouteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SprayCanIcon,
  SproutIcon,
  TractorIcon,
  TreesIcon,
  TruckIcon,
  WavesIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ChipGroup = {
  title: string;
  description?: string;
  items: readonly string[];
};

export type GridItem = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  image?: { src: string; width: number; height: number };
};

export type GridSection = {
  title: string;
  description?: string;
  items: readonly GridItem[];
};

/** A cell is a sentence or a bulleted list. */
export type Cell = string | readonly string[];

export type Comparison = {
  title: string;
  description?: string;
  /** Column headings after the "Feature" column */
  headers: readonly [string, string];
  rows: readonly { feature: string; a: Cell; b: Cell }[];
  /** Highlight the second column (e.g. premium grade) */
  highlightSecond?: boolean;
  footnote?: string;
};

export type ConfigTable = {
  title: string;
  description?: string;
  rows: readonly {
    gvw: string;
    capacities: readonly string[];
    configurations: readonly string[];
  }[];
};

export type Feature = { icon: LucideIcon; title: string; text: string };
export type Faq = { q: string; a: string };

export type ProductDetail = {
  slug: string;
  name: string;
  /** Category for schema.org / GA4 item_category */
  category: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  tagline: string;
  image: ProductImage;
  /** Quick facts in the hero (also schema.org additionalProperty) */
  keySpecs: readonly { label: string; value: string }[];
  overviewTitle: string;
  overview: readonly string[];
  highlights: readonly string[];
  chipGroups: readonly ChipGroup[];
  configTable?: ConfigTable;
  comparison?: Comparison;
  gridSections: readonly GridSection[];
  features: readonly Feature[];
  faqs: readonly Faq[];
  ctaTitle: string;
  ctaText: string;
  related: readonly string[];
  /** Interactive extras only the petroleum page has */
  extras?: { branding?: boolean; pesoLogos?: boolean };
};

const chem = (file: string, width: number, height: number) => ({
  src: `/images/chemical/${file}`,
  width,
  height,
});

export const productDetails: readonly ProductDetail[] = [
  // --------------------------------------------------------------------- Petroleum
  {
    slug: "petroleum-tanker",
    name: "Petroleum / Diesel Tanker",
    category: "Petroleum Tanker",
    metaTitle: "Petroleum / Diesel Tanker Manufacturer",
    metaDescription:
      "Petroleum and diesel tankers for IOCL, HPCL, Jio-bp, Nayara and Essar, from 12 KL to 40 KL with custom compartments, top or bottom loading. Made in Ahmedabad.",
    eyebrow: "Petroleum / Diesel Tanker",
    title: "Petroleum & diesel tankers built for safe fuel transport",
    tagline:
      "Manufactured with precision, safety and reliability for oil marketing dealers and fleet operators.",
    image: {
      src: "/images/products/petroleum.webp",
      width: 1658,
      height: 640,
      alt: "Petroleum tanker manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Capacity", value: "12 – 40 KL" },
      { label: "Chassis", value: "16 – 49 GVW" },
      { label: "Loading", value: "Top / Bottom" },
      { label: "Hydro test", value: "0.35 kg/cm²" },
    ],
    overviewTitle: "Engineered for petroleum products",
    overview: [
      "HH FABTECH manufactures premium petroleum tankers designed for transportation of petrol, diesel and other petroleum products.",
      "Every tanker is engineered for maximum safety, durability and compliance with industry standards, with compartment configurations matched to your chassis.",
    ],
    highlights: [
      "Approved branding for IOCL, HP, Jio-bp, Essar and Nayara",
      "Multiple compartment configurations per chassis",
      "Top loading and bottom loading variants",
      "PESO-approved accessories",
      "Hydro test in every compartment",
      "3-D pre-treatment with zinc phosphate and PU paint",
    ],
    chipGroups: [],
    configTable: {
      title: "Available configurations",
      description:
        "Tank capacity and compartment layouts for each vehicle GVW.",
      rows: [
        {
          gvw: "16 GVW",
          capacities: ["12 KL"],
          configurations: ["4 + 4 + 4 KL", "3 + 3 + 3 + 3 KL"],
        },
        {
          gvw: "25 GVW",
          capacities: ["18 KL", "20 KL"],
          configurations: ["4 + 4 + 5 + 5 KL", "5 + 5 + 5 + 5 KL"],
        },
        {
          gvw: "31 GVW",
          capacities: ["24 KL"],
          configurations: ["4 + 5 + 5 + 5 + 5 KL"],
        },
        {
          gvw: "37 GVW",
          capacities: ["28 KL", "29 KL"],
          configurations: ["7 + 7 + 7 + 7 KL", "6 + 6 + 6 + 6 + 5 KL"],
        },
        {
          gvw: "40 GVW",
          capacities: ["30 KL (MS)"],
          configurations: ["6 + 6 + 6 + 6 + 6 KL"],
        },
        {
          gvw: "49 GVW",
          capacities: ["35 KL (MS)", "40 KL (AL)"],
          configurations: ["7 + 7 + 7 + 7 + 7 KL", "7 + 7 + 7 + 7 + 5 + 7 KL"],
        },
      ],
    },
    comparison: {
      title: "General specifications",
      description: "Top loading vs bottom loading petroleum tankers.",
      headers: ["Top loading tank", "Bottom loading tank"],
      rows: [
        {
          feature: "Nozzles",
          a: [
            '18" manhole in each compartment',
            '4" fill pipe',
            '1" dip pipe',
            "P-V valve",
            "Feasible vent",
          ],
          b: [
            '20" clamped manhole in each compartment',
            "Vapour recovery line",
            "P-V valve",
            "Level sensor",
          ],
        },
        { feature: "Operating pressure", a: "Atmospheric", b: "Atmospheric" },
        {
          feature: "Valves & discharge",
          a: [
            '3" delivery line',
            "Emergency valve (mechanical lever)",
            "Gun metal valve",
            "Three-piece ball valve",
            "Front delivery header",
          ],
          b: [
            '4" delivery line',
            "Pneumatic emergency valve",
            "API adaptor",
            "Dust cap at discharge point",
          ],
        },
        {
          feature: "Other accessories",
          a: [
            "Fire extinguishers",
            "Valve box",
            "Mud guards",
            "SUPD",
            "Catwalk with hand rail and ladder",
          ],
          b: [
            "Gravity coupler",
            "Vapour adaptor",
            "Control panel box",
            "Lockable valve box",
            "Fire extinguishers",
            "Mud guards",
            "SUPD",
            "Catwalk with hand rail and ladder",
          ],
        },
        {
          feature: "Testing",
          a: "Hydro test at 0.35 kg/cm² in each compartment",
          b: "Hydro test at 0.35 kg/cm² in each compartment",
        },
        {
          feature: "Surface preparation",
          a: "3-D pre-treatment with zinc phosphate coating, then PU paint. Shade as per customer requirement.",
          b: "3-D pre-treatment with zinc phosphate coating, then PU paint. Shade as per customer requirement.",
        },
      ],
    },
    gridSections: [],
    features: [
      {
        icon: FuelIcon,
        title: "Petroleum industry standards",
        text: "Manufactured to petroleum industry standards for maximum operational safety.",
      },
      {
        icon: CogIcon,
        title: "Customised compartments",
        text: "Multiple compartment configurations to match your requirement and chassis.",
      },
      {
        icon: BadgeCheckIcon,
        title: "Quality tested",
        text: "Every tanker undergoes hydro testing, leakage testing and quality inspection before dispatch.",
      },
    ],
    faqs: [
      {
        q: "What capacities of petroleum tanker do you manufacture?",
        a: "We build petroleum and diesel tankers from 12 KL to 40 KL, matched to vehicle GVW from 16 to 49 tonnes. For example, 24 KL on a 31 GVW chassis or 35 KL (MS) and 40 KL (aluminium) on a 49 GVW chassis.",
      },
      {
        q: "Can you build tankers with IOCL, HPCL, Jio-bp, Nayara or Essar branding?",
        a: "Yes. We manufacture tankers with approved branding for IOCL, HP, Jio-bp, Essar and Nayara.",
      },
      {
        q: "What is the difference between top loading and bottom loading tankers?",
        a: "Top loading tankers use an 18-inch manhole with a 4-inch fill pipe and a 3-inch delivery line. Bottom loading tankers use a 20-inch clamped manhole, vapour recovery line, level sensor and a 4-inch delivery line with a pneumatic emergency valve and API adaptor.",
      },
      {
        q: "How are your petroleum tankers tested?",
        a: "Each compartment is hydro tested at 0.35 kg/cm², and every tanker goes through leakage testing and quality inspection before dispatch.",
      },
      {
        q: "Do you use PESO-approved accessories?",
        a: "Yes. Our petroleum tankers are fitted with accessories from PESO-approved component suppliers.",
      },
    ],
    ctaTitle: "Need a customised petroleum tanker?",
    ctaText:
      "Tell us your capacity, compartment and branding requirements, and we will send specifications and a quotation.",
    related: ["fuel-bowser", "storage-tank", "chemical-tanker"],
    extras: { branding: true, pesoLogos: true },
  },

  // --------------------------------------------------------------------- Chemical
  {
    slug: "chemical-tanker",
    name: "Chemical Tanker",
    category: "Chemical Tanker",
    metaTitle: "Chemical Tanker Manufacturer",
    metaDescription:
      "Corrosion-resistant chemical tankers for HCL, H₂SO₄, HNO₃ and hazardous liquids, available in 10, 12, 15 and 20 ton capacities. Leak-proof, heavy-duty, custom built.",
    eyebrow: "Chemical Tanker",
    title: "Chemical tankers built to resist corrosion",
    tagline:
      "Designed for safe transportation of industrial chemicals, acids and hazardous liquids.",
    image: {
      src: "/images/products/chemical.webp",
      width: 1393,
      height: 752,
      alt: "Chemical tanker manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Capacity", value: "10 – 20 Ton" },
      { label: "Built for", value: "Acids & hazmat" },
      { label: "Construction", value: "Leak proof" },
      { label: "Build", value: "Custom" },
    ],
    overviewTitle: "A chemical transport solution",
    overview: [
      "HH FABTECH manufactures premium chemical tankers specially designed for transportation of hazardous chemicals, acids and industrial liquids.",
      "Made with corrosion-resistant materials and precision engineering, every tanker is built for safety, durability and long service life, even in harsh operating conditions.",
    ],
    highlights: [
      "Corrosion-resistant construction",
      "Leak-proof design",
      "Easy cleaning",
      "Heavy-duty fabrication",
      "Low maintenance",
      "Custom built",
    ],
    chipGroups: [
      {
        title: "Available capacities",
        items: ["10 Ton", "12 Ton", "15 Ton", "20 Ton"],
      },
    ],
    gridSections: [
      {
        title: "Suitable for",
        description: "Chemical applications we build tankers for.",
        items: [
          {
            title: "HCL",
            subtitle: "Hydrochloric acid",
            image: chem("hcl.png", 512, 299),
          },
          {
            title: "H₂SO₄",
            subtitle: "Sulphuric acid",
            image: chem("h2so4.png", 210, 192),
          },
          {
            title: "HNO₃",
            subtitle: "Nitric acid",
            image: chem("hno3.png", 289, 174),
          },
          {
            title: "HDPE",
            subtitle: "High-density polyethylene",
            image: chem("hdpe.png", 595, 379),
          },
          {
            title: "PP",
            subtitle: "Polypropylene",
            image: chem("pp.jpg", 400, 358),
          },
          {
            title: "Hazardous",
            subtitle: "Hazardous materials",
            image: chem("hazard.jpg", 612, 612),
          },
        ],
      },
    ],
    features: [
      {
        icon: ShieldCheckIcon,
        title: "Corrosion resistant",
        text: "Premium corrosion-resistant materials for a long service life.",
      },
      {
        icon: FlaskConicalIcon,
        title: "Chemical compatible",
        text: "Designed to safely transport industrial acids, alkalis and hazardous chemicals.",
      },
      {
        icon: FactoryIcon,
        title: "Heavy-duty fabrication",
        text: "Strong construction with precision welding for maximum durability.",
      },
    ],
    faqs: [
      {
        q: "What capacities of chemical tanker are available?",
        a: "Chemical tankers are available in 10 ton, 12 ton, 15 ton and 20 ton capacities, and can be custom built to your requirement.",
      },
      {
        q: "Which chemicals can your tankers carry?",
        a: "We build tankers for hydrochloric acid (HCL), sulphuric acid (H₂SO₄), nitric acid (HNO₃), HDPE, polypropylene (PP) and other hazardous materials.",
      },
      {
        q: "Are your chemical tankers leak proof?",
        a: "Yes. They are built with a leak-proof design, corrosion-resistant construction and precision welding.",
      },
    ],
    ctaTitle: "Need a customised chemical tanker?",
    ctaText:
      "Share the chemical, capacity and chassis details and our team will recommend the right construction.",
    related: ["ss-tanker", "storage-tank", "petroleum-tanker"],
  },

  // --------------------------------------------------------------------- SS
  {
    slug: "ss-tanker",
    name: "SS Tanker",
    category: "Stainless Steel Tanker",
    metaTitle: "SS Tanker Manufacturer | Food Grade Stainless Steel",
    metaDescription:
      "Food-grade stainless steel tankers in SS 304 and SS 316 for milk, edible oil, pharmaceutical and chemical industries. Mirror polished, TIG welded, leak proof.",
    eyebrow: "Stainless Steel Tanker",
    title: "Food-grade stainless steel tankers",
    tagline:
      "Premium SS 304 and SS 316 tankers for food, dairy, pharmaceutical and chemical transportation.",
    image: {
      src: "/images/products/SS.webp",
      width: 1264,
      height: 843,
      alt: "Stainless steel tanker manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Grades", value: "SS 304 / 316" },
      { label: "Finish", value: "Mirror polish" },
      { label: "Welding", value: "TIG" },
      { label: "Insulation", value: "Optional" },
    ],
    overviewTitle: "Hygienic liquid transportation",
    overview: [
      "HH FABTECH manufactures premium stainless steel tankers using international fabrication standards for food, dairy, pharmaceutical and chemical industries.",
      "Every tanker is precision welded, mirror polished, pressure tested and engineered for hygienic liquid transportation.",
    ],
    highlights: [
      "Food-grade stainless steel construction",
      "Mirror polish interior finish",
      "Corrosion resistant",
      "Easy cleaning and low maintenance",
      "Optional thermal insulation",
      "High-strength TIG welding",
      "Leak-proof design",
      "Long service life",
    ],
    chipGroups: [
      { title: "Available material grades", items: ["SS 304", "SS 316"] },
    ],
    comparison: {
      title: "Material comparison",
      description:
        "Choose the right stainless steel grade for your application.",
      headers: ["SS 304", "SS 316"],
      highlightSecond: true,
      rows: [
        {
          feature: "Best suited for",
          a: ["Milk", "Edible oil", "Food products"],
          b: ["Chemicals", "Acidic liquids", "Coastal industries"],
        },
        { feature: "Corrosion resistance", a: "Excellent", b: "Superior" },
        { feature: "Cost", a: "Standard", b: "Premium, about 15–20% higher" },
        {
          feature: "Industrial applications",
          a: ["Food-grade tankers", "Milk collection", "Edible oil"],
          b: [
            "Chemical transport",
            "Pharmaceutical industry",
            "Marine environment",
          ],
        },
        {
          feature: "Temperature performance",
          a: "Suitable for normal food transportation",
          b: "Better in high-temperature and corrosive environments",
        },
        { feature: "Service life", a: "20+ years*", b: "25+ years*" },
      ],
      footnote: "* Typical service life with proper use and maintenance.",
    },
    gridSections: [],
    features: [
      {
        icon: MilkIcon,
        title: "Food-grade quality",
        text: "Certified food-grade stainless steel with hygienic fabrication standards.",
      },
      {
        icon: SparklesIcon,
        title: "Mirror polish finish",
        text: "Interior mirror polishing minimises residue and makes cleaning effortless.",
      },
      {
        icon: ShieldCheckIcon,
        title: "Corrosion resistant",
        text: "Excellent resistance against rust, chemicals and harsh operating environments.",
      },
    ],
    faqs: [
      {
        q: "What is the difference between SS 304 and SS 316 tankers?",
        a: "SS 304 is ideal for milk, edible oil and food products with excellent corrosion resistance. SS 316 offers superior corrosion resistance for chemicals, acidic liquids and coastal or marine environments, and costs about 15–20% more.",
      },
      {
        q: "Are your SS tankers food grade?",
        a: "Yes. They are made from food-grade stainless steel with a mirror-polished interior and hygienic fabrication.",
      },
      {
        q: "Can SS tankers be insulated?",
        a: "Yes, thermal insulation is available as an option.",
      },
      {
        q: "How long does a stainless steel tanker last?",
        a: "Typical service life is 20+ years for SS 304 and 25+ years for SS 316, with proper use and maintenance.",
      },
    ],
    ctaTitle: "Need a customised stainless steel tanker?",
    ctaText:
      "Our engineering team can design SS tankers to your capacity and application requirements.",
    related: ["chemical-tanker", "water-tanker", "storage-tank"],
  },

  // --------------------------------------------------------------------- Fuel bowser
  {
    slug: "fuel-bowser",
    name: "Fuel Bowser",
    category: "Fuel Bowser",
    metaTitle: "Fuel Bowser Manufacturer | Mobile Diesel Dispensing",
    metaDescription:
      "Mobile fuel bowsers from 500 L to 5000 L with AC, DC or manual pumps, mechanical or digital flow meters and 10–20 m hoses. For construction, mining and fleets.",
    eyebrow: "Fuel Bowser",
    title: "Heavy-duty fuel bowsers for on-site refuelling",
    tagline:
      "Reliable mobile fuel dispensing for construction, mining, agriculture and fleets.",
    image: {
      src: "/images/products/bowser.webp",
      width: 516,
      height: 387,
      alt: "Fuel bowser manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Capacity", value: "500 – 5000 L" },
      { label: "Pump", value: "AC / DC / Manual" },
      { label: "Flow meter", value: "Mechanical / Digital" },
      { label: "Hose", value: "10 – 20 m" },
    ],
    overviewTitle: "Built for mobile fuel distribution",
    overview: [
      "HH FABTECH manufactures fuel bowsers for efficient transportation and dispensing of diesel and other approved fuels.",
      "Built with robust fabrication, they suit construction projects, mining sites, industrial facilities, fleet operators and agricultural applications.",
    ],
    highlights: [
      "Heavy-duty tank construction",
      "High-flow fuel dispensing",
      "Leak-proof design",
      "Easy maintenance",
      "Reliable pump and meter options",
      "Custom built to your requirement",
    ],
    chipGroups: [
      {
        title: "Tank capacities",
        items: ["500 L", "1000 L", "2000 L", "3000 L", "4000 L", "5000 L"],
      },
      {
        title: "Pump options",
        items: ["AC electric pump", "DC battery pump", "Manual rotary pump"],
      },
      {
        title: "Flow meter",
        items: ["Mechanical meter", "Digital flow meter"],
      },
      { title: "Hose length", items: ["10 m", "15 m", "20 m"] },
    ],
    comparison: {
      title: "Fuel bowser options",
      headers: ["Standard", "Premium"],
      highlightSecond: true,
      rows: [
        {
          feature: "Pump",
          a: "Manual / basic electric",
          b: "High-flow electric",
        },
        { feature: "Flow meter", a: "Mechanical", b: "Digital" },
        { feature: "Nozzle", a: "Manual", b: "Automatic shut-off" },
        { feature: "Control panel", a: "Basic", b: "Lockable, weatherproof" },
        {
          feature: "Best suited for",
          a: "Small fleets",
          b: "Commercial fleets and industries",
        },
      ],
    },
    gridSections: [
      {
        title: "Standard accessories",
        description: "Quality accessories supplied with every fuel bowser.",
        items: [
          { title: "Fuel dispensing pump", icon: FuelIcon },
          { title: "Flow meter", icon: GaugeIcon },
          { title: "Automatic nozzle", icon: SprayCanIcon },
          { title: "Fuel hose", icon: WavesIcon },
          { title: "Control panel", icon: PlugZapIcon },
          { title: "Lockable cabinet", icon: LockIcon },
          { title: "Emergency shut-off", icon: OctagonAlertIcon },
          { title: "Fire extinguisher", icon: AlarmSmokeIcon },
        ],
      },
      {
        title: "Applications",
        description: "Ideal for fuel transportation and on-site dispensing.",
        items: [
          { title: "Construction sites", icon: ConstructionIcon },
          { title: "Mining industry", icon: PickaxeIcon },
          { title: "Agriculture", icon: TractorIcon },
          { title: "Fleet refuelling", icon: TruckIcon },
          { title: "Industrial plants", icon: FactoryIcon },
          { title: "Generator fuel supply", icon: ZapIcon },
          { title: "Road projects", icon: RouteIcon },
          { title: "Diesel distribution", icon: DropletIcon },
        ],
      },
    ],
    features: [
      {
        icon: BadgeCheckIcon,
        title: "Premium quality",
        text: "Premium raw materials and strict quality standards.",
      },
      {
        icon: CogIcon,
        title: "Custom design",
        text: "Fuel bowsers built to your chassis, capacity and dispensing needs.",
      },
      {
        icon: TruckIcon,
        title: "Pan India supply",
        text: "Reliable delivery and customer support across India.",
      },
    ],
    faqs: [
      {
        q: "What capacities of fuel bowser are available?",
        a: "Fuel bowsers are available in 500 L, 1000 L, 2000 L, 3000 L, 4000 L and 5000 L capacities.",
      },
      {
        q: "Which pump options can I choose?",
        a: "You can choose an AC electric pump, a DC battery pump or a manual rotary pump, with a mechanical or digital flow meter.",
      },
      {
        q: "What hose lengths are available?",
        a: "Hose lengths of 10, 15 and 20 metres are available, based on your requirement.",
      },
      {
        q: "Where are fuel bowsers used?",
        a: "They are used for on-site refuelling at construction sites, mines, road projects, industrial plants, farms, generator sites and for fleet refuelling.",
      },
    ],
    ctaTitle: "Need a customised fuel bowser?",
    ctaText:
      "We build fuel bowsers to your chassis, tank capacity and dispensing requirements.",
    related: ["petroleum-tanker", "storage-tank", "water-tanker"],
  },

  // --------------------------------------------------------------------- Storage
  {
    slug: "storage-tank",
    name: "Vertical / Capsule Storage Tank",
    category: "Storage Tank",
    metaTitle: "Storage Tank Manufacturer | Vertical & Capsule Tanks",
    metaDescription:
      "Vertical and capsule storage tanks from 5 KL to 40 KL for petroleum, diesel, water, chemicals and lubricants. Hydro tested, leak proof, custom nozzles and accessories.",
    eyebrow: "Storage Tank",
    title: "Vertical & capsule storage tanks",
    tagline:
      "Premium industrial storage tanks for petroleum, water, chemicals and lubricants.",
    image: {
      src: "/images/products/storage.webp",
      width: 1376,
      height: 768,
      alt: "Vertical storage tanks manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Capacity", value: "5 – 40 KL" },
      { label: "Structure", value: "Vertical / Capsule" },
      { label: "Testing", value: "Hydro tested" },
      { label: "Nozzles", value: "Custom" },
    ],
    overviewTitle: "Industrial storage tanks",
    overview: [
      "HH FABTECH manufactures vertical and capsule storage tanks for petroleum, diesel, water, chemicals, lubricants and other industrial liquids.",
      "Tanks are fabricated from quality materials with precision welding, hydro testing and protective coatings for durability, safety and long service life.",
    ],
    highlights: [
      "Heavy-duty construction",
      "Leak-proof design",
      "Corrosion-resistant coating",
      "High-strength welding",
      "Long service life",
      "Custom inlet and outlet connections",
      "Easy maintenance",
      "Built to your requirement",
    ],
    chipGroups: [
      {
        title: "Available capacities",
        items: [
          "5 KL",
          "10 KL",
          "15 KL",
          "20 KL",
          "25 KL",
          "30 KL",
          "35 KL",
          "40 KL",
        ],
      },
      {
        title: "Available structures",
        items: ["Vertical storage tank", "Capsule storage tank"],
      },
    ],
    comparison: {
      title: "Vertical vs capsule storage tank",
      description:
        "Choose the right tank for your installation and requirements.",
      headers: ["Vertical tank", "Capsule tank"],
      rows: [
        {
          feature: "Installation",
          a: "Fixed RCC foundation",
          b: "Saddle-mounted foundation",
        },
        {
          feature: "Floor space",
          a: "Requires less area",
          b: "Requires more area",
        },
        { feature: "Capacity range", a: "5 KL – 40 KL", b: "5 KL – 40 KL" },
        {
          feature: "Best suited for",
          a: ["Water", "Chemicals", "Process liquids"],
          b: ["Petroleum", "Diesel", "Oil storage"],
        },
        { feature: "Maintenance", a: "Easy", b: "Easy" },
        { feature: "Durability", a: "Excellent", b: "Excellent" },
      ],
    },
    gridSections: [
      {
        title: "Optional accessories & customisation",
        description: "Accessories provided as per your requirement.",
        items: [
          { title: "Manhole" },
          { title: "Level indicator" },
          { title: "Vent pipe" },
          { title: "Breather valve" },
          { title: "Drain valve" },
          { title: "Outlet valve" },
          { title: "Top platform" },
          { title: "Safety handrail" },
          { title: "Ladder" },
          { title: "Level gauge" },
          { title: "Insulation" },
          { title: "Custom nozzles" },
        ],
      },
      {
        title: "Industries we serve",
        items: [
          { title: "Petroleum industry", icon: FuelIcon },
          { title: "Chemical plants", icon: FlaskConicalIcon },
          { title: "Water storage", icon: DropletIcon },
          { title: "Food processing", icon: MilkIcon },
          { title: "Lubricant industry", icon: WrenchIcon },
          { title: "Industrial plants", icon: FactoryIcon },
        ],
      },
    ],
    features: [
      {
        icon: FactoryIcon,
        title: "Heavy-duty fabrication",
        text: "Premium raw materials with precision engineering.",
      },
      {
        icon: ShieldCheckIcon,
        title: "Leak-proof construction",
        text: "Hydro-tested tanks for complete safety and reliability.",
      },
      {
        icon: CogIcon,
        title: "Custom manufacturing",
        text: "Built to your capacity and application requirements.",
      },
    ],
    faqs: [
      {
        q: "What sizes of storage tank do you manufacture?",
        a: "Vertical and capsule storage tanks are available from 5 KL to 40 KL, in 5 KL steps.",
      },
      {
        q: "Should I choose a vertical or a capsule storage tank?",
        a: "Vertical tanks sit on a fixed RCC foundation and need less floor space, and suit water, chemicals and process liquids. Capsule tanks are saddle mounted, need more area and are typically used for petroleum, diesel and oil storage.",
      },
      {
        q: "Which accessories can be added?",
        a: "Manhole, level indicator or gauge, vent pipe, breather valve, drain and outlet valves, top platform, safety handrail, ladder, insulation and custom nozzles.",
      },
      {
        q: "Are the storage tanks tested?",
        a: "Yes. Tanks are hydro tested for leak-proof, safe and reliable storage.",
      },
    ],
    ctaTitle: "Need a customised storage tank?",
    ctaText:
      "Contact us for industrial storage tanks manufactured to your exact specifications.",
    related: ["petroleum-tanker", "chemical-tanker", "water-tanker"],
  },

  // --------------------------------------------------------------------- Water
  {
    slug: "water-tanker",
    name: "Water Tanker",
    category: "Water Tanker",
    metaTitle: "Water Tanker Manufacturer | Municipal & Industrial",
    metaDescription:
      "Water tankers from 5 KL to 20 KL in mild or stainless steel for municipal supply, construction, mining, farms and industry. Leak-proof, anti-corrosion coated.",
    eyebrow: "Water Tanker",
    title: "Heavy-duty water tankers",
    tagline:
      "Reliable water transportation for municipalities, construction, industry and agriculture.",
    image: {
      src: "/images/products/water.webp",
      width: 750,
      height: 600,
      alt: "Water tanker manufactured by HH FABTECH",
    },
    keySpecs: [
      { label: "Capacity", value: "5 – 20 KL" },
      { label: "Material", value: "MS / SS" },
      { label: "Coating", value: "Anti-corrosion" },
      { label: "Mounting", value: "Heavy-duty" },
    ],
    overviewTitle: "Built for every water application",
    overview: [
      "HH FABTECH manufactures water tankers for municipal corporations, construction sites, industrial applications, mining operations and agriculture.",
      "Every tanker is fabricated with precision welding, anti-corrosion treatment and quality painting for a long, reliable service life.",
    ],
    highlights: [
      "High-strength mild steel construction",
      "Leak-proof welded tank",
      "Heavy-duty chassis mounting",
      "Anti-corrosion internal coating",
      "Long service life",
      "Easy maintenance",
    ],
    chipGroups: [
      {
        title: "Tank capacities",
        items: ["5 KL", "8 KL", "10 KL", "12 KL", "16 KL", "20 KL"],
      },
      {
        title: "Tank material",
        items: ["Mild steel (MS)", "Stainless steel (SS)"],
      },
    ],
    comparison: {
      title: "Material comparison",
      headers: ["Mild steel", "Stainless steel"],
      rows: [
        {
          feature: "Best for",
          a: "Construction, municipality",
          b: "Food grade and drinking water",
        },
        { feature: "Corrosion resistance", a: "Good", b: "Excellent" },
        { feature: "Maintenance", a: "Low", b: "Very low" },
        { feature: "Cost", a: "Economical", b: "Premium" },
      ],
    },
    gridSections: [
      {
        title: "Applications",
        description: "Designed for a wide range of water transportation needs.",
        items: [
          { title: "Construction sites", icon: ConstructionIcon },
          { title: "Municipal water supply", icon: BuildingIcon },
          { title: "Agriculture irrigation", icon: SproutIcon },
          { title: "Industrial plants", icon: FactoryIcon },
          { title: "Mining projects", icon: MountainIcon },
          { title: "Roadside plantation", icon: TreesIcon },
          { title: "Emergency water supply", icon: FlameIcon },
          { title: "Road cleaning", icon: BrushIcon },
        ],
      },
    ],
    features: [
      {
        icon: BadgeCheckIcon,
        title: "Premium quality",
        text: "Premium raw materials and strict quality standards.",
      },
      {
        icon: CogIcon,
        title: "Custom design",
        text: "Tankers built to your exact requirements.",
      },
      {
        icon: TruckIcon,
        title: "Pan India supply",
        text: "Reliable delivery and customer support across India.",
      },
    ],
    faqs: [
      {
        q: "What capacities of water tanker are available?",
        a: "Water tankers are available in 5, 8, 10, 12, 16 and 20 KL capacities.",
      },
      {
        q: "Mild steel or stainless steel: which should I choose?",
        a: "Mild steel is economical and suits construction and municipal use. Stainless steel offers excellent corrosion resistance and very low maintenance, and is preferred for food-grade and drinking water.",
      },
      {
        q: "Is the tank protected against corrosion?",
        a: "Yes. Tanks get an anti-corrosion internal coating and quality painting.",
      },
    ],
    ctaTitle: "Need a custom water tanker?",
    ctaText:
      "Our engineering team can manufacture water tankers to your exact requirements.",
    related: ["ss-tanker", "fuel-bowser", "storage-tank"],
  },
];

export function getProductDetail(slug: string): ProductDetail {
  const p = productDetails.find((d) => d.slug === slug);
  if (!p) throw new Error(`Unknown product: ${slug}`);
  return p;
}
