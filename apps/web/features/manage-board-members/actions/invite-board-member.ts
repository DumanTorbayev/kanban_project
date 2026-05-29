"use server";

import { revalidatePath } from "next/cache";

import {
  type BoardMember,
  type BoardMemberRole,
} from "@/entities/board-member/model/types";
import { requireUser } from "@/shared/lib/auth/require-user";
import { assertRequired } from "@/shared/lib/validation/assert";

export type InviteBoardMemberInput = {
  boardId: string;
  email: string;
  role: Exclude<BoardMemberRole, "owner">;
};

export const inviteBoardMember = async (
  input: InviteBoardMemberInput,
): Promise<BoardMember> => {
  assertRequired(input.boardId, "Board id is required.");
  assertRequired(input.email, "Member email is required.");

  if (input.role !== "admin" && input.role !== "member") {
    throw new Error("Member role is invalid.");
  }

  const { supabase } = await requireUser({
    redirectTo: "/boards/" + input.boardId,
  });
  const { data, error } = await supabase
    .rpc("invite_board_member", {
      invitee_email: input.email,
      member_role: input.role,
      target_board_id: input.boardId,
    })
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/boards/" + input.boardId);

  return data as BoardMember;
};
