"use server";

import { revalidatePath } from "next/cache";

import {
  type BoardMember,
  type BoardMemberRole,
} from "@/entities/board-member/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type UpdateBoardMemberRoleInput = {
  boardId: string;
  userId: string;
  role: Exclude<BoardMemberRole, "owner">;
};

export const updateBoardMemberRole = async (
  input: UpdateBoardMemberRoleInput,
): Promise<BoardMember> => {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.userId, "User id is required.");

  if (input.role !== "admin" && input.role !== "member") {
    throw new Error("Member role is invalid.");
  }

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .rpc("update_board_member_role", {
      member_role: input.role,
      target_board_id: input.boardId,
      target_user_id: input.userId,
    })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return data as BoardMember;
};
