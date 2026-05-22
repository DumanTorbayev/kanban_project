"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";

export type DeleteBoardInput = {
  boardId: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

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
