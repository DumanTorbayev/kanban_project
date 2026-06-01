"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { boardsQueryKey } from "@/entities/board/model/query-keys";
import { type BoardListItem } from "@/entities/board/model/types";
import { createClient } from "@/lib/supabase/client";
import { useReconnectSignals } from "@/shared/lib/browser/use-reconnect-signals";

const RESYNC_DEBOUNCE_MS = 150;

type BoardMemberRealtimeRow = {
  board_id: string;
  created_at: string;
  role: "owner" | "admin" | "member";
  user_id: string;
};

type BoardMemberRealtimePayload = {
  eventType?: "INSERT" | "UPDATE" | "DELETE";
  new?: Partial<BoardMemberRealtimeRow>;
  old?: Partial<BoardMemberRealtimeRow>;
};

interface Props {
  currentUserId: string;
}

export const useBoardsRealtime = ({ currentUserId }: Props) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());
  const resyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncBoards = useCallback(async () => {
    const { data, error: boardsError } = await supabase
      .from("boards")
      .select("id, title, created_at")
      .order("created_at", {
        ascending: false,
      });

    if (boardsError) {
      setError(boardsError.message);
      return;
    }

    queryClient.setQueryData<BoardListItem[]>(
      boardsQueryKey,
      (data ?? []) as BoardListItem[],
    );
    setError(null);
  }, [queryClient, supabase]);

  const scheduleSync = useCallback(() => {
    if (resyncTimerRef.current) {
      clearTimeout(resyncTimerRef.current);
    }

    resyncTimerRef.current = setTimeout(() => {
      resyncTimerRef.current = null;
      void syncBoards();
    }, RESYNC_DEBOUNCE_MS);
  }, [syncBoards]);

  const handleOffline = useCallback(() => {
    setError("Dashboard realtime connection is offline.");
  }, []);
  const handleOnline = useCallback(() => {
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
      .channel("dashboard-boards:" + currentUserId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boards",
        },
        scheduleSync,
      )
      .on<BoardMemberRealtimeRow>(
        "postgres_changes",
        {
          event: "*",
          filter: "user_id=eq." + currentUserId,
          schema: "public",
          table: "board_members",
        },
        (payload: BoardMemberRealtimePayload) => {
          if (!isActive) {
            return;
          }

          if (payload.eventType === "DELETE" && payload.old?.board_id) {
            queryClient.setQueryData<BoardListItem[]>(
              boardsQueryKey,
              (current) =>
                (current ?? []).filter(
                  (board) => board.id !== payload.old?.board_id,
                ),
            );
          }

          scheduleSync();
        },
      )
      .subscribe((nextStatus, subscribeError) => {
        if (!isActive) {
          return;
        }

        if (nextStatus === "SUBSCRIBED") {
          setError(null);
          scheduleSync();
          return;
        }

        if (nextStatus === "CHANNEL_ERROR") {
          setError(
            subscribeError?.message ??
              "Dashboard realtime channel error. Check publication and RLS access.",
          );
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
  }, [currentUserId, queryClient, scheduleSync, supabase]);

  return {
    error,
  };
};
