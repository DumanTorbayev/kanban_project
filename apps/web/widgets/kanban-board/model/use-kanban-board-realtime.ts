"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  addCardToBoard,
  addColumnToBoard,
  removeCardFromBoard,
  removeColumnFromBoard,
  replaceCardInBoard,
  replaceColumnInBoard,
} from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { createClient } from "@/lib/supabase/client";

type RealtimePayload<T> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<T>;
  old: Partial<T>;
};

interface Props {
  boardId: string;
}

const toColumnWithCards = (column: KanbanColumn): KanbanColumnWithCards => ({
  ...column,
  cards: [],
});

const applyColumnChange = (
  columns: KanbanColumnWithCards[] | undefined,
  payload: RealtimePayload<KanbanColumn>,
) => {
  const currentColumns = columns ?? [];

  if (payload.eventType === "DELETE") {
    return payload.old.id
      ? removeColumnFromBoard(currentColumns, payload.old.id)
      : currentColumns;
  }

  const column = payload.new as KanbanColumn;

  return payload.eventType === "INSERT"
    ? addColumnToBoard(currentColumns, toColumnWithCards(column))
    : replaceColumnInBoard(currentColumns, column);
};

const applyCardChange = (
  columns: KanbanColumnWithCards[] | undefined,
  payload: RealtimePayload<KanbanCard>,
) => {
  const currentColumns = columns ?? [];

  if (payload.eventType === "DELETE") {
    return payload.old.id
      ? removeCardFromBoard(currentColumns, payload.old.id)
      : currentColumns;
  }

  const card = payload.new as KanbanCard;

  return payload.eventType === "INSERT"
    ? addCardToBoard(currentColumns, card)
    : replaceCardInBoard(currentColumns, card);
};

export const useKanbanBoardRealtime = ({ boardId }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("kanban-board:" + boardId)
      .on<KanbanColumn>(
        "postgres_changes",
        {
          event: "*",
          filter: "board_id=eq." + boardId,
          schema: "public",
          table: "board_columns",
        },
        (payload) => {
          queryClient.setQueryData<KanbanColumnWithCards[]>(
            queryKey,
            (current) => applyColumnChange(current, payload),
          );
        },
      )
      .on<KanbanCard>(
        "postgres_changes",
        {
          event: "*",
          filter: "board_id=eq." + boardId,
          schema: "public",
          table: "cards",
        },
        (payload) => {
          queryClient.setQueryData<KanbanColumnWithCards[]>(
            queryKey,
            (current) => applyCardChange(current, payload),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, queryClient, queryKey]);
};
