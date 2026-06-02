"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type DeleteBoardInput = {
  boardId: string;
};

export async function deleteBoard(input: DeleteBoardInput) {
  assertRequired(input.boardId, "Board id is required.");

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: board, error: selectError } = await supabase
    .from("boards")
    .select("id")
    .eq("id", input.boardId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (!board) {
    throw new Error(
      "Board not found or you do not have permission to delete it.",
    );
  }

  const { error: deleteError } = await supabase
    .from("boards")
    .delete()
    .eq("id", input.boardId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/boards/" + input.boardId);

  return input;
}
