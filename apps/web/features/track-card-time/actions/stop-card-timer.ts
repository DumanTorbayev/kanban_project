"use server";

import { revalidatePath } from "next/cache";

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

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .rpc("stop_card_timer", {
      target_board_id: input.boardId,
      target_card_id: input.cardId,
      target_time_entry_id: input.timeEntryId,
    })
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
