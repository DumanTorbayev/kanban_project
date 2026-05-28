"use server";

import { revalidatePath } from "next/cache";

import { type BoardDetails } from "@/entities/board/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type RenameBoardInput = {
  boardId: string;
  title: string;
};

export async function renameBoard(input: RenameBoardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.title, "Board title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Board title is too long.");

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
