import { Skeleton } from "@workspace/ui/components/skeleton";

export const CreateBoardFormSkeleton = () => (
  <section className="rounded-lg border bg-background p-5 shadow-sm">
    <div className="mb-4 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-full max-w-80" />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
      <Skeleton className="h-9 w-full rounded-lg sm:w-28" />
    </div>
  </section>
);
