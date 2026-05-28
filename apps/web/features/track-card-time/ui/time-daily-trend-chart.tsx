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

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type TimeAnalyticsDailyPoint } from "@/entities/time-entry/model/types";

interface Props {
  dailyTrend: TimeAnalyticsDailyPoint[];
}

type ChartPoint = {
  date: string;
  label: string;
  sessions: number;
  totalDurationSeconds: number;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const axisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};
const barChartMargin = {
  bottom: 0,
  left: 0,
  right: 8,
  top: 8,
};
const tooltipCursor = {
  fill: "var(--muted)",
};

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

const DailyTrendTooltip = ({ active, payload }: TooltipContentProps) => {
  const point = getChartPoint(payload);

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{point.label}</p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {formatTimerDuration(point.totalDurationSeconds)}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {point.sessions} {point.sessions === 1 ? "session" : "sessions"}
      </p>
    </div>
  );
};

export const TimeDailyTrendChart = ({ dailyTrend }: Props) => {
  const chartData: ChartPoint[] = dailyTrend.map((day) => ({
    date: day.date,
    label: dateFormatter.format(new Date(day.date + "T00:00:00Z")),
    sessions: day.completedEntryCount,
    totalDurationSeconds: day.totalDurationSeconds,
  }));

  return (
    <div className="mt-3 h-40">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData} margin={barChartMargin}>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={8}
            tick={axisTick}
          />
          <YAxis
            axisLine={false}
            tickFormatter={(value) => formatAxisDuration(Number(value))}
            tickLine={false}
            tickMargin={8}
            tick={axisTick}
            width={36}
          />
          <Tooltip
            content={(props) => <DailyTrendTooltip {...props} />}
            cursor={tooltipCursor}
          />
          <Bar
            dataKey="totalDurationSeconds"
            fill="var(--chart-2)"
            maxBarSize={42}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
