"use client";

import { Trash2 } from "lucide-react";

import {
  type BoardMember,
  type BoardMemberRole,
} from "@/entities/board-member/model/types";
import { Button } from "@workspace/ui/components/button";

interface Props {
  canManage: boolean;
  currentUserId: string;
  isPending: boolean;
  member: BoardMember;
  onRemove: (member: BoardMember) => void;
  onRoleChange: (
    member: BoardMember,
    role: Exclude<BoardMemberRole, "owner">,
  ) => void;
}

const getMemberName = (member: BoardMember) =>
  member.full_name || member.email || "Unknown user";

const getMemberInitials = (member: BoardMember) =>
  getMemberName(member)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const BoardMemberRow = ({
  canManage,
  currentUserId,
  isPending,
  member,
  onRemove,
  onRoleChange,
}: Props) => {
  const isCurrentUser = member.user_id === currentUserId;
  const canEditMember = canManage && member.role !== "owner";

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {getMemberInitials(member)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {getMemberName(member)}
          {isCurrentUser ? (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              You
            </span>
          ) : null}
        </p>
        {member.email ? (
          <p className="truncate text-xs text-muted-foreground">
            {member.email}
          </p>
        ) : null}
      </div>

      {canEditMember ? (
        <select
          className="h-8 cursor-pointer rounded-md border bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          disabled={isPending}
          onChange={(event) =>
            onRoleChange(
              member,
              event.target.value as Exclude<BoardMemberRole, "owner">,
            )
          }
          value={member.role}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      ) : (
        <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground capitalize">
          {member.role}
        </span>
      )}

      {canEditMember ? (
        <Button
          aria-label="Remove member"
          disabled={isPending}
          onClick={() => onRemove(member)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
        </Button>
      ) : null}
    </li>
  );
};
