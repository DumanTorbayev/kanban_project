"use server";

import { revalidatePath } from "next/cache";

import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import { requireUser } from "@/shared/lib/auth/require-user";

export type StopCardTimerInput = {
  boardId: string;
  cardId: string;
  timeEntryId: string;
};

const timeEntrySelect =
  "id, board_id, card_id, user_id, started_at, stopped_at, duration_seconds, created_at, updated_at";

const assertRequired = (value: string, message: string) => {
  if (!value.trim()) {
    throw new Error(message);
  }
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
    .select(timeEntrySelect)
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
