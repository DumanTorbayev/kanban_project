"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { type KanbanCard as KanbanCardModel } from "@/entities/kanban/model/types";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import { CreateCardDialog } from "@/features/create-card/ui/create-card-dialog";
import {
  moveCard,
  type MoveCardInput,
} from "@/features/move-card/actions/move-card";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { findCardLocation, moveCardInColumns } from "../lib/dnd";
import { KanbanColumnPanel } from "./kanban-column-panel";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
}

type MoveCardMutationInput = MoveCardInput & {
  nextColumns: KanbanColumnWithCards[];
};

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0
    ? pointerCollisions
    : closestCorners(args);
};

export const KanbanDndBoard = ({ boardId, columns: initialColumns }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const { data: columns = initialColumns } = useQuery({
    enabled: false,
    initialData: initialColumns,
    queryFn: () => Promise.resolve(initialColumns),
    queryKey,
  });
  const [activeCard, setActiveCard] = useState<KanbanCardModel | null>(null);
  const [createCardColumnId, setCreateCardColumnId] = useState<string | null>(
    null,
  );
  const [createCardDialogKey, setCreateCardDialogKey] = useState(0);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const moveCardMutation = useMutation<
    MoveCardInput,
    Error,
    MoveCardMutationInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: (input) =>
      moveCard({
        boardId: input.boardId,
        cardId: input.cardId,
        columnId: input.columnId,
        position: input.position,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);

      queryClient.setQueryData(queryKey, input.nextColumns);
      setMoveError(null);

      return {
        previousColumns,
      };
    },
    onError: (error, _input, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }

      setMoveError(getErrorMessage(error, "Could not move card."));
    },
    onSuccess: () => {
      setMoveError(null);
      router.refresh();
    },
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialColumns);
  }, [initialColumns, queryClient, queryKey]);

  const handleCreateCard = (columnId: string) => {
    setCreateCardColumnId(columnId);
    setCreateCardDialogKey((currentKey) => currentKey + 1);
    setCreateCardOpen(true);
  };

  const handleCreateCardOpenChange = (open: boolean) => {
    setCreateCardOpen(open);

    if (!open) {
      setCreateCardColumnId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const location = findCardLocation(columns, activeId);

    setMoveError(null);
    setActiveCard(location?.card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    setActiveCard(null);

    if (!overId || activeId === overId || moveCardMutation.isPending) {
      return;
    }

    const nextState = moveCardInColumns(columns, activeId, overId);

    if (!nextState) {
      return;
    }

    moveCardMutation.mutate({
      boardId,
      cardId: nextState.cardId,
      columnId: nextState.columnId,
      nextColumns: nextState.columns,
      position: nextState.position,
    });
  };

  return (
    <DndContext
      id={"kanban-board-" + boardId}
      collisionDetection={kanbanCollisionDetection}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="space-y-3">
        {moveError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {moveError}
          </p>
        ) : null}

        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-h-112 min-w-full gap-4">
            {columns.map((column) => (
              <KanbanColumnPanel
                column={column}
                isMutating={moveCardMutation.isPending}
                key={column.id}
                onCreateCard={handleCreateCard}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="w-72 rotate-2 opacity-95 shadow-lg">
            <KanbanCard card={activeCard} className="pr-9" />
          </div>
        ) : null}
      </DragOverlay>

      <CreateCardDialog
        boardId={boardId}
        key={createCardDialogKey}
        columns={columns}
        onOpenChange={handleCreateCardOpenChange}
        open={createCardOpen}
        selectedColumnId={createCardColumnId}
      />
    </DndContext>
  );
};
