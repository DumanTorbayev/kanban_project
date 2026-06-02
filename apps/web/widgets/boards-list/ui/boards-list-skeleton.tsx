import { Skeleton } from "@workspace/ui/components/skeleton";

const boardCardSkeletons = [
  "board-card-skeleton-1",
  "board-card-skeleton-2",
  "board-card-skeleton-3",
  "board-card-skeleton-4",
  "board-card-skeleton-5",
  "board-card-skeleton-6",
] as const;

export const BoardsListSkeleton = () => (
  <section className="rounded-lg border bg-background p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full max-w-96" />
      </div>
      <Skeleton className="h-4 w-14" />
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {boardCardSkeletons.map((item) => (
        <div className="rounded-md border p-4" key={item}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ))}
    </div>
  </section>
);
