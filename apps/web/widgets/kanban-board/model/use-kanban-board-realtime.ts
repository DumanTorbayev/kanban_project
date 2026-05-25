"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { getKanbanBoard } from "@/entities/kanban/api/get-kanban-board";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { createClient } from "@/lib/supabase/client";

type RealtimeStatus =
  | "idle"
  | "subscribed"
  | "timed_out"
  | "channel_error"
  | "closed";

interface Props {
  boardId: string;
}

export const useKanbanBoardRealtime = ({ boardId }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("idle");

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();
    const syncBoard = async () => {
      const result = await getKanbanBoard(supabase, boardId);

      if (!isActive) {
        return;
      }

      if (result.error) {
        setError(result.error.message);
        return;
      }

      queryClient.setQueryData<KanbanColumnWithCards[]>(
        queryKey,
        result.data ?? [],
      );
      setError(null);
    };

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
        () => {
          void syncBoard();
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
        () => {
          void syncBoard();
        },
      )
      .subscribe((nextStatus, subscribeError) => {
        if (nextStatus === "SUBSCRIBED") {
          setStatus("subscribed");
          setError(null);
          return;
        }

        if (nextStatus === "TIMED_OUT") {
          setStatus("timed_out");
          setError(
            "Realtime connection timed out. Check Supabase Realtime settings.",
          );
          return;
        }

        if (nextStatus === "CHANNEL_ERROR") {
          setStatus("channel_error");
          setError(
            subscribeError?.message ??
              "Realtime channel error. Check publication and RLS access.",
          );
          return;
        }

        if (nextStatus === "CLOSED") {
          setStatus("closed");
        }
      });

    return () => {
      isActive = false;
      void supabase.removeChannel(channel);
    };
  }, [boardId, queryClient, queryKey]);

  return {
    error,
    status,
  };
};
