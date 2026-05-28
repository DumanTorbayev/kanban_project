"use client";

import { useMemo, useState } from "react";

import { buildTimeAnalytics } from "@/entities/time-entry/lib/build-time-analytics";
import { filterCompletedTimeEntries } from "@/entities/time-entry/lib/filter-time-entries";
import {
  type CompletedTimeEntry,
  type TimeEntriesHistoryPeriod,
} from "@/entities/time-entry/model/types";

interface Props {
  timeEntries: CompletedTimeEntry[];
}

export const useTimeAnalytics = ({ timeEntries }: Props) => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimeEntriesHistoryPeriod>("week");
  const filteredTimeEntries = useMemo(
    () =>
      filterCompletedTimeEntries(timeEntries, {
        cardId: null,
        period: selectedPeriod,
      }),
    [selectedPeriod, timeEntries],
  );
  const analytics = useMemo(
    () => buildTimeAnalytics(filteredTimeEntries),
    [filteredTimeEntries],
  );

  return {
    analytics,
    selectedPeriod,
    setSelectedPeriod,
  };
};
