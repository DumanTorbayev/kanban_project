export const activeTimeEntryQueryKey = (boardId: string) => [
  "time-entry",
  "active",
  boardId,
];

export const boardTimeSummaryQueryKey = (boardId: string) => [
  "time-entry",
  "summary",
  boardId,
];

export const boardTimeEntriesQueryKey = (boardId: string) => [
  "time-entry",
  "history",
  boardId,
];
