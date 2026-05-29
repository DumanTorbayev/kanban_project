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
  const { data, error } = await supabase
    .rpc("create_kanban_column", {
      column_title: input.title,
      target_board_id: input.boardId,
    })
    .select(KANBAN_COLUMN_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanColumn(data as KanbanColumnRow);
}
