import { AppContainer } from "@/shared/ui/app-container";
import { Skeleton } from "@/shared/ui/skeleton";

const DashboardLoading = () => (
  <main className="min-h-svh bg-muted/30 p-6">
    <AppContainer>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_value, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </AppContainer>
  </main>
);

export default DashboardLoading;
