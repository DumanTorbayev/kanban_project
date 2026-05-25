"use server";

import { revalidatePath } from "next/cache";

import {
  normalizeKanbanCard,
  type KanbanCardRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { getNextPosition } from "@/entities/kanban/lib/position";
import { requireUser } from "@/shared/lib/auth/require-user";

export type CreateCardInput = {
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function createCard(input: CreateCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.columnId, "Column id is required.");
  assertRequired(input.title, "Card title is required.");

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
    .select(
      "id, board_id, column_id, title, description, position, created_by, assignee_id, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanCard(data as KanbanCardRow);
}
