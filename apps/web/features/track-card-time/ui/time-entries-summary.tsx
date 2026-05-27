"use client";

import { Clock3, ListChecks, Timer } from "lucide-react";

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import {
  type ActiveTimeEntry,
  type BoardTimeSummary,
} from "@/entities/time-entry/model/types";

const stoppedAtFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
});

interface Props {
  activeTimeEntry: ActiveTimeEntry | null;
  cardTitlesById: Record<string, string>;
  summary: BoardTimeSummary;
}

const formatStoppedAt = (stoppedAt: string) => {
  const date = new Date(stoppedAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return `${stoppedAtFormatter.format(date)} UTC`;
};

export const TimeEntriesSummary = ({
  activeTimeEntry,
  cardTitlesById,
  summary,
}: Props) => {
  const topCardSummary = summary.cardSummaries[0] ?? null;
  const activeCardTitle = activeTimeEntry
    ? (cardTitlesById[activeTimeEntry.card_id] ?? "Current card")
    : null;
  const topCardTitle = topCardSummary
    ? (cardTitlesById[topCardSummary.cardId] ?? "Untitled card")
    : "No tracked cards";

  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700">
            <Timer aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium">Time tracking</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {activeCardTitle
                ? activeCardTitle + " is running"
                : "No active timer"}
            </p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3 xl:min-w-[32rem]">
          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 aria-hidden="true" className="size-3.5" />
              Total tracked
            </dt>
            <dd className="mt-1 font-mono text-sm font-medium">
              {formatTimerDuration(summary.totalDurationSeconds)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks aria-hidden="true" className="size-3.5" />
              Sessions
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {summary.completedEntryCount}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Top card</dt>
            <dd
              className="mt-1 truncate text-sm font-medium"
              title={topCardTitle}
            >
              {topCardTitle}
            </dd>
            {topCardSummary ? (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {formatTimerDuration(topCardSummary.totalDurationSeconds)}
              </p>
            ) : null}
          </div>
        </dl>
      </div>

      {summary.recentEntries.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Recent sessions
          </p>
          <ol className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {summary.recentEntries.map((timeEntry) => {
              const cardTitle =
                cardTitlesById[timeEntry.card_id] ?? "Untitled card";

              return (
                <li className="min-w-0 border-l pl-3" key={timeEntry.id}>
                  <p className="truncate text-sm font-medium" title={cardTitle}>
                    {cardTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {formatTimerDuration(timeEntry.duration_seconds)}
                    </span>
                    <span aria-hidden="true"> / </span>
                    {formatStoppedAt(timeEntry.stopped_at)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
};
