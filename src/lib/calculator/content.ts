/** SEO copy for the calculator page. Carried over from the legacy site, lightly edited. */

export const HOW_TO = [
  {
    title: "Horizontal cylinder",
    text: "Volume = π × r² × L. At liquid depth h, the end area is a circular segment: r² × arccos((r − h) ÷ r) − (r − h) × √(2rh − h²), multiplied by L.",
  },
  {
    title: "Vertical cylinder",
    text: "Volume = π × r² × height. Liquid volume = π × r² × fill depth.",
  },
  {
    title: "Rectangular tank",
    text: "Volume = length × width × height. With roll-bent edges, subtract (4 − π) × R² from the cross-section area.",
  },
  {
    title: "Sphere and hemisphere",
    text: "Sphere = 4/3 × π × r³. A liquid cap of depth h holds π × h² × (3r − h) ÷ 3.",
  },
  {
    title: "Conical-bottom tank",
    text: "Cone = 1/3 × π × r² × cone height, plus the straight shell π × r² × shell height, plus an optional embossed top of 2/3 × π × r² × E.",
  },
  {
    title: "Dished and embossed ends",
    text: "Each dished end adds about 2/3 × cross-section area × dish depth. Capsule ends add one full sphere between them.",
  },
] as const;

export const FAQS = [
  {
    q: "How do I calculate the volume of a tank in litres?",
    a: "Enter the internal dimensions of the tank, choose the matching shape and the calculator returns the capacity in litres, KL, m³, cubic feet and gallons. For a plain cylinder the volume is π × radius² × length, and 1 m³ equals 1,000 litres.",
  },
  {
    q: "How do I calculate the volume of a partially filled horizontal tank?",
    a: "Enter the fill depth or fill percentage. The liquid cross-section is a circular segment, with area r² × arccos((r − h) ÷ r) − (r − h) × √(2rh − h²), where r is the radius and h is the liquid depth. Multiply that area by the tank length. The calculator does this for you, including for oval, Spell, stadium and capsule shapes.",
  },
  {
    q: "Which tank shapes does the calculator support?",
    a: "Spell (HH FABTECH truck profile), circle and oval cylinders, vertical cylinders, rectangular tanks with optional rounded edges, spheres, stadium ovals, horizontal capsules, tanks with 2:1 ellipsoidal dished ends, hemisphere or dished bowls, and conical-bottom tanks with a flat or embossed top.",
  },
  {
    q: "Does the calculator include dished or embossed ends?",
    a: "Yes. For the Spell, circle and oval shapes, and for the conical-bottom tank, you can tick the embossed dish end option and enter the emboss depth (150 mm by default). Each end is modelled as a half-ellipsoid, adding about two-thirds of the cross-section area times the depth, and the liquid in the dish is counted at partial fill levels as well as when the tank is full.",
  },
  {
    q: "How many gallons are in a cubic metre or in 1,000 litres?",
    a: "One cubic metre is 1,000 litres, which is 264.17 US gallons or 219.97 imperial gallons.",
  },
  {
    q: "Can I find a tank dimension from the capacity I need?",
    a: "Yes. Open Advanced and use the dimension solver: enter the target capacity, choose which dimension to solve for, and the calculator returns the length, diameter or height needed while keeping the other dimensions fixed.",
  },
  {
    q: "How accurate is the tank volume calculator?",
    a: "The results are exact for the ideal internal geometry that you enter. Shell thickness, fittings, nozzles, ullage and manufacturing tolerances are not included, so use it for estimates and confirm final capacities with the manufacturer.",
  },
  {
    q: "Is the tank volume calculator free?",
    a: "Yes. It is free to use, needs no sign-up and works on phones, tablets and computers.",
  },
] as const;
