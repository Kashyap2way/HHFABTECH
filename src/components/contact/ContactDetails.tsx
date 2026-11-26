import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { TrackedAnchor } from "@/components/analytics/TrackedLink";
import { contact, whatsappHref } from "@/lib/site";

function Row({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/[0.07] text-brand">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        <div className="mt-1 text-[15px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

const linkClass =
  "font-medium text-brand transition-colors hover:text-gold-dark";

/** Contact channels and factory address, all tracked as contact conversions. */
export function ContactDetails() {
  return (
    <address className="grid gap-6 not-italic">
      <Row
        icon={<PhoneIcon aria-hidden="true" className="size-5" />}
        title="Call us"
      >
        <ul className="grid gap-1">
          {contact.people.map((p) => (
            <li key={p.tel}>
              {p.name}:{" "}
              <TrackedAnchor
                href={`tel:${p.tel}`}
                event={{
                  name: "contact_click",
                  method: "phone",
                  location: "contact_page",
                }}
                className={`${linkClass} whitespace-nowrap`}
              >
                {p.display}
              </TrackedAnchor>
            </li>
          ))}
        </ul>
      </Row>

      <Row
        icon={<MessageCircleIcon aria-hidden="true" className="size-5" />}
        title="WhatsApp"
      >
        <TrackedAnchor
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          event={{
            name: "contact_click",
            method: "whatsapp",
            location: "contact_page",
          }}
          className={linkClass}
        >
          Chat with our sales team
          <span className="sr-only"> (opens WhatsApp)</span>
        </TrackedAnchor>
      </Row>

      <Row
        icon={<MailIcon aria-hidden="true" className="size-5" />}
        title="Email"
      >
        <TrackedAnchor
          href={`mailto:${contact.email}`}
          event={{
            name: "contact_click",
            method: "email",
            location: "contact_page",
          }}
          className={`${linkClass} break-all`}
        >
          {contact.email}
        </TrackedAnchor>
      </Row>

      <Row
        icon={<MapPinIcon aria-hidden="true" className="size-5" />}
        title="Factory address"
      >
        <TrackedAnchor
          href={contact.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          event={{
            name: "contact_click",
            method: "map",
            location: "contact_page",
          }}
          className="transition-colors hover:text-brand"
        >
          {contact.addressLines.map((line, i) => (
            <span key={line}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
          <span className="sr-only"> (opens in Google Maps)</span>
        </TrackedAnchor>
      </Row>

      <Row
        icon={<ClockIcon aria-hidden="true" className="size-5" />}
        title="Business hours"
      >
        <p>
          {contact.hours.days}
          <br />
          {contact.hours.time}
        </p>
      </Row>
    </address>
  );
}
