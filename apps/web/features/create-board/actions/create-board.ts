"use server";

import { revalidatePath } from "next/cache";

import { type BoardListItem } from "@/entities/board/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type CreateBoardInput = {
  title: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function createBoard(input: CreateBoardInput) {
  assertRequired(input.title, "Board title is required.");

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
