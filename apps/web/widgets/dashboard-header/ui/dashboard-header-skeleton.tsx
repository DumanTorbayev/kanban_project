import { Skeleton } from "@workspace/ui/components/skeleton";

export const DashboardHeaderSkeleton = () => (
  <header className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-4 w-full max-w-64" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </header>
);
