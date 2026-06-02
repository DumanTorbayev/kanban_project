import { Skeleton } from "@workspace/ui/components/skeleton";

const memberSkeletons = [
  "member-skeleton-1",
  "member-skeleton-2",
  "member-skeleton-3",
] as const;

export const BoardHeaderSkeleton = () => (
  <header className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
    <div className="min-w-0 flex-1">
      <Skeleton className="mb-3 h-7 w-32 rounded-lg" />
      <Skeleton className="h-6 w-full max-w-80" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-3 flex items-center gap-2">
        {memberSkeletons.map((item) => (
          <Skeleton className="size-7 rounded-full" key={item} />
        ))}
      </div>
    </div>
    <Skeleton className="size-8 rounded-lg" />
  </header>
);
