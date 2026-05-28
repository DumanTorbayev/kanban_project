"use server";

import { revalidatePath } from "next/cache";

import { KANBAN_CARD_COLUMNS } from "@/entities/kanban/model/columns";
import {
  normalizeKanbanCard,
  type KanbanCardRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { getNextPosition } from "@/entities/kanban/lib/position";
import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertMaxLength,
  assertRequired,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/shared/lib/validation/assert";

export type CreateCardInput = {
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
};

export async function createCard(input: CreateCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.columnId, "Column id is required.");
  assertRequired(input.title, "Card title is required.");
  assertMaxLength(input.title, TITLE_MAX_LENGTH, "Card title is too long.");
  assertMaxLength(
    input.description ?? "",
    DESCRIPTION_MAX_LENGTH,
    "Card description is too long.",
  );

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: lastCard, error: positionError } = await supabase
    .from("cards")
    .select("position")
    .eq("board_id", input.boardId)
    .eq("column_id", input.columnId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw new Error(positionError.message);
  }

  const { data, error } = await supabase
    .from("cards")
    .insert({
      board_id: input.boardId,
      column_id: input.columnId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      position: getNextPosition(lastCard?.position),
      created_by: user.id,
    })
    .select(KANBAN_CARD_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanCard(data as KanbanCardRow);
}
