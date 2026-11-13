/** Single source of truth for site-wide constants (identity, contact, navigation, SEO). */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hhfabtech.com"
).replace(/\/$/, "");

export const SITE_NAME = "HH FABTECH";

/** Static on purpose: reading the clock during prerender is not allowed with Cache Components. */
export const COPYRIGHT_YEAR = 2026;

export const contact = {
  email: "hhfabtech@gmail.com",
  people: [
    { name: "Devarsh Patel", display: "+91 98791 11233", tel: "+919879111233" },
    {
      name: "Kashyap Mistry",
      display: "+91 99986 90388",
      tel: "+919998690388",
    },
  ],
  whatsappNumber: "919879111233",
  whatsappMessage:
    "Hello HH FABTECH, I would like to know more about your tankers.",
  mapsUrl: "https://maps.app.goo.gl/byFU6Hq3dxLh6ciT8",
  geo: { latitude: 22.94689, longitude: 72.477773 },
  hours: { days: "Monday - Saturday", time: "9:00 AM - 7:00 PM" },
  addressLines: [
    "Final Plot No. 18/2 TP No. 403/A,",
    "Survey No. 329B/1 Paiky 2-2387,",
    "Near Sanathal Circle Road, Fatewadi Canal,",
    "Sanathal, Sanand, Ahmedabad, Gujarat - 382210",
  ],
  postal: {
    streetAddress:
      "Final Plot No.18/2 TP No.403/A, Survey No.329B/1 Paiky 2-2387, Near Sanathal Circle Road, Fatewadi Canal, Sanathal, Sanand",
    addressLocality: "Ahmedabad",
    addressRegion: "Gujarat",
    postalCode: "382210",
    addressCountry: "IN",
  },
} as const;

export const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
  contact.whatsappMessage,
)}`;

export type NavItem = {
  href: string;
  label: string;
  badge?: string;
  /** Extra path prefixes that should mark this item active (e.g. product pages). */
  matches?: readonly string[];
};

export const productLinks: readonly NavItem[] = [
  { href: "/petroleum-tanker", label: "Petroleum / Diesel Tanker" },
  { href: "/chemical-tanker", label: "Chemical Tanker" },
  { href: "/ss-tanker", label: "SS Tanker" },
  { href: "/fuel-bowser", label: "Fuel Bowser" },
  { href: "/storage-tank", label: "Storage Tank" },
  { href: "/water-tanker", label: "Water Tanker" },
];

export const navLinks: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  {
    href: "/products",
    label: "Products",
    matches: productLinks.map((p) => p.href),
  },
  { href: "/calculator", label: "Calculator", badge: "New" },
  { href: "/contact", label: "Contact Us" },
];

export const footerCompanyLinks: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/calculator", label: "Tank Volume Calculator" },
  { href: "/blog", label: "Blog" },
  { href: "/career", label: "Careers" },
  { href: "/contact", label: "Contact Us" },
];

export function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.matches?.some((m) => pathname === m) ?? false)
  );
}
