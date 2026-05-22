"use server";

import { revalidatePath } from "next/cache";

import { getNextPosition } from "@/entities/kanban/lib/position";
import { type KanbanColumn } from "@/entities/kanban/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type CreateKanbanColumnInput = {
  boardId: string;
  title: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function createKanbanColumn(input: CreateKanbanColumnInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.title, "Column title is required.");

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
    .select("id, board_id, title, position, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return data as KanbanColumn;
}
