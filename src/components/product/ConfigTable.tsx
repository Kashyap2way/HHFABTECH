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
import type { ConfigTable as ConfigTableData } from "@/lib/product-details";

/** Petroleum: capacity and compartment configurations per vehicle GVW. */
export function ConfigTable({ data }: { data: ConfigTableData }) {
  return (
    <section
      aria-labelledby="config-title"
      className="bg-[#f8f7fb] py-16 md:py-20"
    >
      <Container>
        <SectionHeading
          id="config-title"
          eyebrow="Technical details"
          title={data.title}
          description={data.description}
        />
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[0_24px_50px_-36px_rgb(21_15_38/0.45)]">
          <Table className="min-w-[600px] text-[15px]">
            <TableCaption className="sr-only">{data.title}</TableCaption>
            <TableHeader>
              <TableRow className="border-0 bg-brand hover:bg-brand">
                <TableHead
                  scope="col"
                  className="h-12 px-5 font-semibold text-white"
                >
                  Vehicle GVW
                </TableHead>
                <TableHead
                  scope="col"
                  className="h-12 px-5 font-semibold text-white"
                >
                  Tank capacity
                </TableHead>
                <TableHead
                  scope="col"
                  className="h-12 px-5 font-semibold text-white"
                >
                  Compartment configuration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r) => (
                <TableRow key={r.gvw} className="align-top even:bg-[#fbfaff]">
                  <TableHead
                    scope="row"
                    className="h-auto px-5 py-4 align-top font-semibold text-brand"
                  >
                    {r.gvw}
                  </TableHead>
                  <TableCell className="px-5 py-4 align-top">
                    <ul className="flex flex-wrap gap-2">
                      {r.capacities.map((c) => (
                        <li
                          key={c}
                          className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="px-5 py-4 align-top whitespace-normal text-muted-foreground">
                    <ul className="space-y-1.5">
                      {r.configurations.map((c, i) => (
                        <li key={c}>
                          {i > 0 ? (
                            <span className="mr-2 text-xs font-semibold text-gold-dark uppercase">
                              or
                            </span>
                          ) : null}
                          <span className="font-medium text-foreground tabular-nums">
                            {c}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Container>
    </section>
  );
}
