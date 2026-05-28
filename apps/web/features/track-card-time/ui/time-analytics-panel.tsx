"use client";

import { BarChart3, CircleGauge, Clock3, ListChecks } from "lucide-react";
import dynamic from "next/dynamic";

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { periodOptions } from "@/features/track-card-time/model/use-time-entries-history-filters";
import { useTimeAnalytics } from "@/features/track-card-time/model/use-time-analytics";
import { Button } from "@workspace/ui/components/button";

const MAX_VISIBLE_DAYS = 7;
const MAX_VISIBLE_CARDS = 5;

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

const ChartLoading = () => (
  <div className="mt-3 h-40 animate-pulse rounded-md bg-muted" />
);

const TimeDailyTrendChart = dynamic(
  () =>
    import("./time-daily-trend-chart").then(
      (module) => module.TimeDailyTrendChart,
    ),
  {
    loading: ChartLoading,
    ssr: false,
  },
);

const TimeCardBreakdownChart = dynamic(
  () =>
    import("./time-card-breakdown-chart").then(
      (module) => module.TimeCardBreakdownChart,
    ),
  {
    loading: ChartLoading,
    ssr: false,
  },
);

export const TimeAnalyticsPanel = ({ cardTitlesById, timeEntries }: Props) => {
  const { analytics, selectedPeriod, setSelectedPeriod } = useTimeAnalytics({
    timeEntries,
  });
  const visibleDailyTrend = analytics.dailyTrend.slice(-MAX_VISIBLE_DAYS);
  const visibleCardBreakdown = analytics.cardBreakdown.slice(
    0,
    MAX_VISIBLE_CARDS,
  );

  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-700">
            <BarChart3 aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium">Time analytics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Workload distribution and recent trend
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border bg-background p-0.5">
          {periodOptions.map((option) => {
            const isSelected = selectedPeriod === option.value;

            return (
              <Button
                aria-pressed={isSelected}
                className="h-7 rounded-md px-2 text-xs"
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                size="sm"
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-3">
        <div className="border-l pl-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 aria-hidden="true" className="size-3.5" />
            Tracked
          </dt>
          <dd className="mt-1 font-mono text-sm font-medium">
            {formatTimerDuration(analytics.totalDurationSeconds)}
          </dd>
        </div>
        <div className="border-l pl-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListChecks aria-hidden="true" className="size-3.5" />
            Sessions
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {analytics.completedEntryCount}
          </dd>
        </div>
        <div className="border-l pl-3">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleGauge aria-hidden="true" className="size-3.5" />
            Average session
          </dt>
          <dd className="mt-1 font-mono text-sm font-medium">
            {formatTimerDuration(analytics.averageDurationSeconds)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 border-t pt-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Daily trend</h3>
            <span className="text-xs text-muted-foreground">
              Last {visibleDailyTrend.length} days
            </span>
          </div>

          {visibleDailyTrend.length > 0 ? (
            <TimeDailyTrendChart dailyTrend={visibleDailyTrend} />
          ) : (
            <div className="mt-3 rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No tracked time for this period.
            </div>
          )}
        </div>

        <div className="xl:border-l xl:pl-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Cards by tracked time</h3>
            <span className="text-xs text-muted-foreground">
              {analytics.activeCardCount} cards
            </span>
          </div>

          {visibleCardBreakdown.length > 0 ? (
            <TimeCardBreakdownChart
              cardBreakdown={visibleCardBreakdown}
              cardTitlesById={cardTitlesById}
            />
          ) : (
            <div className="mt-3 rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No cards tracked for this period.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
