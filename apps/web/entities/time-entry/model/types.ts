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
