import { type createClient } from "@/lib/supabase/server";

import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "../lib/normalize-time-entry";
import { type ActiveTimeEntry } from "../model/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getActiveTimeEntry(
  supabase: SupabaseServerClient,
  boardId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("time_entries")
    .select(
      "id, board_id, card_id, user_id, started_at, stopped_at, duration_seconds, created_at, updated_at",
    )
    .eq("board_id", boardId)
    .eq("user_id", userId)
    .is("stopped_at", null)
    .order("started_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data: data
      ? (normalizeTimeEntry(data as TimeEntryRow) as ActiveTimeEntry)
      : null,
    error: null,
  };
}
