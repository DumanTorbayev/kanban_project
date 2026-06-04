export type TimeEntry = {
  id: string;
  board_id: string;
  card_id: string;
  user_id: string;
  started_at: string;
  stopped_at: string | null;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
};

export type ActiveTimeEntry = TimeEntry & {
  stopped_at: null;
};

export type CompletedTimeEntry = TimeEntry & {
  stopped_at: string;
};

export type TimeEntryCardSummary = {
  cardId: string;
  completedEntryCount: number;
  lastStoppedAt: string | null;
  totalDurationSeconds: number;
};

export type BoardTimeSummary = {
  boardId: string;
  cardSummaries: TimeEntryCardSummary[];
  completedEntryCount: number;
  recentEntries: CompletedTimeEntry[];
  totalDurationSeconds: number;
};

export type TimeReportPeriod = "all" | "today" | "week";

export type TimeReportFilters = {
  cardId: string | null;
  period: TimeReportPeriod;
};

export type TimeEntriesHistoryFilters = TimeReportFilters;

export type TimeAnalyticsCardBreakdown = {
  cardId: string;
  completedEntryCount: number;
  percentage: number;
  totalDurationSeconds: number;
};

export type TimeAnalyticsDailyPoint = {
  completedEntryCount: number;
  date: string;
  totalDurationSeconds: number;
};

export type TimeAnalytics = {
  activeCardCount: number;
  averageDurationSeconds: number;
  cardBreakdown: TimeAnalyticsCardBreakdown[];
  completedEntryCount: number;
  dailyTrend: TimeAnalyticsDailyPoint[];
  totalDurationSeconds: number;
};
