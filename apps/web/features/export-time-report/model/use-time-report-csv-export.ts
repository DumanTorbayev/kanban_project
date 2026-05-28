"use client";

import { useCallback } from "react";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

import {
  buildTimeReportCsv,
  getTimeReportFileName,
} from "../lib/time-report-csv";

const UTF8_BOM = "\uFEFF";

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

export const useTimeReportCsvExport = ({
  cardTitlesById,
  timeEntries,
}: Props) => {
  const isDisabled = timeEntries.length === 0;
  const handleExport = useCallback(() => {
    if (isDisabled) {
      return;
    }

    const csv = buildTimeReportCsv({
      cardTitlesById,
      timeEntries,
    });
    const blob = new Blob([UTF8_BOM, csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getTimeReportFileName();
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, [cardTitlesById, isDisabled, timeEntries]);

  return {
    handleExport,
    isDisabled,
  };
};
