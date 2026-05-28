"use client";

import { CalendarDays, History, RotateCcw } from "lucide-react";
import { type ChangeEvent } from "react";

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { TimeEntryActionsMenu } from "@/features/manage-time-entry/ui/time-entry-actions-menu";
import {
  periodOptions,
  useTimeEntriesHistoryFilters,
} from "@/features/track-card-time/model/use-time-entries-history-filters";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
});

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return `${dateTimeFormatter.format(date)} UTC`;
};

export const TimeEntriesHistory = ({ cardTitlesById, timeEntries }: Props) => {
  const history = useTimeEntriesHistoryFilters({
    cardTitlesById,
    timeEntries,
  });
  const sessionsLabel =
    history.filteredTimeEntries.length === 1 ? "session" : "sessions";
  const handleCardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    history.setSelectedCardId(event.target.value || null);
  };

  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-700">
            <History aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-medium">Time entries</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {history.filteredTimeEntries.length} {sessionsLabel} /{" "}
              {formatTimerDuration(history.totalDurationSeconds)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg border bg-background p-0.5">
            {periodOptions.map((option) => {
              const isSelected = history.selectedPeriod === option.value;

              return (
                <Button
                  aria-pressed={isSelected}
                  className="h-7 rounded-md px-2 text-xs"
                  key={option.value}
                  onClick={() => history.setSelectedPeriod(option.value)}
                  size="sm"
                  type="button"
                  variant={isSelected ? "secondary" : "ghost"}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <label className="flex min-w-48 items-center gap-2 rounded-lg border bg-background px-2 py-1 text-xs text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            <select
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-foreground outline-none"
              onChange={handleCardChange}
              value={history.selectedCardId ?? ""}
            >
              <option value="">All cards</option>
              {history.cardOptions.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.title}
                </option>
              ))}
            </select>
          </label>

          {history.hasActiveFilters ? (
            <Button
              className="cursor-pointer"
              onClick={history.resetFilters}
              size="sm"
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {history.filteredTimeEntries.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-md border">
          <ul className="max-h-80 divide-y overflow-y-auto">
            {history.filteredTimeEntries.map((timeEntry) => {
              const cardTitle =
                cardTitlesById[timeEntry.card_id] ?? "Untitled card";

              return (
                <li
                  className="grid gap-2 px-3 py-2 text-sm md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto_auto] md:items-center"
                  key={timeEntry.id}
                >
                  <p className="min-w-0 truncate font-medium" title={cardTitle}>
                    {cardTitle}
                  </p>
                  <p className="min-w-0 truncate text-muted-foreground">
                    Started {formatDateTime(timeEntry.started_at)}
                  </p>
                  <p className="min-w-0 truncate text-muted-foreground">
                    Stopped {formatDateTime(timeEntry.stopped_at)}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-sm font-medium md:text-right",
                      timeEntry.duration_seconds === 0 &&
                        "text-muted-foreground",
                    )}
                  >
                    {formatTimerDuration(timeEntry.duration_seconds)}
                  </p>
                  <div className="justify-self-start md:justify-self-end">
                    <TimeEntryActionsMenu timeEntry={timeEntry} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No time entries match the current filters.
        </div>
      )}
    </section>
  );
};
