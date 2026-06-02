import { Skeleton } from "@workspace/ui/components/skeleton";

const summaryItems = [
  "summary-total",
  "summary-sessions",
  "summary-top-card",
] as const;

const analyticsItems = [
  "analytics-tracked",
  "analytics-sessions",
  "analytics-average",
] as const;

const historyRows = [
  "history-row-1",
  "history-row-2",
  "history-row-3",
  "history-row-4",
] as const;

const columns = [
  {
    cards: ["h-24", "h-20", "h-28"],
    id: "column-skeleton-1",
  },
  {
    cards: ["h-28", "h-20"],
    id: "column-skeleton-2",
  },
  {
    cards: ["h-20", "h-24", "h-20"],
    id: "column-skeleton-3",
  },
  {
    cards: ["h-24", "h-28"],
    id: "column-skeleton-4",
  },
] as const;

export const KanbanBoardSkeleton = () => (
  <section className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <section className="min-w-0 flex-1 rounded-lg border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-32" />
        </div>
      </section>
      <Skeleton className="h-7 w-24 rounded-md" />
    </div>

    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[32rem]">
          {summaryItems.map((item) => (
            <div className="min-w-0 space-y-2" key={item}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>

      <div className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-3">
        {analyticsItems.map((item) => (
          <div className="border-l pl-3" key={item}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 border-t pt-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="mt-3 h-40 rounded-md" />
        </div>

        <div className="xl:border-l xl:pl-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="mt-3 h-40 rounded-md" />
        </div>
      </div>
    </section>

    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border">
        <ul className="divide-y">
          {historyRows.map((item) => (
            <li
              className="grid gap-2 px-3 py-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto_auto] md:items-center"
              key={item}
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16 md:justify-self-end" />
              <Skeleton className="size-7 rounded-lg md:justify-self-end" />
            </li>
          ))}
        </ul>
      </div>
    </section>

    <div className="-mx-1 overflow-x-auto px-1 pb-2">
      <div className="flex min-h-112 min-w-full gap-4">
        {columns.map((column) => (
          <section
            className="flex h-[calc(100vh-18rem)] max-h-[44rem] min-h-112 min-w-72 flex-1 flex-col rounded-lg border bg-muted/40 p-3 shadow-sm"
            key={column.id}
          >
            <header className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-8 rounded-md" />
              </div>
              <Skeleton className="size-7 rounded-lg" />
            </header>

            <Skeleton className="mb-3 h-7 w-full rounded-lg" />

            <div className="space-y-3">
              {column.cards.map((height, index) => (
                <div
                  className="rounded-md border bg-background p-3 shadow-xs"
                  key={column.id + "-card-" + index}
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                  <Skeleton className={`mt-3 ${height} w-full opacity-40`} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  </section>
);
