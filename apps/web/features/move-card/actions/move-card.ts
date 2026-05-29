"use server";

import { revalidatePath } from "next/cache";

import { KANBAN_CARD_COLUMNS } from "@/entities/kanban/model/columns";
import {
  normalizeKanbanCard,
  type KanbanCardRow,
} from "@/entities/kanban/lib/normalize-kanban";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type MoveCardInput = {
  boardId: string;
  cardId: string;
  columnId: string;
  nextCardId: string | null;
  previousCardId: string | null;
};

export async function moveCard(input: MoveCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");
  assertRequired(input.columnId, "Column id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .rpc("move_kanban_card", {
      next_card_id: input.nextCardId,
      previous_card_id: input.previousCardId,
      target_board_id: input.boardId,
      target_card_id: input.cardId,
      target_column_id: input.columnId,
    })
    .select(KANBAN_CARD_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return normalizeKanbanCard(data as KanbanCardRow);
}
