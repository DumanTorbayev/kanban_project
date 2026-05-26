import { type createClient } from "@/lib/supabase/server";

import {
  normalizeKanbanBoard,
  type KanbanCardRow,
  type KanbanColumnRow,
} from "../lib/normalize-kanban";
import { type KanbanColumnWithCards } from "../model/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type TimeEntryDurationRow = {
  card_id: string;
  duration_seconds: number | string | null;
};

const getTrackedSecondsByCard = (timeEntries: TimeEntryDurationRow[]) => {
  const trackedSecondsByCard = new Map<string, number>();

  for (const timeEntry of timeEntries) {
    const durationSeconds = Number(timeEntry.duration_seconds);

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      continue;
    }

    trackedSecondsByCard.set(
      timeEntry.card_id,
      (trackedSecondsByCard.get(timeEntry.card_id) ?? 0) +
        Math.floor(durationSeconds),
    );
  }

  return trackedSecondsByCard;
};

export async function getKanbanBoard(
  supabase: SupabaseServerClient,
  boardId: string,
) {
  const [columnsResult, cardsResult, timeEntriesResult] = await Promise.all([
    supabase
      .from("board_columns")
      .select("id, board_id, title, position, created_at, updated_at")
      .eq("board_id", boardId)
      .order("position", {
        ascending: true,
      }),
    supabase
      .from("cards")
      .select(
        "id, board_id, column_id, title, description, position, created_by, assignee_id, created_at, updated_at",
      )
      .eq("board_id", boardId)
      .order("position", {
        ascending: true,
      }),
    supabase
      .from("time_entries")
      .select("card_id, duration_seconds")
      .eq("board_id", boardId)
      .not("stopped_at", "is", null),
  ]);

  if (columnsResult.error) {
    return {
      data: null,
      error: columnsResult.error,
    };
  }

  if (cardsResult.error) {
    return {
      data: null,
      error: cardsResult.error,
    };
  }

  const boardColumns: KanbanColumnWithCards[] = normalizeKanbanBoard(
    (columnsResult.data ?? []) as KanbanColumnRow[],
    (cardsResult.data ?? []) as KanbanCardRow[],
    getTrackedSecondsByCard(
      timeEntriesResult.error
        ? []
        : ((timeEntriesResult.data ?? []) as TimeEntryDurationRow[]),
    ),
  );

  return {
    data: boardColumns,
    error: null,
  };
}
