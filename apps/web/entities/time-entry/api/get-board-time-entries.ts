import { type createClient } from "@/lib/supabase/server";

import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "../lib/normalize-time-entry";
import {
  sortCompletedTimeEntries,
  toCompletedTimeEntry,
} from "../lib/filter-time-entries";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getBoardTimeEntries(
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
      data: [],
      error,
    };
  }

  return {
    data: sortCompletedTimeEntries(
      ((data ?? []) as TimeEntryRow[]).flatMap((timeEntry) => {
        const completedTimeEntry = toCompletedTimeEntry(
          normalizeTimeEntry(timeEntry),
        );

        return completedTimeEntry ? [completedTimeEntry] : [];
      }),
    ),
    error: null,
  };
}
