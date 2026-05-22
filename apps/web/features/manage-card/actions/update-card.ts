"use server";

import { revalidatePath } from "next/cache";

import { type KanbanCard } from "@/entities/kanban/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";

export type UpdateCardInput = {
  boardId: string;
  cardId: string;
  title: string;
  description: string | null;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function updateCard(input: UpdateCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");
  assertRequired(input.title, "Card title is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("cards")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
    .eq("id", input.cardId)
    .eq("board_id", input.boardId)
    .select(
      "id, board_id, column_id, title, description, position, created_by, assignee_id, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return data as KanbanCard;
}
