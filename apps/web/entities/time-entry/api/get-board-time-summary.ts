import { type createClient } from "@/lib/supabase/server";

import {
  buildBoardTimeSummary,
  createEmptyBoardTimeSummary,
} from "../lib/build-board-time-summary";
import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "../lib/normalize-time-entry";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getBoardTimeSummary(
  supabase: SupabaseServerClient,
  boardId: string,
) {
  const { data, error } = await supabase
    .from("time_entries")
    .select(
      "id, board_id, card_id, user_id, started_at, stopped_at, duration_seconds, created_at, updated_at",
    )
    .eq("board_id", boardId)
    .not("stopped_at", "is", null)
    .order("stopped_at", {
      ascending: false,
    });

  if (error) {
    return {
      data: createEmptyBoardTimeSummary(boardId),
      error,
    };
  }

  return {
    data: buildBoardTimeSummary(
      boardId,
      ((data ?? []) as TimeEntryRow[]).map(normalizeTimeEntry),
    ),
    error: null,
  };
}
