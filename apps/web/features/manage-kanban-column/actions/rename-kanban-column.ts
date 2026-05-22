"use server";

import { revalidatePath } from "next/cache";

import { type KanbanColumn } from "@/entities/kanban/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type RenameKanbanColumnInput = {
  boardId: string;
  columnId: string;
  title: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function renameKanbanColumn(input: RenameKanbanColumnInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.columnId, "Column id is required.");
  assertRequired(input.title, "Column title is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("board_columns")
    .update({ title: input.title.trim() })
    .eq("id", input.columnId)
    .eq("board_id", input.boardId)
    .select("id, board_id, title, position, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return data as KanbanColumn;
}
