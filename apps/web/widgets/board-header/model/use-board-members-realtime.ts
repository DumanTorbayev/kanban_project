"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getBoardMembers } from "@/entities/board-member/api/get-board-members";
import { boardMembersQueryKey } from "@/entities/board-member/model/query-keys";
import {
  type BoardMember,
  type BoardMemberRole,
} from "@/entities/board-member/model/types";
import { createClient } from "@/lib/supabase/client";
import { useReconnectSignals } from "@/shared/lib/browser/use-reconnect-signals";

const RESYNC_DEBOUNCE_MS = 150;

type BoardMemberRealtimeRow = {
  board_id: string;
  created_at: string;
  role: BoardMemberRole;
  user_id: string;
};

type BoardMemberRealtimePayload = {
  eventType?: "INSERT" | "UPDATE" | "DELETE";
  new?: Partial<BoardMemberRealtimeRow>;
  old?: Partial<BoardMemberRealtimeRow>;
};

interface Props {
  boardId: string;
  currentUserId: string;
}

export const useBoardMembersRealtime = ({ boardId, currentUserId }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const queryKey = useMemo(() => boardMembersQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());
  const resyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const redirectAfterAccessLoss = useCallback(() => {
    router.replace("/dashboard");
    router.refresh();
  }, [router]);

  const syncMembers = useCallback(async () => {
    const result = await getBoardMembers(supabase, boardId);

    if (result.error) {
      setError(result.error.message);

      if (result.error.message.toLowerCase().includes("access")) {
        redirectAfterAccessLoss();
      }

      return;
    }

    const nextMembers = result.data ?? [];
    queryClient.setQueryData<BoardMember[]>(queryKey, nextMembers);

    if (!nextMembers.some((member) => member.user_id === currentUserId)) {
      redirectAfterAccessLoss();
      return;
    }

    setError(null);
  }, [
    boardId,
    currentUserId,
    queryClient,
    queryKey,
    redirectAfterAccessLoss,
    supabase,
  ]);

  const scheduleSync = useCallback(() => {
    if (resyncTimerRef.current) {
      clearTimeout(resyncTimerRef.current);
    }

    resyncTimerRef.current = setTimeout(() => {
      resyncTimerRef.current = null;
      void syncMembers();
    }, RESYNC_DEBOUNCE_MS);
  }, [syncMembers]);

  const handleOffline = useCallback(() => {
    setError("Member realtime connection is offline.");
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
      .channel("board-members:" + boardId)
      .on<BoardMemberRealtimeRow>(
        "postgres_changes",
        {
          event: "*",
          filter: "board_id=eq." + boardId,
          schema: "public",
          table: "board_members",
        },
        (payload: BoardMemberRealtimePayload) => {
          if (!isActive) {
            return;
          }

          if (
            payload.eventType === "DELETE" &&
            payload.old?.user_id === currentUserId
          ) {
            queryClient.setQueryData<BoardMember[]>(queryKey, (current) =>
              (current ?? []).filter(
                (member) => member.user_id !== currentUserId,
              ),
            );
            redirectAfterAccessLoss();
            return;
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
              "Member realtime channel error. Check publication and RLS access.",
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
  }, [
    boardId,
    currentUserId,
    queryClient,
    queryKey,
    redirectAfterAccessLoss,
    scheduleSync,
    supabase,
  ]);

  return {
    error,
  };
};
