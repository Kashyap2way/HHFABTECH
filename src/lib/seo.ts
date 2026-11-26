import { contact, SITE_NAME, SITE_URL } from "./site";

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/images/logo.png`,
      logo: `${SITE_URL}/images/logo.png`,
      telephone: "+91-9879111233",
      email: contact.email,
      description:
        "Manufacturer of Petroleum, Diesel, Chemical, SS, Water Tankers, Fuel Bowsers and Storage Tanks in Ahmedabad, Gujarat.",
      address: { "@type": "PostalAddress", ...contact.postal },
      geo: { "@type": "GeoCoordinates", ...contact.geo },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
      contactPoint: contact.people.map((p) => ({
        "@type": "ContactPoint",
        contactType: "sales",
        name: p.name,
        telephone: p.tel.replace(/^\+91/, "+91-"),
        areaServed: "IN",
        availableLanguage: ["en", "hi", "gu"],
      })),
      areaServed: "IN",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
  ],
};

export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
