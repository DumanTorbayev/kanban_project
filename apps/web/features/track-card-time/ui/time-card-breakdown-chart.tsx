"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { type CSSProperties } from "react";

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type TimeAnalyticsCardBreakdown } from "@/entities/time-entry/model/types";

interface Props {
  cardBreakdown: TimeAnalyticsCardBreakdown[];
  cardTitlesById: Record<string, string>;
}

type ChartPoint = {
  cardId: string;
  cardTitle: string;
  label: string;
  percentage: number;
  sessions: number;
  totalDurationSeconds: number;
};

const MIN_CHART_HEIGHT = 168;
const ROW_HEIGHT = 42;
const axisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};
const barChartMargin = {
  bottom: 0,
  left: 4,
  right: 8,
  top: 8,
};
const tooltipCursor = {
  fill: "var(--muted)",
};

const truncateLabel = (value: string) =>
  value.length > 18 ? value.slice(0, 17) + "..." : value;

const formatAxisDuration = (value: number) => {
  if (value >= 3600) {
    return Math.round(value / 3600) + "h";
  }

  if (value >= 60) {
    return Math.round(value / 60) + "m";
  }

  return Math.round(value) + "s";
};

const getChartPoint = (payload: TooltipContentProps["payload"]) =>
  payload[0]?.payload as ChartPoint | undefined;

const CardBreakdownTooltip = ({ active, payload }: TooltipContentProps) => {
  const point = getChartPoint(payload);

  if (!active || !point) {
    return null;
  }

  return (
    <div className="max-w-72 rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="truncate font-medium" title={point.cardTitle}>
        {point.cardTitle}
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {formatTimerDuration(point.totalDurationSeconds)}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {point.percentage}% / {point.sessions}{" "}
        {point.sessions === 1 ? "session" : "sessions"}
      </p>
    </div>
  );
};

export const TimeCardBreakdownChart = ({
  cardBreakdown,
  cardTitlesById,
}: Props) => {
  const chartData: ChartPoint[] = cardBreakdown.map((card) => {
    const cardTitle = cardTitlesById[card.cardId] ?? "Untitled card";

    return {
      cardId: card.cardId,
      cardTitle,
      label: truncateLabel(cardTitle),
      percentage: card.percentage,
      sessions: card.completedEntryCount,
      totalDurationSeconds: card.totalDurationSeconds,
    };
  });
  const chartHeight = Math.max(MIN_CHART_HEIGHT, chartData.length * ROW_HEIGHT);
  const chartStyle: CSSProperties = {
    height: chartHeight,
  };

  return (
    <div className="mt-3" style={chartStyle}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} layout="vertical" margin={barChartMargin}>
          <CartesianGrid
            horizontal={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            axisLine={false}
            tickFormatter={(value) => formatAxisDuration(Number(value))}
            tickLine={false}
            tickMargin={8}
            tick={axisTick}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={8}
            tick={axisTick}
            type="category"
            width={112}
          />
          <Tooltip
            content={(props) => <CardBreakdownTooltip {...props} />}
            cursor={tooltipCursor}
          />
          <Bar
            dataKey="totalDurationSeconds"
            fill="var(--chart-3)"
            maxBarSize={18}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
