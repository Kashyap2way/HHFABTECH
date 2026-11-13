import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * Poppins via next/font/google: downloaded at build time and self-hosted by
 * Next.js (no runtime request to Google). Only the weights the design uses.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const defaultTitle =
  "HH FABTECH | Petroleum, Chemical, SS & Water Tanker Manufacturer";
const defaultDescription =
  "HH FABTECH is a leading manufacturer of Petroleum Tankers, Chemical Tankers, SS Tankers, Water Tankers, Fuel Bowsers and Storage Tanks based in Ahmedabad, Gujarat.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: defaultTitle, template: `%s | ${SITE_NAME}` },
  description: defaultDescription,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "Petroleum Tanker Manufacturer",
    "Diesel Tanker",
    "Chemical Tanker",
    "SS Tanker",
    "Water Tanker",
    "Fuel Bowser",
    "Storage Tank",
    "Ahmedabad",
    "Gujarat",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: false },
  icons: { apple: "/images/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: defaultTitle,
    description:
      "Leading manufacturer of Petroleum, Chemical, SS, Water Tankers, Fuel Bowsers and Storage Tanks based in Ahmedabad, Gujarat.",
    images: [
      {
        url: "/images/products/petroleum.webp",
        alt: "HH FABTECH Petroleum Tanker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    images: ["/images/products/petroleum.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#43236f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={poppins.variable}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        {/* Site chrome lives in (site)/layout.tsx; /studio renders without it. */}
        {children}
      </body>
    </html>
  );
}
