"use server";

import { revalidatePath } from "next/cache";

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

type StartCardTimerRpcRow = TimeEntryRow & {
  entry_role: "active" | "stopped";
};

const normalizeRpcTimeEntry = (row: StartCardTimerRpcRow) =>
  normalizeTimeEntry({
    id: row.id,
    board_id: row.board_id,
    card_id: row.card_id,
    user_id: row.user_id,
    started_at: row.started_at,
    stopped_at: row.stopped_at,
    duration_seconds: row.duration_seconds,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

export async function startCardTimer(
  input: StartCardTimerInput,
): Promise<StartCardTimerResult> {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase.rpc("start_card_timer", {
    target_board_id: input.boardId,
    target_card_id: input.cardId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as StartCardTimerRpcRow[];
  const activeEntry = rows.find((row) => row.entry_role === "active");
  const stoppedEntry = rows.find((row) => row.entry_role === "stopped");

  if (!activeEntry) {
    throw new Error("Active timer was not returned.");
  }

  revalidatePath("/boards/" + input.boardId);

  if (stoppedEntry && stoppedEntry.board_id !== input.boardId) {
    revalidatePath("/boards/" + stoppedEntry.board_id);
  }

  return {
    activeTimeEntry: normalizeRpcTimeEntry(activeEntry) as ActiveTimeEntry,
    stoppedTimeEntry: stoppedEntry ? normalizeRpcTimeEntry(stoppedEntry) : null,
  };
}
