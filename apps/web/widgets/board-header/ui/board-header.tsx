"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { boardQueryKey } from "@/entities/board/model/query-keys";
import { type BoardDetails } from "@/entities/board/model/types";
import { BoardActionsMenu } from "@/features/manage-board/ui/board-actions-menu";
import { Button } from "@workspace/ui/components/button";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

interface Props {
  board: BoardDetails;
}

export const BoardHeader = ({ board }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardQueryKey(board.id), [board.id]);
  const { data: currentBoard = board } = useQuery({
    enabled: false,
    initialData: board,
    queryFn: () => Promise.resolve(board),
    queryKey,
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, board);
  }, [board, queryClient, queryKey]);

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
      </div>
      <BoardActionsMenu board={currentBoard} />
    </header>
  );
};
