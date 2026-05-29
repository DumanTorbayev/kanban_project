"use client";

import { useCallback, useState } from "react";

import {
  type CompletedTimeEntry,
  type TimeReportPeriod,
} from "@/entities/time-entry/model/types";

import {
  buildTimeReportPdfData,
  getTimeReportPdfFileName,
  type TimeReportPdfData,
  type TimeReportPdfRow,
} from "../lib/time-report-pdf-data";

type PdfDocument = InstanceType<typeof import("jspdf").jsPDF>;

interface Props {
  cardTitlesById: Record<string, string>;
  selectedCardId: string | null;
  selectedPeriod: TimeReportPeriod;
  timeEntries: CompletedTimeEntry[];
}

const pageMargin = 40;
const tableTopGap = 18;
const rowPadding = 8;
const lineHeight = 11;
const cardColumnWidth = 190;
const startedColumnWidth = 105;
const stoppedColumnWidth = 105;
const durationColumnWidth = 70;

const columns = [
  {
    key: "cardTitle",
    label: "Card",
    width: cardColumnWidth,
  },
  {
    key: "startedAt",
    label: "Started UTC",
    width: startedColumnWidth,
  },
  {
    key: "stoppedAt",
    label: "Stopped UTC",
    width: stoppedColumnWidth,
  },
  {
    key: "duration",
    label: "Duration",
    width: durationColumnWidth,
  },
] as const;

const getPageBottom = (document: PdfDocument) =>
  document.internal.pageSize.getHeight() - pageMargin;

const getPageWidth = (document: PdfDocument) =>
  document.internal.pageSize.getWidth();

const drawTableHeader = (document: PdfDocument, y: number) => {
  document.setFillColor(245, 247, 250);
  document.setDrawColor(220, 224, 230);
  document.rect(
    pageMargin,
    y,
    columns.reduce((totalWidth, column) => totalWidth + column.width, 0),
    24,
    "FD",
  );

  let x = pageMargin;

  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.setTextColor(47, 51, 56);

  for (const column of columns) {
    document.text(column.label, x + rowPadding, y + 15);
    x += column.width;
  }

  return y + 24;
};

const drawPageFooter = (document: PdfDocument) => {
  const pageCount = document.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    document.setPage(pageNumber);
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(120, 126, 134);
    document.text(
      `Page ${pageNumber} of ${pageCount}`,
      getPageWidth(document) - pageMargin,
      document.internal.pageSize.getHeight() - 18,
      {
        align: "right",
      },
    );
  }
};

const drawReportHeader = (document: PdfDocument, data: TimeReportPdfData) => {
  document.setFont("helvetica", "bold");
  document.setFontSize(20);
  document.setTextColor(24, 28, 33);
  document.text("Time Report", pageMargin, 48);

  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.setTextColor(92, 99, 112);
  document.text(`Generated: ${data.generatedAt}`, pageMargin, 66);
  document.text(`Period: ${data.filters.period}`, pageMargin, 82);
  document.text(`Card: ${data.filters.card}`, pageMargin, 98);

  const metricWidth = 150;
  const metricY = 122;
  const metrics = [
    {
      label: "Total tracked",
      value: data.summary.totalTracked,
    },
    {
      label: "Sessions",
      value: data.summary.sessions,
    },
    {
      label: "Average session",
      value: data.summary.averageSession,
    },
  ];

  metrics.forEach((metric, index) => {
    const x = pageMargin + index * (metricWidth + 12);

    document.setFillColor(248, 250, 252);
    document.setDrawColor(226, 232, 240);
    document.roundedRect(x, metricY, metricWidth, 48, 4, 4, "FD");
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(92, 99, 112);
    document.text(metric.label, x + 10, metricY + 16);
    document.setFont("helvetica", "bold");
    document.setFontSize(13);
    document.setTextColor(24, 28, 33);
    document.text(metric.value, x + 10, metricY + 34);
  });

  return metricY + 48 + tableTopGap;
};

const getCardLines = (document: PdfDocument, row: TimeReportPdfRow) => {
  const lines = document.splitTextToSize(
    row.cardTitle,
    cardColumnWidth - rowPadding * 2,
  ) as string[];

  if (lines.length <= 3) {
    return lines;
  }

  return [...lines.slice(0, 2), `${lines[2]?.slice(0, 44) ?? ""}...`];
};

const drawTableRow = (
  document: PdfDocument,
  row: TimeReportPdfRow,
  y: number,
  rowIndex: number,
) => {
  const cardLines = getCardLines(document, row);
  const rowHeight = Math.max(
    28,
    cardLines.length * lineHeight + rowPadding * 2,
  );
  const tableWidth = columns.reduce(
    (totalWidth, column) => totalWidth + column.width,
    0,
  );
  const rowFillColor = rowIndex % 2 === 0 ? 255 : 250;

  document.setFillColor(rowFillColor, rowFillColor, rowFillColor);
  document.setDrawColor(232, 235, 239);
  document.rect(pageMargin, y, tableWidth, rowHeight, "FD");

  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(35, 39, 47);

  let x = pageMargin;

  document.text(cardLines, x + rowPadding, y + rowPadding + 8);
  x += cardColumnWidth;
  document.text(row.startedAt, x + rowPadding, y + rowPadding + 8);
  x += startedColumnWidth;
  document.text(row.stoppedAt, x + rowPadding, y + rowPadding + 8);
  x += stoppedColumnWidth;
  document.setFont("helvetica", "bold");
  document.text(row.duration, x + rowPadding, y + rowPadding + 8);

  return y + rowHeight;
};

const buildPdfDocument = (document: PdfDocument, data: TimeReportPdfData) => {
  let y = drawReportHeader(document, data);

  if (data.rows.length === 0) {
    document.setFont("helvetica", "normal");
    document.setFontSize(10);
    document.setTextColor(92, 99, 112);
    document.text("No time entries match the current filters.", pageMargin, y);
    drawPageFooter(document);

    return;
  }

  y = drawTableHeader(document, y);

  data.rows.forEach((row, rowIndex) => {
    const cardLines = getCardLines(document, row);
    const nextRowHeight = Math.max(
      28,
      cardLines.length * lineHeight + rowPadding * 2,
    );

    if (y + nextRowHeight > getPageBottom(document)) {
      document.addPage();
      y = drawTableHeader(document, pageMargin);
    }

    y = drawTableRow(document, row, y, rowIndex);
  });

  drawPageFooter(document);
};

export const useTimeReportPdfExport = ({
  cardTitlesById,
  selectedCardId,
  selectedPeriod,
  timeEntries,
}: Props) => {
  const [isExporting, setIsExporting] = useState(false);
  const isDisabled = isExporting || timeEntries.length === 0;
  const handleExport = useCallback(async () => {
    if (isDisabled) {
      return;
    }

    setIsExporting(true);

    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF({
        format: "a4",
        orientation: "portrait",
        unit: "pt",
      });
      const data = buildTimeReportPdfData({
        cardTitlesById,
        selectedCardId,
        selectedPeriod,
        timeEntries,
      });

      buildPdfDocument(document, data);
      document.save(getTimeReportPdfFileName());
    } finally {
      setIsExporting(false);
    }
  }, [cardTitlesById, isDisabled, selectedCardId, selectedPeriod, timeEntries]);

  return {
    handleExport,
    isDisabled,
    isExporting,
  };
};
