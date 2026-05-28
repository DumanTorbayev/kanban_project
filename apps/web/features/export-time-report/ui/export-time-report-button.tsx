"use client";

import { Download } from "lucide-react";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { Button } from "@workspace/ui/components/button";

import { useTimeReportCsvExport } from "../model/use-time-report-csv-export";

interface Props {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
}

export const ExportTimeReportButton = ({
  cardTitlesById,
  timeEntries,
}: Props) => {
  const { handleExport, isDisabled } = useTimeReportCsvExport({
    cardTitlesById,
    timeEntries,
  });

  return (
    <Button
      className="cursor-pointer"
      disabled={isDisabled}
      onClick={handleExport}
      size="sm"
      type="button"
      variant="outline"
    >
      <Download aria-hidden="true" className="size-3.5" />
      Export CSV
    </Button>
  );
};
