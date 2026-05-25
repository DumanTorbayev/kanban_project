"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";

interface Props {
  boardId: string;
  initialColumns: KanbanColumnWithCards[];
}

export const useKanbanBoardCache = ({ boardId, initialColumns }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const { data: columns = initialColumns } = useQuery({
    enabled: false,
    initialData: initialColumns,
    queryFn: () => Promise.resolve(initialColumns),
    queryKey,
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialColumns);
  }, [initialColumns, queryClient, queryKey]);

  return {
    columns,
    queryClient,
    queryKey,
  };
};
