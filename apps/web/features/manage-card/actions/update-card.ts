"use server";

import { revalidatePath } from "next/cache";

import { KANBAN_CARD_COLUMNS } from "@/entities/kanban/model/columns";
import {
  normalizeKanbanCard,
  type KanbanCardRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type UpdateCardInput = {
  boardId: string;
  cardId: string;
  title: string;
  description: string | null;
};

export async function updateCard(input: UpdateCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");
  assertRequired(input.title, "Card title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Card title is too long.");
  assertMaxLength(
    input.description ?? "",
    DESCRIPTION_MAX_LENGTH,
    "Card description is too long.",
  );

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
    .select(KANBAN_CARD_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanCard(data as KanbanCardRow);
}
