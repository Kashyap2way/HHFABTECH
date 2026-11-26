/** The 11 supported shapes: UI metadata (fields, defaults, copy). */

export type ShapeId =
  | "spell"
  | "circle"
  | "oval"
  | "verticalCylinder"
  | "rectangular"
  | "sphere"
  | "stadium"
  | "capsuleHorizontal"
  | "ellipsoidalHeadsHorizontal"
  | "dishBowl"
  | "coneBottom";

export type Field = {
  /** Dimension key used by the model */
  key: string;
  label: string;
  /** Short symbol shown in the label meta */
  symbol: string;
  hint?: string;
  /** Example value in mm */
  defaultMm: number;
};

/** An optional feature toggled by a checkbox (stored as a dimension key; 0 when off). */
export type ToggleOption = {
  key: string;
  label: string;
  description: string;
  field: Field;
  defaultOn: boolean;
};

export type ShapeMeta = {
  id: ShapeId;
  name: string;
  tag: string;
  description: string;
  /** Lying on its side: supports baffles and the dish-end option */
  horizontal: boolean;
  /** Has a 2D cross-section profile (weight, sheet length and corner marks apply) */
  hasProfile: boolean;
  fields: readonly Field[];
  option?: ToggleOption;
};

const L = (label = "Straight shell length", defaultMm = 6000): Field => ({
  key: "L",
  label,
  symbol: "L",
  defaultMm,
});

const emboss: ToggleOption = {
  key: "E",
  label: "Embossed dish ends",
  description: "Include the volume of both front and rear dish ends.",
  defaultOn: true,
  field: {
    key: "E",
    label: "Emboss depth per end",
    symbol: "E",
    hint: "150 mm is the HH FABTECH standard.",
    defaultMm: 150,
  },
};

export const SHAPES: readonly ShapeMeta[] = [
  {
    id: "spell",
    name: "Spell cylinder",
    tag: "HH FABTECH profile",
    description:
      "Truck-optimised rectangle with four circular-arc blends and 70 mm rounded corners.",
    horizontal: true,
    hasProfile: true,
    fields: [
      L(),
      { key: "W", label: "Overall width", symbol: "W", defaultMm: 2400 },
      { key: "H", label: "Overall height", symbol: "H", defaultMm: 1830 },
    ],
    option: emboss,
  },
  {
    id: "circle",
    name: "Circle cylinder",
    tag: "Standard round tank",
    description: "Standard cylindrical tank with a circular cross-section.",
    horizontal: true,
    hasProfile: true,
    fields: [
      L("Straight shell length", 3000),
      { key: "D", label: "Diameter", symbol: "D", defaultMm: 1200 },
    ],
    option: emboss,
  },
  {
    id: "oval",
    name: "Oval cylinder",
    tag: "Elliptical profile",
    description: "Elliptical cross-section with independent width and height.",
    horizontal: true,
    hasProfile: true,
    fields: [
      L("Straight shell length", 4000),
      { key: "W", label: "Overall width", symbol: "W", defaultMm: 2000 },
      { key: "H", label: "Overall height", symbol: "H", defaultMm: 1400 },
    ],
    option: emboss,
  },
  {
    id: "verticalCylinder",
    name: "Vertical cylinder",
    tag: "Upright round tank",
    description: "A standing tank with a flat floor and flat roof.",
    horizontal: false,
    hasProfile: false,
    fields: [
      { key: "D", label: "Internal diameter", symbol: "D", defaultMm: 1000 },
      {
        key: "H",
        label: "Internal height",
        symbol: "H",
        hint: "Inside floor to inside roof.",
        defaultMm: 1800,
      },
    ],
  },
  {
    id: "rectangular",
    name: "Rectangular tank",
    tag: "Box-shaped, optional rounded edges",
    description: "Box-shaped tank. Add a corner radius for roll-bent plate.",
    horizontal: false,
    hasProfile: true,
    fields: [
      L("Internal length", 2000),
      { key: "W", label: "Internal width", symbol: "W", defaultMm: 1000 },
      { key: "H", label: "Internal height", symbol: "H", defaultMm: 1000 },
    ],
    option: {
      key: "R",
      label: "Round the edges",
      description:
        "For roll-bent plate. 70 mm is half the 140 mm roll-bend machine.",
      defaultOn: false,
      field: { key: "R", label: "Corner radius", symbol: "R", defaultMm: 70 },
    },
  },
  {
    id: "sphere",
    name: "Sphere",
    tag: "Ball-shaped vessel",
    description:
      "Liquid forms a spherical cap whose size depends on the fill depth.",
    horizontal: false,
    hasProfile: false,
    fields: [
      { key: "D", label: "Internal diameter", symbol: "D", defaultMm: 1000 },
    ],
  },
  {
    id: "stadium",
    name: "Stadium oval",
    tag: "Flat top and bottom, round sides",
    description:
      "Flat top and bottom with semicircular sides. Width must be at least the height.",
    horizontal: true,
    hasProfile: true,
    fields: [
      L("Internal length", 3000),
      {
        key: "W",
        label: "Overall width",
        symbol: "W",
        hint: "Must be at least the height.",
        defaultMm: 2400,
      },
      { key: "H", label: "Overall height", symbol: "H", defaultMm: 1600 },
    ],
  },
  {
    id: "capsuleHorizontal",
    name: "Capsule (horizontal)",
    tag: "Cylinder with half-sphere ends",
    description:
      "A tube closed by two hemispheres. Length is the straight section only.",
    horizontal: true,
    hasProfile: false,
    fields: [
      { key: "D", label: "Internal diameter", symbol: "D", defaultMm: 1000 },
      {
        key: "Lc",
        label: "Straight section length",
        symbol: "Lc",
        hint: "Hemispheres add one sphere in total.",
        defaultMm: 2000,
      },
    ],
  },
  {
    id: "ellipsoidalHeadsHorizontal",
    name: "2:1 ellipsoidal heads",
    tag: "Cylinder with dished elliptical ends",
    description:
      "Horizontal shell with elliptical dished ends. Length is measured end to end.",
    horizontal: true,
    hasProfile: false,
    fields: [
      { key: "D", label: "Internal diameter", symbol: "D", defaultMm: 1000 },
      {
        key: "L",
        label: "Overall length, end to end",
        symbol: "L",
        defaultMm: 2400,
      },
      {
        key: "E",
        label: "Dish depth per end",
        symbol: "E",
        hint: "A true 2:1 head is D ÷ 4 deep.",
        defaultMm: 250,
      },
    ],
  },
  {
    id: "dishBowl",
    name: "Hemisphere / dish",
    tag: "Dished bowl opening upward",
    description:
      "A spherical cap. Use half the diameter as depth for a full hemisphere.",
    horizontal: false,
    hasProfile: false,
    fields: [
      {
        key: "D",
        label: "Diameter across the opening",
        symbol: "D",
        defaultMm: 1600,
      },
      { key: "E", label: "Depth of the dish", symbol: "E", defaultMm: 700 },
    ],
  },
  {
    id: "coneBottom",
    name: "Conical-bottom tank",
    tag: "Cone below, cylinder above",
    description:
      "Cone below, cylindrical shell above and an optional embossed top.",
    horizontal: false,
    hasProfile: false,
    fields: [
      { key: "D", label: "Internal diameter", symbol: "D", defaultMm: 1200 },
      {
        key: "Hc",
        label: "Cone length (height)",
        symbol: "Hc",
        defaultMm: 900,
      },
      { key: "Hs", label: "Shell length", symbol: "Hs", defaultMm: 1500 },
    ],
    option: {
      key: "E",
      label: "Embossed top",
      description: "Dish depth of the top end. Untick for a flat top.",
      defaultOn: true,
      field: { key: "E", label: "Emboss depth", symbol: "E", defaultMm: 150 },
    },
  },
];

export const SHAPE_BY_ID = Object.fromEntries(
  SHAPES.map((s) => [s.id, s]),
) as Record<ShapeId, ShapeMeta>;
