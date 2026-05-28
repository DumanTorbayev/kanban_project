"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { boardTimeEntriesQueryKey } from "@/entities/time-entry/model/query-keys";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

interface Props {
  boardId: string;
  initialTimeEntries: CompletedTimeEntry[];
}

export const useTimeEntriesHistory = ({
  boardId,
  initialTimeEntries,
}: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardTimeEntriesQueryKey(boardId), [boardId]);
  const { data: timeEntries = initialTimeEntries } = useQuery({
    enabled: false,
    initialData: initialTimeEntries,
    queryFn: () => Promise.resolve(initialTimeEntries),
    queryKey,
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialTimeEntries);
  }, [initialTimeEntries, queryClient, queryKey]);

  return {
    timeEntries,
  };
};
