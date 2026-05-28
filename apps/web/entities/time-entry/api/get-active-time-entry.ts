import { type createClient } from "@/lib/supabase/server";

import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "../lib/normalize-time-entry";
import { TIME_ENTRY_COLUMNS } from "../model/columns";
import { type ActiveTimeEntry } from "../model/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getActiveTimeEntry(
  supabase: SupabaseServerClient,
  boardId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("time_entries")
    .select(TIME_ENTRY_COLUMNS)
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
