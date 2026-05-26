"use server";

import { revalidatePath } from "next/cache";

import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import { type ActiveTimeEntry } from "@/entities/time-entry/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type StartCardTimerInput = {
  boardId: string;
  cardId: string;
};

const timeEntrySelect =
  "id, board_id, card_id, user_id, started_at, stopped_at, duration_seconds, created_at, updated_at";

const assertRequired = (value: string, message: string) => {
  if (!value.trim()) {
    throw new Error(message);
  }
};

export async function startCardTimer(input: StartCardTimerInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: activeEntry, error: activeEntryError } = await supabase
    .from("time_entries")
    .select(timeEntrySelect)
    .eq("user_id", user.id)
    .is("stopped_at", null)
    .limit(1)
    .maybeSingle();

  if (activeEntryError) {
    throw new Error(activeEntryError.message);
  }

  if (activeEntry) {
    const normalizedActiveEntry = normalizeTimeEntry(
      activeEntry as TimeEntryRow,
    ) as ActiveTimeEntry;

    if (
      normalizedActiveEntry.board_id === input.boardId &&
      normalizedActiveEntry.card_id === input.cardId
    ) {
      return normalizedActiveEntry;
    }

    throw new Error("Stop the current timer before starting another one.");
  }

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      board_id: input.boardId,
      card_id: input.cardId,
      user_id: user.id,
    })
    .select(timeEntrySelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeTimeEntry(data as TimeEntryRow) as ActiveTimeEntry;
}
