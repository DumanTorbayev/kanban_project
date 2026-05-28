"use server";

import { revalidatePath } from "next/cache";

import { type BoardListItem } from "@/entities/board/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type CreateBoardInput = {
  title: string;
};

export async function createBoard(input: CreateBoardInput) {
  assertRequired(input.title, "Board title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Board title is too long.");

  const { supabase, user } = await requireUser({
    redirectTo: "/dashboard",
  });
  const { data, error } = await supabase
    .from("boards")
    .insert({
      title: input.title.trim(),
      owner_id: user.id,
    })
    .select("id, title, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");

  return data as BoardListItem;
}
