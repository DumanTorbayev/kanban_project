"use client";

import { type BoardMember } from "@/entities/board-member/model/types";

interface Props {
  members: BoardMember[];
}

const getInitials = (member: BoardMember) =>
  (member.full_name || member.email || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const BoardMembersPreview = ({ members }: Props) => {
  const visibleMembers = members.slice(0, 3);
  const hiddenCount = Math.max(0, members.length - visibleMembers.length);
  const memberLabel = members.length === 1 ? "member" : "members";

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex -space-x-2">
        {visibleMembers.map((member) => (
          <div
            className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[0.65rem] font-semibold text-muted-foreground"
            key={member.user_id}
          >
            {getInitials(member)}
          </div>
        ))}
        {hiddenCount > 0 ? (
          <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[0.65rem] font-semibold text-muted-foreground">
            +{hiddenCount}
          </div>
        ) : null}
      </div>
      <span>
        {members.length} {memberLabel}
      </span>
    </div>
  );
};
