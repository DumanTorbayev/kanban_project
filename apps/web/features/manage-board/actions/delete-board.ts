"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type DeleteBoardInput = {
  boardId: string;
};

export async function deleteBoard(input: DeleteBoardInput) {
  assertRequired(input.boardId, "Board id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("boards")
    .delete()
    .eq("id", input.boardId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Board not found or you do not have permission to delete it.",
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/boards/" + input.boardId);

  return input;
}
