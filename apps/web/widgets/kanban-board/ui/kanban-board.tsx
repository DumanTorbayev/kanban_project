"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { CreateKanbanColumnForm } from "@/features/create-kanban-column/ui/create-kanban-column-form";

import { useKanbanBoardRealtime } from "../model/use-kanban-board-realtime";

import { KanbanDndBoard } from "./kanban-dnd-board";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
  error?: string;
}

export const KanbanBoard = ({
  boardId,
  columns: initialColumns,
  error,
}: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const { data: columns = initialColumns } = useQuery({
    enabled: false,
    initialData: initialColumns,
    queryFn: () => Promise.resolve(initialColumns),
    queryKey,
  });
  const { error: realtimeError } = useKanbanBoardRealtime({
    boardId,
  });
  const hasColumns = columns.length > 0;

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialColumns);
  }, [initialColumns, queryClient, queryKey]);

  return (
    <section className="space-y-4">
      <CreateKanbanColumnForm boardId={boardId} />

      {realtimeError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {realtimeError}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!error && !hasColumns ? (
        <div className="rounded-lg border border-dashed bg-background p-8 text-center shadow-sm">
          <h2 className="text-sm font-medium">No columns yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the first workflow column for this board.
          </p>
        </div>
      ) : null}

      {!error && hasColumns ? (
        <KanbanDndBoard boardId={boardId} columns={columns} />
      ) : null}
    </section>
  );
};
