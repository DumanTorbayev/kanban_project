"use server";

import { revalidatePath } from "next/cache";

import { TIME_ENTRY_COLUMNS } from "@/entities/time-entry/model/columns";
import {
  normalizeTimeEntry,
  type TimeEntryRow,
} from "@/entities/time-entry/lib/normalize-time-entry";
import { toCompletedTimeEntry } from "@/entities/time-entry/lib/filter-time-entries";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type UpdateTimeEntryInput = {
  boardId: string;
  timeEntryId: string;
  startedAt: string;
  stoppedAt: string;
};

function parseDate(value: string, message: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(message);
  }

  return date;
}

export async function updateTimeEntry(input: UpdateTimeEntryInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.timeEntryId, "Time entry id is required.");
  assertRequired(input.startedAt, "Start time is required.");
  assertRequired(input.stoppedAt, "Stop time is required.");

  const startedAt = parseDate(input.startedAt, "Start time is invalid.");
  const stoppedAt = parseDate(input.stoppedAt, "Stop time is invalid.");

  if (stoppedAt.getTime() <= startedAt.getTime()) {
    throw new Error("Stop time must be after start time.");
  }

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("time_entries")
    .update({
      started_at: startedAt.toISOString(),
      stopped_at: stoppedAt.toISOString(),
    })
    .eq("id", input.timeEntryId)
    .eq("board_id", input.boardId)
    .eq("user_id", user.id)
    .select(TIME_ENTRY_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Time entry not found or you do not have permission to update it.",
    );
  }

  const updatedTimeEntry = toCompletedTimeEntry(
    normalizeTimeEntry(data as TimeEntryRow),
  );

  if (!updatedTimeEntry) {
    throw new Error("Updated time entry is not completed.");
  }

  revalidatePath("/boards/" + input.boardId);

  return updatedTimeEntry;
}
