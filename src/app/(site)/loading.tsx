import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <output
      aria-live="polite"
      aria-busy="true"
      className="mx-auto grid w-[90%] max-w-[1200px] gap-4 py-24"
    >
      <span className="sr-only">Loading page…</span>
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-64 w-full" />
    </output>
  );
}
