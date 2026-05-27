"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { boardTimeSummaryQueryKey } from "@/entities/time-entry/model/query-keys";
import { type BoardTimeSummary } from "@/entities/time-entry/model/types";

interface Props {
  boardId: string;
  initialSummary: BoardTimeSummary;
}

export const useTimeEntriesSummary = ({ boardId, initialSummary }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardTimeSummaryQueryKey(boardId), [boardId]);
  const { data: summary = initialSummary } = useQuery({
    enabled: false,
    initialData: initialSummary,
    queryFn: () => Promise.resolve(initialSummary),
    queryKey,
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialSummary);
  }, [initialSummary, queryClient, queryKey]);

  return {
    summary,
  };
};
