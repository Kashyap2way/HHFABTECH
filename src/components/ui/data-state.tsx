import { CircleAlertIcon, InboxIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DataStateProps = {
  loading?: boolean;
  /** Error message or Error object. */
  error?: string | Error | null;
  /** Show the empty state instead of children. */
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  /** Custom loading UI. Defaults to three skeleton rows. */
  skeleton?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * One wrapper for the loading / error / empty / ready states of any data-driven block.
 *
 *   <DataState loading={isLoading} error={error} empty={jobs.length === 0} onRetry={refetch}>
 *     <JobList jobs={jobs} />
 *   </DataState>
 */
export function DataState({
  loading,
  error,
  empty,
  emptyMessage = "Nothing to show yet.",
  onRetry,
  skeleton,
  className,
  children,
}: DataStateProps) {
  if (loading) {
    return (
      <output
        aria-live="polite"
        aria-busy="true"
        className={cn("grid gap-3", className)}
      >
        <span className="sr-only">Loading…</span>
        {skeleton ?? (
          <>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
      </output>
    );
  }

  if (error) {
    const message = typeof error === "string" ? error : error.message;
    return (
      <Alert variant="destructive" className={className}>
        <CircleAlertIcon />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onRetry}
            >
              Try again
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-muted-foreground",
          className,
        )}
      >
        <InboxIcon aria-hidden="true" className="size-6" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
