"use client";

import { useMemo } from "react";

import {
  filterCompletedTimeEntries,
  getCompletedTimeEntriesDuration,
} from "@/entities/time-entry/lib/filter-time-entries";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

import { useTimeReportFiltersStore } from "./use-time-report-filters-store";

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

export const useTimeEntriesHistoryFilters = ({
  cardTitlesById,
  timeEntries,
}: Props) => {
  const resetFilters = useTimeReportFiltersStore((state) => state.resetFilters);
  const selectedCardId = useTimeReportFiltersStore(
    (state) => state.selectedCardId,
  );
  const selectedPeriod = useTimeReportFiltersStore(
    (state) => state.selectedPeriod,
  );
  const setSelectedCardId = useTimeReportFiltersStore(
    (state) => state.setSelectedCardId,
  );
  const setSelectedPeriod = useTimeReportFiltersStore(
    (state) => state.setSelectedPeriod,
  );
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
