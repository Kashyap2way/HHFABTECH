/** Contact form link that preselects the product (read by ContactForm via ?product=). */
export function inquiryHref(productName: string): string {
  return `/contact?product=${encodeURIComponent(productName)}#inquiry`;
}
