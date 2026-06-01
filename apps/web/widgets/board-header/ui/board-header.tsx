"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { boardMembersQueryKey } from "@/entities/board-member/model/query-keys";
import { type BoardMember } from "@/entities/board-member/model/types";
import { boardQueryKey } from "@/entities/board/model/query-keys";
import { type BoardDetails } from "@/entities/board/model/types";
import { BoardActionsMenu } from "@/features/manage-board/ui/board-actions-menu";
import { Button } from "@workspace/ui/components/button";

import { useBoardMembersRealtime } from "../model/use-board-members-realtime";
import { BoardMembersPreview } from "./board-members-preview";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

interface Props {
  board: BoardDetails;
  currentUserId: string;
  members: BoardMember[];
}

export const BoardHeader = ({ board, currentUserId, members }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardQueryKey(board.id), [board.id]);
  const membersQueryKey = useMemo(
    () => boardMembersQueryKey(board.id),
    [board.id],
  );
  const { data: currentBoard = board } = useQuery({
    enabled: false,
    initialData: board,
    queryFn: () => Promise.resolve(board),
    queryKey,
  });
  const { data: currentMembers = members } = useQuery({
    enabled: false,
    initialData: members,
    queryFn: () => Promise.resolve(members),
    queryKey: membersQueryKey,
  });
  const { error: membersRealtimeError } = useBoardMembersRealtime({
    boardId: board.id,
    currentUserId,
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, board);
    queryClient.setQueryData(membersQueryKey, members);
  }, [board, members, membersQueryKey, queryClient, queryKey]);

  return (
    <header className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
      <div className="min-w-0">
        <Button asChild size="sm" variant="ghost" className="mb-3 -ml-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <h1 className="truncate text-xl font-semibold">{currentBoard.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created {dateFormatter.format(new Date(currentBoard.created_at))}
        </p>
        <BoardMembersPreview members={currentMembers} />
        {membersRealtimeError ? (
          <p className="mt-2 text-xs text-destructive">
            {membersRealtimeError}
          </p>
        ) : null}
      </div>
      <BoardActionsMenu
        board={currentBoard}
        currentUserId={currentUserId}
        members={currentMembers}
      />
    </header>
  );
};
