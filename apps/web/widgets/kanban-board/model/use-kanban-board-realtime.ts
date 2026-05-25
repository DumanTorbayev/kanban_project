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

export type KanbanRealtimeStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

interface Props {
  boardId: string;
}

export const useKanbanBoardRealtime = ({ boardId }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<KanbanRealtimeStatus>("connecting");

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
    const syncBoardSnapshot = () => {
      void syncBoard();
    };
    const handleOnline = () => {
      setStatus("reconnecting");
      syncBoardSnapshot();
    };
    const handleOffline = () => {
      setStatus("disconnected");
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncBoardSnapshot();
      }
    };

    queueMicrotask(() => {
      if (isActive && !navigator.onLine) {
        setStatus("disconnected");
      }
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

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
        syncBoardSnapshot,
      )
      .on<KanbanCard>(
        "postgres_changes",
        {
          event: "*",
          filter: "board_id=eq." + boardId,
          schema: "public",
          table: "cards",
        },
        syncBoardSnapshot,
      )
      .subscribe((nextStatus, subscribeError) => {
        if (!isActive) {
          return;
        }

        if (nextStatus === "SUBSCRIBED") {
          setStatus("connected");
          setError(null);
          syncBoardSnapshot();
          return;
        }

        if (nextStatus === "TIMED_OUT") {
          setStatus("reconnecting");
          setError(
            "Realtime connection timed out. Trying to reconnect with Supabase.",
          );
          return;
        }

        if (nextStatus === "CHANNEL_ERROR") {
          setStatus("error");
          setError(
            subscribeError?.message ??
              "Realtime channel error. Check publication and RLS access.",
          );
          return;
        }

        if (nextStatus === "CLOSED") {
          setStatus("disconnected");
        }
      });

    return () => {
      isActive = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [boardId, queryClient, queryKey]);

  return {
    error,
    status,
  };
};
