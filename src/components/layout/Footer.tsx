import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";
import { TrackedAnchor, TrackedLink } from "@/components/analytics/TrackedLink";
import {
  COPYRIGHT_YEAR,
  contact,
  footerCompanyLinks,
  productLinks,
  SITE_NAME,
} from "@/lib/site";

const linkClass =
  "inline-block py-1 text-[#ddd] transition-all duration-300 hover:translate-x-1 hover:text-gold focus-visible:text-gold";

function FooterHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-base font-semibold tracking-wide text-gold uppercase">
      {children}
    </h2>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-deep text-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 sm:px-6 lg:px-10 2xl:px-12 py-12 sm:grid-cols-2 md:py-14 lg:grid-cols-[1.5fr_1fr_1.2fr_1.5fr] lg:gap-12 lg:py-16 xl:gap-16">
        {/* Brand */}
        <section
          aria-label="About HH FABTECH"
          className="sm:col-span-2 lg:col-span-1"
        >
          <Image
            src="/images/logo-light.webp"
            alt="HH FABTECH"
            width={432}
            height={240}
            className="mb-4 h-20 w-auto md:h-24"
          />
          <p className="max-w-md leading-relaxed text-[#d7d7d7]">
            {SITE_NAME} is a trusted manufacturer of petroleum, chemical,
            stainless steel and water tankers, fuel bowsers and storage tanks,
            committed to quality, innovation and customer satisfaction.
          </p>
        </section>

        {/* Company */}
        <nav aria-label="Footer navigation">
          <FooterHeading>Quick Links</FooterHeading>
          <ul>
            {footerCompanyLinks.map((link) => (
              <li key={link.href}>
                <TrackedLink
                  href={link.href}
                  event={{
                    name: "cta_click",
                    label: link.label,
                    location: "footer_nav",
                  }}
                  className={linkClass}
                >
                  {link.label}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Products: internal links for crawlers and users */}
        <nav aria-label="Products">
          <FooterHeading>Our Products</FooterHeading>
          <ul>
            {productLinks.map((link) => (
              <li key={link.href}>
                <TrackedLink
                  href={link.href}
                  event={{
                    name: "cta_click",
                    label: link.label,
                    location: "footer_products",
                    product: link.label,
                  }}
                  className={linkClass}
                >
                  {link.label}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <section
          aria-label="Contact details"
          className="sm:col-span-2 lg:col-span-1"
        >
          <FooterHeading>Contact</FooterHeading>
          <address className="space-y-4 text-[#ddd] not-italic">
            <p className="flex gap-3">
              <MapPinIcon
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-gold"
              />
              <TrackedAnchor
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                event={{
                  name: "contact_click",
                  method: "map",
                  location: "footer",
                }}
                className="leading-relaxed transition-colors hover:text-white"
              >
                {contact.addressLines.map((line, i) => (
                  <span key={line}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
                <span className="sr-only"> (opens in Google Maps)</span>
              </TrackedAnchor>
            </p>
            <p className="flex items-center gap-3">
              <MailIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-gold"
              />
              <TrackedAnchor
                href={`mailto:${contact.email}`}
                event={{
                  name: "contact_click",
                  method: "email",
                  location: "footer",
                }}
                className="break-all transition-colors hover:text-white"
              >
                {contact.email}
              </TrackedAnchor>
            </p>
            {contact.people.map((p) => (
              <p key={p.tel} className="flex items-center gap-3">
                <PhoneIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-gold"
                />
                <span>
                  {p.name}:{" "}
                  <TrackedAnchor
                    href={`tel:${p.tel}`}
                    event={{
                      name: "contact_click",
                      method: "phone",
                      location: "footer",
                    }}
                    className="whitespace-nowrap transition-colors hover:text-white"
                  >
                    {p.display}
                  </TrackedAnchor>
                </span>
              </p>
            ))}
            <p className="pl-7 text-sm text-[#bbb]">
              {contact.hours.days}, {contact.hours.time}
            </p>
          </address>
        </section>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-[#bbb]">
        <small>
          © {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
