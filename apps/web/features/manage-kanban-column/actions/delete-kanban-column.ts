"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type DeleteKanbanColumnInput = {
  boardId: string;
  columnId: string;
};

export async function deleteKanbanColumn(input: DeleteKanbanColumnInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.columnId, "Column id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { error } = await supabase
    .from("board_columns")
    .delete()
    .eq("id", input.columnId)
    .eq("board_id", input.boardId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return input;
}
