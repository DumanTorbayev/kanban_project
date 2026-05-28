"use server";

import { revalidatePath } from "next/cache";

import { TIME_ENTRY_COLUMNS } from "@/entities/time-entry/model/columns";
import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import {
  type ActiveTimeEntry,
  type TimeEntry,
} from "@/entities/time-entry/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type StartCardTimerInput = {
  boardId: string;
  cardId: string;
};

export type StartCardTimerResult = {
  activeTimeEntry: ActiveTimeEntry;
  stoppedTimeEntry: TimeEntry | null;
};

export async function startCardTimer(
  input: StartCardTimerInput,
): Promise<StartCardTimerResult> {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: activeEntry, error: activeEntryError } = await supabase
    .from("time_entries")
    .select(TIME_ENTRY_COLUMNS)
    .eq("user_id", user.id)
    .is("stopped_at", null)
    .limit(1)
    .maybeSingle();

  if (activeEntryError) {
    throw new Error(activeEntryError.message);
  }

  let stoppedTimeEntry: TimeEntry | null = null;

  if (activeEntry) {
    const normalizedActiveEntry = normalizeTimeEntry(
      activeEntry as TimeEntryRow,
    ) as ActiveTimeEntry;

    if (
      normalizedActiveEntry.board_id === input.boardId &&
      normalizedActiveEntry.card_id === input.cardId
    ) {
      return {
        activeTimeEntry: normalizedActiveEntry,
        stoppedTimeEntry: null,
      };
    }

    const { data: stoppedEntry, error: stopError } = await supabase
      .from("time_entries")
      .update({
        stopped_at: new Date().toISOString(),
      })
      .eq("id", normalizedActiveEntry.id)
      .eq("user_id", user.id)
      .is("stopped_at", null)
      .select(TIME_ENTRY_COLUMNS)
      .single();

    if (stopError) {
      throw new Error(stopError.message);
    }

    stoppedTimeEntry = normalizeTimeEntry(stoppedEntry as TimeEntryRow);
    revalidatePath("/boards/" + stoppedTimeEntry.board_id);
  }

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      board_id: input.boardId,
      card_id: input.cardId,
      user_id: user.id,
    })
    .select(TIME_ENTRY_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return {
    activeTimeEntry: normalizeTimeEntry(
      data as TimeEntryRow,
    ) as ActiveTimeEntry,
    stoppedTimeEntry,
  };
}
