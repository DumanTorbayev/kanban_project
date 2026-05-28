"use server";

import { revalidatePath } from "next/cache";

import { toCompletedTimeEntry } from "@/entities/time-entry/lib/filter-time-entries";
import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import { requireUser } from "@/shared/lib/auth/require-user";

export type DeleteTimeEntryInput = {
  boardId: string;
  timeEntryId: string;
};

const timeEntrySelect =
  "id, board_id, card_id, user_id, started_at, stopped_at, duration_seconds, created_at, updated_at";

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function deleteTimeEntry(input: DeleteTimeEntryInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.timeEntryId, "Time entry id is required.");

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", input.timeEntryId)
    .eq("board_id", input.boardId)
    .eq("user_id", user.id)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Time entry not found or you do not have permission to delete it.",
    );
  }

  const deletedTimeEntry = toCompletedTimeEntry(
    normalizeTimeEntry(data as TimeEntryRow),
  );

  if (!deletedTimeEntry) {
    throw new Error("Deleted time entry was not completed.");
  }

  revalidatePath("/boards/" + input.boardId);

  return deletedTimeEntry;
}
