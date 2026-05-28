"use server";

import { revalidatePath } from "next/cache";

import { KANBAN_COLUMN_COLUMNS } from "@/entities/kanban/model/columns";
import {
  normalizeKanbanColumn,
  type KanbanColumnRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type RenameKanbanColumnInput = {
  boardId: string;
  columnId: string;
  title: string;
};

export async function renameKanbanColumn(input: RenameKanbanColumnInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.columnId, "Column id is required.");
  assertRequired(input.title, "Column title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Column title is too long.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("board_columns")
    .update({
      title: input.title.trim(),
    })
    .eq("id", input.columnId)
    .eq("board_id", input.boardId)
    .select(KANBAN_COLUMN_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanColumn(data as KanbanColumnRow);
}
