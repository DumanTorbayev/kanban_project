"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { boardMembersQueryKey } from "@/entities/board-member/model/query-keys";
import {
  type BoardMember,
  type BoardMemberRole,
} from "@/entities/board-member/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  inviteBoardMember,
  type InviteBoardMemberInput,
} from "../actions/invite-board-member";
import {
  removeBoardMember,
  type RemoveBoardMemberInput,
} from "../actions/remove-board-member";
import {
  updateBoardMemberRole,
  type UpdateBoardMemberRoleInput,
} from "../actions/update-board-member-role";

interface Props {
  boardId: string;
  currentUserId: string;
  initialMembers: BoardMember[];
  onOpenChange: (open: boolean) => void;
}

const canManageMembers = (role: BoardMemberRole | undefined) =>
  role === "owner" || role === "admin";

const upsertMember = (members: BoardMember[], member: BoardMember) => {
  const exists = members.some(
    (currentMember) => currentMember.user_id === member.user_id,
  );

  if (!exists) {
    return [...members, member];
  }

  return members.map((currentMember) =>
    currentMember.user_id === member.user_id ? member : currentMember,
  );
};

export const useBoardMembersDialog = ({
  boardId,
  currentUserId,
  initialMembers,
  onOpenChange,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardMembersQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(
    null,
  );
  const { data: members = initialMembers } = useQuery({
    enabled: false,
    initialData: initialMembers,
    queryFn: () => Promise.resolve(initialMembers),
    queryKey,
  });
  const currentMember = members.find(
    (member) => member.user_id === currentUserId,
  );
  const canManage = canManageMembers(currentMember?.role);
  const inviteMutation = useMutation<
    BoardMember,
    Error,
    InviteBoardMemberInput
  >({
    mutationFn: inviteBoardMember,
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Could not invite member."));
    },
    onSuccess: (member) => {
      queryClient.setQueryData<BoardMember[]>(queryKey, (current) =>
        upsertMember(current ?? [], member),
      );
      setError(null);
      router.refresh();
    },
  });
  const updateRoleMutation = useMutation<
    BoardMember,
    Error,
    UpdateBoardMemberRoleInput,
    { previousMembers?: BoardMember[] }
  >({
    mutationFn: updateBoardMemberRole,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousMembers = queryClient.getQueryData<BoardMember[]>(queryKey);
      queryClient.setQueryData<BoardMember[]>(queryKey, (current) =>
        (current ?? []).map((member) =>
          member.user_id === input.userId
            ? {
                ...member,
                role: input.role,
              }
            : member,
        ),
      );
      setError(null);

      return {
        previousMembers,
      };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKey, context.previousMembers);
      }

      setError(getErrorMessage(mutationError, "Could not update member role."));
    },
    onSuccess: (member) => {
      queryClient.setQueryData<BoardMember[]>(queryKey, (current) =>
        upsertMember(current ?? [], member),
      );
      setError(null);
      router.refresh();
    },
  });
  const removeMutation = useMutation<
    string,
    Error,
    RemoveBoardMemberInput,
    { previousMembers?: BoardMember[] }
  >({
    mutationFn: removeBoardMember,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousMembers = queryClient.getQueryData<BoardMember[]>(queryKey);
      queryClient.setQueryData<BoardMember[]>(queryKey, (current) =>
        (current ?? []).filter((member) => member.user_id !== input.userId),
      );
      setError(null);

      return {
        previousMembers,
      };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKey, context.previousMembers);
      }

      setError(getErrorMessage(mutationError, "Could not remove member."));
    },
    onSuccess: () => {
      setMemberToRemove(null);
      setError(null);
      router.refresh();
    },
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialMembers);
  }, [initialMembers, queryClient, queryKey]);

  const handleCancel = () => onOpenChange(false);
  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const role = String(formData.get("role") ?? "member") as Exclude<
      BoardMemberRole,
      "owner"
    >;

    if (!email) {
      setError("Member email is required.");
      return;
    }

    inviteMutation.mutate({
      boardId,
      email,
      role,
    });
    event.currentTarget.reset();
  };
  const handleRoleChange = (
    member: BoardMember,
    role: Exclude<BoardMemberRole, "owner">,
  ) => {
    updateRoleMutation.mutate({
      boardId,
      role,
      userId: member.user_id,
    });
  };
  const handleRemoveConfirm = () => {
    if (!memberToRemove) {
      return;
    }

    removeMutation.mutate({
      boardId,
      userId: memberToRemove.user_id,
    });
  };

  return {
    canManage,
    error,
    handleCancel,
    handleInviteSubmit,
    handleRemoveConfirm,
    handleRoleChange,
    invitePending: inviteMutation.isPending,
    memberToRemove,
    members,
    removePending: removeMutation.isPending,
    rolePending: updateRoleMutation.isPending,
    setMemberToRemove,
  };
};
