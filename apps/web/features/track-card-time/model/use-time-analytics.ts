"use client";

import { useMemo } from "react";

import { buildTimeAnalytics } from "@/entities/time-entry/lib/build-time-analytics";
import { filterCompletedTimeEntries } from "@/entities/time-entry/lib/filter-time-entries";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

import { useTimeReportFiltersStore } from "./use-time-report-filters-store";

interface Props {
  timeEntries: CompletedTimeEntry[];
}

export const useTimeAnalytics = ({ timeEntries }: Props) => {
  const selectedCardId = useTimeReportFiltersStore(
    (state) => state.selectedCardId,
  );
  const selectedPeriod = useTimeReportFiltersStore(
    (state) => state.selectedPeriod,
  );
  const setSelectedPeriod = useTimeReportFiltersStore(
    (state) => state.setSelectedPeriod,
  );
  const filteredTimeEntries = useMemo(
    () =>
      filterCompletedTimeEntries(timeEntries, {
        cardId: selectedCardId,
        period: selectedPeriod,
      }),
    [selectedCardId, selectedPeriod, timeEntries],
  );
  const analytics = useMemo(
    () => buildTimeAnalytics(filteredTimeEntries),
    [filteredTimeEntries],
  );

  return {
    analytics,
    selectedCardId,
    selectedPeriod,
    setSelectedPeriod,
  };
};
