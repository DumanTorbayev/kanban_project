"use server";

import { randomUUID } from "node:crypto";

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
  const boardId = randomUUID();
  const title = input.title.trim();
  const { error: insertError } = await supabase.from("boards").insert({
    id: boardId,
    title,
    owner_id: user.id,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { data, error: selectError } = await supabase
    .from("boards")
    .select("id, title, created_at")
    .eq("id", boardId)
    .single();

  if (selectError) {
    throw new Error(selectError.message);
  }

  revalidatePath("/dashboard");

  return data as BoardListItem;
}
