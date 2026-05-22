"use server";

import { revalidatePath } from "next/cache";

import { type BoardDetails } from "@/entities/board/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type RenameBoardInput = {
  boardId: string;
  title: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function renameBoard(input: RenameBoardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.title, "Board title is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("boards")
    .update({
      title: input.title.trim(),
    })
    .eq("id", input.boardId)
    .select("id, title, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/boards/" + input.boardId);

  return data as BoardDetails;
}
