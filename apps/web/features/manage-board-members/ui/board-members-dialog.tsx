"use client";

import { UserPlus } from "lucide-react";

import { type BoardMember } from "@/entities/board-member/model/types";
import { Button } from "@workspace/ui/components/button";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";
import { Modal } from "@workspace/ui/components/modal";

import { useBoardMembersDialog } from "../model/use-board-members-dialog";
import { BoardMemberRow } from "./board-member-row";

interface Props {
  boardId: string;
  currentUserId: string;
  initialMembers: BoardMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BoardMembersDialog = ({
  boardId,
  currentUserId,
  initialMembers,
  onOpenChange,
  open,
}: Props) => {
  const {
    canManage,
    error,
    handleCancel,
    handleInviteSubmit,
    handleRemoveConfirm,
    handleRoleChange,
    invitePending,
    memberToRemove,
    members,
    removePending,
    rolePending,
    setMemberToRemove,
  } = useBoardMembersDialog({
    boardId,
    currentUserId,
    initialMembers,
    onOpenChange,
  });

  return (
    <>
      <Modal
        className="max-w-2xl"
        description="Invite registered users and manage access to this board."
        onOpenChange={onOpenChange}
        open={open}
        title="Board members"
      >
        <div className="space-y-4">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {canManage ? (
            <form
              className="grid gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-[1fr_8rem_auto]"
              onSubmit={handleInviteSubmit}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Email
                </span>
                <input
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  disabled={invitePending}
                  name="email"
                  placeholder="teammate@example.com"
                  required
                  type="email"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Role
                </span>
                <select
                  className="h-9 w-full cursor-pointer rounded-md border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  defaultValue="member"
                  disabled={invitePending}
                  name="role"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <Button
                className="self-end"
                disabled={invitePending}
                type="submit"
              >
                <UserPlus aria-hidden="true" className="size-4" />
                {invitePending ? "Inviting..." : "Invite"}
              </Button>
            </form>
          ) : null}

          <ul className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {members.map((member) => (
              <BoardMemberRow
                canManage={canManage}
                currentUserId={currentUserId}
                isPending={rolePending || removePending}
                key={member.user_id}
                member={member}
                onRemove={setMemberToRemove}
                onRoleChange={handleRoleChange}
              />
            ))}
          </ul>

          <div className="flex justify-end">
            <Button onClick={handleCancel} type="button" variant="outline">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        confirmLabel="Remove member"
        description="This user will lose access to the board immediately."
        error={error}
        isPending={removePending}
        onConfirm={handleRemoveConfirm}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setMemberToRemove(null);
          }
        }}
        open={Boolean(memberToRemove)}
        pendingLabel="Removing..."
        title="Remove board member"
      />
    </>
  );
};
