import { ProductPage } from "@/components/product/ProductPage";
import { productMetadata } from "@/lib/product-seo";

const slug = "petroleum-tanker";

export const metadata = productMetadata(slug);

export default function Page() {
  return <ProductPage slug={slug} />;
}
