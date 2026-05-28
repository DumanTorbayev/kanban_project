"use client";

import { useMemo, useState } from "react";

import {
  filterCompletedTimeEntries,
  getCompletedTimeEntriesDuration,
} from "@/entities/time-entry/lib/filter-time-entries";
import {
  type CompletedTimeEntry,
  type TimeEntriesHistoryPeriod,
} from "@/entities/time-entry/model/types";

type PeriodOption = {
  label: string;
  value: TimeEntriesHistoryPeriod;
};

export const periodOptions: PeriodOption[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Today",
    value: "today",
  },
  {
    label: "This week",
    value: "week",
  },
];

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

export const useTimeEntriesHistoryFilters = ({
  cardTitlesById,
  timeEntries,
}: Props) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimeEntriesHistoryPeriod>("all");
  const cardOptions = useMemo(
    () =>
      [...new Set(timeEntries.map((timeEntry) => timeEntry.card_id))]
        .map((cardId) => ({
          id: cardId,
          title: cardTitlesById[cardId] ?? "Untitled card",
        }))
        .sort((leftCard, rightCard) =>
          leftCard.title.localeCompare(rightCard.title),
        ),
    [cardTitlesById, timeEntries],
  );
  const filteredTimeEntries = useMemo(
    () =>
      filterCompletedTimeEntries(timeEntries, {
        cardId: selectedCardId,
        period: selectedPeriod,
      }),
    [selectedCardId, selectedPeriod, timeEntries],
  );
  const totalDurationSeconds = useMemo(
    () => getCompletedTimeEntriesDuration(filteredTimeEntries),
    [filteredTimeEntries],
  );
  const hasActiveFilters = Boolean(selectedCardId) || selectedPeriod !== "all";
  const resetFilters = () => {
    setSelectedCardId(null);
    setSelectedPeriod("all");
  };

  return {
    cardOptions,
    filteredTimeEntries,
    hasActiveFilters,
    resetFilters,
    selectedCardId,
    selectedPeriod,
    setSelectedCardId,
    setSelectedPeriod,
    totalDurationSeconds,
  };
};
