"use client";

import { ClockIcon, MailIcon, MenuIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrackedAnchor, TrackedLink } from "@/components/analytics/TrackedLink";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  contact,
  isActivePath,
  type NavItem,
  navLinks,
  whatsappHref,
} from "@/lib/site";
import { cn } from "@/lib/utils";

function NavBadge({ children }: { children: string }) {
  return (
    <span className="ml-1.5 rounded-full bg-gold px-2 py-0.5 align-middle text-[10px] leading-none font-bold tracking-wider text-brand-dark uppercase">
      {children}
    </span>
  );
}

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <TrackedLink
      href={item.href}
      aria-current={active ? "page" : undefined}
      event={{ name: "cta_click", label: item.label, location: "header_nav" }}
      className={cn(
        "relative inline-flex items-center py-2 text-[15px] font-semibold whitespace-nowrap transition-colors xl:text-base",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform hover:text-gold-dark hover:after:scale-x-100 focus-visible:text-gold-dark focus-visible:after:scale-x-100",
        active ? "text-gold-dark after:scale-x-100" : "text-brand",
      )}
    >
      {item.label}
      {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
    </TrackedLink>
  );
}

/** Slim contact strip above the header. Laptop and up only; mobile gets the same links in the drawer. */
function TopBar() {
  return (
    <div className="hidden bg-brand-deep text-[13px] text-white/90 lg:block">
      <div className="flex h-9 w-full items-center justify-between px-5 sm:px-6 lg:px-10 2xl:px-16">
        <ul className="flex items-center gap-6">
          {contact.people.map((p) => (
            <li key={p.tel}>
              <TrackedAnchor
                href={`tel:${p.tel}`}
                event={{
                  name: "contact_click",
                  method: "phone",
                  location: "header_topbar",
                }}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-gold"
              >
                <PhoneIcon aria-hidden="true" className="size-3.5" />
                <span className="sr-only">{p.name}: </span>
                {p.display}
              </TrackedAnchor>
            </li>
          ))}
          <li>
            <TrackedAnchor
              href={`mailto:${contact.email}`}
              event={{
                name: "contact_click",
                method: "email",
                location: "header_topbar",
              }}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gold"
            >
              <MailIcon aria-hidden="true" className="size-3.5" />
              {contact.email}
            </TrackedAnchor>
          </li>
        </ul>
        <p className="inline-flex items-center gap-1.5 text-white/75">
          <ClockIcon aria-hidden="true" className="size-3.5" />
          {contact.hours.days}, {contact.hours.time}
        </p>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // The drawer only exists below `lg`; close it if the viewport grows past that
  // (e.g. rotating a tablet) so no overlay is left behind.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 border-b border-brand/10 bg-white/90 shadow-[0_10px_30px_-18px_rgb(21_15_38/0.25)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="flex h-[var(--header-h)] w-full items-center justify-between gap-4 px-5 sm:px-6 lg:px-10 2xl:px-16">
          <TrackedLink
            href="/"
            aria-label="HH FABTECH, go to home page"
            event={{ name: "cta_click", label: "Logo", location: "header" }}
            className="shrink-0 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Image
              src="/images/logo-transparent.webp"
              alt="HH FABTECH"
              width={432}
              height={240}
              sizes="(min-width: 1024px) 115px, (min-width: 768px) 100px, 90px"
              className="h-12 w-auto md:h-14 lg:h-16"
            />
          </TrackedLink>

          {/* Laptop and desktop: inline navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-9">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <DesktopNavLink
                    item={item}
                    active={isActivePath(pathname, item)}
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop: primary conversion button */}
            <TrackedLink
              href="/contact#inquiry"
              event={{
                name: "cta_click",
                label: "Request a Quote",
                location: "header",
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "hidden h-10 rounded-full px-5 text-sm font-semibold hover:bg-gold hover:text-brand-dark xl:inline-flex",
              )}
            >
              Request a Quote
            </TrackedLink>

            {/* Mobile and tablet: drawer */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Open menu"
                    className="text-brand lg:hidden [&_svg:not([class*='size-'])]:size-6"
                  />
                }
              >
                <MenuIcon aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85%] gap-0 p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="text-brand">HH FABTECH</SheetTitle>
                  <SheetDescription>
                    Tanker manufacturers, Ahmedabad
                  </SheetDescription>
                </SheetHeader>

                <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-2">
                  <ul>
                    {navLinks.map((item) => {
                      const active = isActivePath(pathname, item);
                      return (
                        <li
                          key={item.href}
                          className="border-b border-border/60 last:border-0"
                        >
                          <TrackedLink
                            href={item.href}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            event={{
                              name: "cta_click",
                              label: item.label,
                              location: "header_drawer",
                            }}
                            className={cn(
                              "flex min-h-12 items-center rounded-md px-3 text-base font-semibold transition-colors hover:bg-muted",
                              active
                                ? "bg-brand/5 text-gold-dark"
                                : "text-brand",
                            )}
                          >
                            {item.label}
                            {item.badge ? (
                              <NavBadge>{item.badge}</NavBadge>
                            ) : null}
                          </TrackedLink>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="grid gap-2 border-t p-4">
                  <TrackedLink
                    href="/contact#inquiry"
                    onClick={close}
                    event={{
                      name: "cta_click",
                      label: "Request a Quote",
                      location: "header_drawer",
                    }}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 rounded-full bg-gold text-base font-semibold text-brand-dark hover:bg-gold-light",
                    )}
                  >
                    Request a Quote
                  </TrackedLink>
                  <div className="grid grid-cols-2 gap-2">
                    <TrackedAnchor
                      href={`tel:${contact.people[0].tel}`}
                      event={{
                        name: "contact_click",
                        method: "phone",
                        location: "header_drawer",
                      }}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-11",
                      )}
                    >
                      <PhoneIcon aria-hidden="true" />
                      Call
                    </TrackedAnchor>
                    <TrackedAnchor
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      event={{
                        name: "contact_click",
                        method: "whatsapp",
                        location: "header_drawer",
                      }}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-11",
                      )}
                    >
                      WhatsApp
                    </TrackedAnchor>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
