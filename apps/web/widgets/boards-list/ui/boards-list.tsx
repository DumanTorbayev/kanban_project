"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { boardsQueryKey } from "@/entities/board/model/query-keys";
import { type BoardListItem } from "@/entities/board/model/types";
import { BoardCard } from "@/entities/board/ui/board-card";
import { useBoardsRealtime } from "@/widgets/boards-list/model/use-boards-realtime";

interface Props {
  boards: BoardListItem[];
  currentUserId: string;
  error?: string;
}

export const BoardsList = ({ boards, currentUserId, error }: Props) => {
  const queryClient = useQueryClient();
  const { error: realtimeError, status: realtimeStatus } = useBoardsRealtime({
    currentUserId,
  });
  const { data: currentBoards = boards } = useQuery({
    enabled: false,
    initialData: boards,
    queryFn: () => Promise.resolve(boards),
    queryKey: boardsQueryKey,
  });
  const hasBoards = currentBoards.length > 0;

  useEffect(() => {
    queryClient.setQueryData(boardsQueryKey, boards);
  }, [boards, queryClient]);

  return (
    <section className="rounded-lg border bg-background p-5 shadow-sm">
      <span className="sr-only" data-testid="dashboard-realtime-status">
        {realtimeStatus}
      </span>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Boards</h2>
          <p className="text-sm text-muted-foreground">
            Boards available to your account through Supabase RLS.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentBoards.length} total
        </span>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!error && realtimeError ? (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {realtimeError}
        </p>
      ) : null}

      {!error && !hasBoards ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h3 className="text-sm font-medium">No boards yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first board to start organizing work.
          </p>
        </div>
      ) : null}

      {!error && hasBoards ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentBoards.map((board) => (
            <BoardCard board={board} key={board.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
