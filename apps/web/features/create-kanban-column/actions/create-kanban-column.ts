"use server";

import { revalidatePath } from "next/cache";

import { KANBAN_COLUMN_COLUMNS } from "@/entities/kanban/model/columns";
import {
  normalizeKanbanColumn,
  type KanbanColumnRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { getNextPosition } from "@/entities/kanban/lib/position";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type CreateKanbanColumnInput = {
  boardId: string;
  title: string;
};

export async function createKanbanColumn(input: CreateKanbanColumnInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.title, "Column title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Column title is too long.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: lastColumn, error: positionError } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", input.boardId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw new Error(positionError.message);
  }

  const { data, error } = await supabase
    .from("board_columns")
    .insert({
      board_id: input.boardId,
      title: input.title.trim(),
      position: getNextPosition(lastColumn?.position),
    })
    .select(KANBAN_COLUMN_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanColumn(data as KanbanColumnRow);
}
