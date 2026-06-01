"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getKanbanBoard } from "@/entities/kanban/api/get-kanban-board";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { createClient } from "@/lib/supabase/client";
import { useReconnectSignals } from "@/shared/lib/browser/use-reconnect-signals";

const RESYNC_DEBOUNCE_MS = 150;

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
  const [supabase] = useState(() => createClient());
  const resyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncBoard = useCallback(async () => {
    const result = await getKanbanBoard(supabase, boardId);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    queryClient.setQueryData<KanbanColumnWithCards[]>(
      queryKey,
      result.data ?? [],
    );
    setError(null);
  }, [boardId, queryClient, queryKey, supabase]);

  const scheduleSync = useCallback(() => {
    if (resyncTimerRef.current) {
      clearTimeout(resyncTimerRef.current);
    }

    resyncTimerRef.current = setTimeout(() => {
      resyncTimerRef.current = null;
      void syncBoard();
    }, RESYNC_DEBOUNCE_MS);
  }, [syncBoard]);

  const handleOffline = useCallback(() => {
    setStatus("disconnected");
  }, []);
  const handleOnline = useCallback(() => {
    setStatus("reconnecting");
    scheduleSync();
  }, [scheduleSync]);

  useReconnectSignals({
    onOffline: handleOffline,
    onOnline: handleOnline,
    onVisible: scheduleSync,
  });

  useEffect(() => {
    let isActive = true;
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
        scheduleSync,
      )
      .on<KanbanCard>(
        "postgres_changes",
        {
          event: "*",
          filter: "board_id=eq." + boardId,
          schema: "public",
          table: "cards",
        },
        scheduleSync,
      )
      .subscribe((nextStatus, subscribeError) => {
        if (!isActive) {
          return;
        }

        if (nextStatus === "SUBSCRIBED") {
          setStatus("connected");
          setError(null);
          scheduleSync();
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

      if (resyncTimerRef.current) {
        clearTimeout(resyncTimerRef.current);
        resyncTimerRef.current = null;
      }

      void supabase.removeChannel(channel);
    };
  }, [boardId, scheduleSync, supabase]);

  return {
    error,
    status,
  };
};
