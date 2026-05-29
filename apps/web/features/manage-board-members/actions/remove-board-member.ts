"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type RemoveBoardMemberInput = {
  boardId: string;
  userId: string;
};

export const removeBoardMember = async (
  input: RemoveBoardMemberInput,
): Promise<string> => {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.userId, "User id is required.");

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase.rpc("remove_board_member", {
    target_board_id: input.boardId,
    target_user_id: input.userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return String(data);
};
