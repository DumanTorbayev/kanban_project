import {
  type CompletedTimeEntry,
  type TimeAnalytics,
  type TimeAnalyticsCardBreakdown,
  type TimeAnalyticsDailyPoint,
} from "../model/types";

const getUtcDateKey = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return date.toISOString().slice(0, 10);
};

const compareCardBreakdowns = (
  leftBreakdown: TimeAnalyticsCardBreakdown,
  rightBreakdown: TimeAnalyticsCardBreakdown,
) =>
  rightBreakdown.totalDurationSeconds - leftBreakdown.totalDurationSeconds ||
  rightBreakdown.completedEntryCount - leftBreakdown.completedEntryCount ||
  leftBreakdown.cardId.localeCompare(rightBreakdown.cardId);

const compareDailyPoints = (
  leftPoint: TimeAnalyticsDailyPoint,
  rightPoint: TimeAnalyticsDailyPoint,
) => leftPoint.date.localeCompare(rightPoint.date);

export const buildTimeAnalytics = (
  timeEntries: CompletedTimeEntry[],
): TimeAnalytics => {
  const cardBreakdownById = new Map<string, TimeAnalyticsCardBreakdown>();
  const dailyPointByDate = new Map<string, TimeAnalyticsDailyPoint>();
  let totalDurationSeconds = 0;

  for (const timeEntry of timeEntries) {
    totalDurationSeconds += timeEntry.duration_seconds;

    const currentCardBreakdown = cardBreakdownById.get(timeEntry.card_id) ?? {
      cardId: timeEntry.card_id,
      completedEntryCount: 0,
      percentage: 0,
      totalDurationSeconds: 0,
    };

    cardBreakdownById.set(timeEntry.card_id, {
      ...currentCardBreakdown,
      completedEntryCount: currentCardBreakdown.completedEntryCount + 1,
      totalDurationSeconds:
        currentCardBreakdown.totalDurationSeconds + timeEntry.duration_seconds,
    });

    const dateKey = getUtcDateKey(timeEntry.stopped_at);
    const currentDailyPoint = dailyPointByDate.get(dateKey) ?? {
      completedEntryCount: 0,
      date: dateKey,
      totalDurationSeconds: 0,
    };

    dailyPointByDate.set(dateKey, {
      ...currentDailyPoint,
      completedEntryCount: currentDailyPoint.completedEntryCount + 1,
      totalDurationSeconds:
        currentDailyPoint.totalDurationSeconds + timeEntry.duration_seconds,
    });
  }

  return {
    activeCardCount: cardBreakdownById.size,
    averageDurationSeconds:
      timeEntries.length > 0
        ? Math.floor(totalDurationSeconds / timeEntries.length)
        : 0,
    cardBreakdown: [...cardBreakdownById.values()]
      .map((cardBreakdown) => ({
        ...cardBreakdown,
        percentage:
          totalDurationSeconds > 0
            ? Math.round(
                (cardBreakdown.totalDurationSeconds / totalDurationSeconds) *
                  100,
              )
            : 0,
      }))
      .sort(compareCardBreakdowns),
    completedEntryCount: timeEntries.length,
    dailyTrend: [...dailyPointByDate.values()].sort(compareDailyPoints),
    totalDurationSeconds,
  };
};
