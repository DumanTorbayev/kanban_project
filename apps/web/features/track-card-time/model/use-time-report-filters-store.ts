"use client";

import { create } from "zustand";

import { type TimeReportPeriod } from "@/entities/time-entry/model/types";

type TimeReportFiltersState = {
  resetFilters: () => void;
  selectedCardId: string | null;
  selectedPeriod: TimeReportPeriod;
  setSelectedCardId: (cardId: string | null) => void;
  setSelectedPeriod: (period: TimeReportPeriod) => void;
};

type TimeReportInitialFilters = Pick<
  TimeReportFiltersState,
  "selectedCardId" | "selectedPeriod"
>;

const initialFilters: TimeReportInitialFilters = {
  selectedCardId: null,
  selectedPeriod: "all",
};

export const useTimeReportFiltersStore = create<TimeReportFiltersState>(
  (set) => ({
    ...initialFilters,
    resetFilters: () => set(initialFilters),
    setSelectedCardId: (selectedCardId) =>
      set({
        selectedCardId,
      }),
    setSelectedPeriod: (selectedPeriod) =>
      set({
        selectedPeriod,
      }),
  }),
);
