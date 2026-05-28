import { AppContainer } from "@/shared/ui/app-container";
import { Skeleton } from "@/shared/ui/skeleton";

const BoardLoading = () => (
  <main className="min-h-svh bg-muted/30 p-6">
    <AppContainer>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-9" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({
          length: 3,
        }).map((_value, columnIndex) => (
          <div key={columnIndex} className="w-72 shrink-0 space-y-3">
            <Skeleton className="h-9 w-full" />
            {Array.from({
              length: 3,
            }).map((_card, cardIndex) => (
              <Skeleton key={cardIndex} className="h-20 w-full" />
            ))}
          </div>
        ))}
      </div>
    </AppContainer>
  </main>
);

export default BoardLoading;
