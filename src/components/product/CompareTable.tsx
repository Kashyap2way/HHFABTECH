import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Cell, Comparison } from "@/lib/product-details";
import { cn } from "@/lib/utils";

function CellContent({ value }: { value: Cell }) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <ul className="list-disc space-y-1 pl-4 marker:text-gold-dark">
      {value.map((v) => (
        <li key={v}>{v}</li>
      ))}
    </ul>
  );
}

/** Semantic comparison table (real <table> with caption, th scope). Scrolls sideways on phones. */
export function CompareTable({
  data,
  tone = "white",
}: {
  data: Comparison;
  tone?: "white" | "grey";
}) {
  return (
    <section
      aria-labelledby="compare-title"
      className={cn(
        "py-16 md:py-20",
        tone === "grey" ? "bg-[#f8f7fb]" : "bg-white",
      )}
    >
      <Container>
        <SectionHeading
          id="compare-title"
          eyebrow="Specifications"
          title={data.title}
          description={data.description}
        />
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[0_24px_50px_-36px_rgb(21_15_38/0.45)]">
          <Table className="min-w-[640px] text-[15px]">
            <TableCaption className="sr-only">
              {data.title}: {data.headers[0]} compared with {data.headers[1]}
            </TableCaption>
            <TableHeader>
              <TableRow className="border-0 bg-brand hover:bg-brand">
                <TableHead
                  scope="col"
                  className="h-12 w-[24%] px-5 font-semibold text-white"
                >
                  Feature
                </TableHead>
                <TableHead
                  scope="col"
                  className="h-12 px-5 font-semibold text-white"
                >
                  {data.headers[0]}
                </TableHead>
                <TableHead
                  scope="col"
                  className={cn(
                    "h-12 px-5 font-semibold",
                    data.highlightSecond
                      ? "bg-gold text-brand-dark"
                      : "text-white",
                  )}
                >
                  {data.headers[1]}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow
                  key={row.feature}
                  className="align-top even:bg-[#fbfaff]"
                >
                  <TableHead
                    scope="row"
                    className="h-auto px-5 py-4 align-top font-semibold whitespace-normal text-brand"
                  >
                    {row.feature}
                  </TableHead>
                  <TableCell className="px-5 py-4 align-top whitespace-normal text-muted-foreground">
                    <CellContent value={row.a} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-5 py-4 align-top whitespace-normal text-muted-foreground",
                      data.highlightSecond && "bg-gold/[0.06]",
                    )}
                  >
                    <CellContent value={row.b} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.footnote ? (
          <p className="mx-auto mt-3 max-w-5xl text-xs text-muted-foreground">
            {data.footnote}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
