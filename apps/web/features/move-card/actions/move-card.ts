"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";
import {
  assertNonNegativeNumber,
  assertRequired,
} from "@/shared/lib/validation/assert";

export type MoveCardInput = {
  boardId: string;
  cardId: string;
  columnId: string;
  position: number;
};

export async function moveCard(input: MoveCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");
  assertRequired(input.columnId, "Column id is required.");
  assertNonNegativeNumber(
    input.position,
    "Card position must be a non-negative number.",
  );

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data: movedCard, error } = await supabase
    .from("cards")
    .update({
      column_id: input.columnId,
      position: input.position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.cardId)
    .eq("board_id", input.boardId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!movedCard) {
    throw new Error("Card was not moved.");
  }

  revalidatePath("/boards/" + input.boardId);

  return input;
}
