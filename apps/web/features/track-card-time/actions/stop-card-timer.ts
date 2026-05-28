"use server";

import { revalidatePath } from "next/cache";

import { TIME_ENTRY_COLUMNS } from "@/entities/time-entry/model/columns";
import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type StopCardTimerInput = {
  boardId: string;
  cardId: string;
  timeEntryId: string;
};

export async function stopCardTimer(input: StopCardTimerInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");
  assertRequired(input.timeEntryId, "Time entry id is required.");

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("time_entries")
    .update({
      stopped_at: new Date().toISOString(),
    })
    .eq("id", input.timeEntryId)
    .eq("board_id", input.boardId)
    .eq("card_id", input.cardId)
    .eq("user_id", user.id)
    .is("stopped_at", null)
    .select(TIME_ENTRY_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Active timer was not found.");
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeTimeEntry(data as TimeEntryRow);
}
