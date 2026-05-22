"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";

export type DeleteCardInput = {
  boardId: string;
  cardId: string;
};

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export async function deleteCard(input: DeleteCardInput) {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.cardId, "Card id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .from("cards")
    .delete()
    .eq("id", input.cardId)
    .eq("board_id", input.boardId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Card not found or you do not have permission to delete it.",
    );
  }

  revalidatePath("/boards/" + input.boardId);

  return input;
}
