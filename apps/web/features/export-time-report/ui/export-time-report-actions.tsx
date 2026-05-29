"use client";

import { Download, FileText } from "lucide-react";

import {
  type CompletedTimeEntry,
  type TimeReportPeriod,
} from "@/entities/time-entry/model/types";
import { Button } from "@workspace/ui/components/button";

import { useTimeReportCsvExport } from "../model/use-time-report-csv-export";
import { useTimeReportPdfExport } from "../model/use-time-report-pdf-export";

interface Props {
  cardTitlesById: Record<string, string>;
  selectedCardId: string | null;
  selectedPeriod: TimeReportPeriod;
  timeEntries: CompletedTimeEntry[];
}

export const ExportTimeReportActions = ({
  cardTitlesById,
  selectedCardId,
  selectedPeriod,
  timeEntries,
}: Props) => {
  const csvExport = useTimeReportCsvExport({
    cardTitlesById,
    timeEntries,
  });
  const pdfExport = useTimeReportPdfExport({
    cardTitlesById,
    selectedCardId,
    selectedPeriod,
    timeEntries,
  });

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        className="cursor-pointer disabled:cursor-not-allowed"
        disabled={csvExport.isDisabled}
        onClick={csvExport.handleExport}
        size="sm"
        type="button"
        variant="outline"
      >
        <Download aria-hidden="true" className="size-3.5" />
        Export CSV
      </Button>

      <Button
        className="cursor-pointer disabled:cursor-not-allowed"
        disabled={pdfExport.isDisabled}
        onClick={pdfExport.handleExport}
        size="sm"
        type="button"
        variant="outline"
      >
        <FileText aria-hidden="true" className="size-3.5" />
        {pdfExport.isExporting ? "Preparing PDF" : "Export PDF"}
      </Button>
    </div>
  );
};
