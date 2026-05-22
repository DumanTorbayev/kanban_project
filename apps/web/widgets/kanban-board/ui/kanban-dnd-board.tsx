"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type KanbanCard as KanbanCardModel } from "@/entities/kanban/model/types";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import {
  moveCard,
  type MoveCardInput,
} from "@/features/move-card/actions/move-card";

import { findCardLocation, moveCardInColumns } from "../lib/dnd";
import { KanbanColumnPanel } from "./kanban-column-panel";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
}

export const KanbanDndBoard = ({ boardId, columns }: Props) => {
  const router = useRouter();
  const [localColumns, setLocalColumns] = useState(columns);
  const [activeCard, setActiveCard] = useState<KanbanCardModel | null>(null);
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
  const moveCardMutation = useMutation({
    mutationFn: (input: MoveCardInput) => moveCard(input),
    onSuccess: () => {
      setMoveError(null);
      router.refresh();
    },
  });

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const location = findCardLocation(localColumns, activeId);

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

    const previousColumns = localColumns;
    const nextState = moveCardInColumns(previousColumns, activeId, overId);

    if (!nextState) {
      return;
    }

    setLocalColumns(nextState.columns);
    moveCardMutation.mutate(
      {
        boardId,
        cardId: nextState.cardId,
        columnId: nextState.columnId,
        position: nextState.position,
      },
      {
        onError: (error) => {
          setLocalColumns(previousColumns);
          setMoveError(
            error instanceof Error ? error.message : "Could not move card.",
          );
        },
      },
    );
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
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
          <div className="flex min-h-112 gap-4">
            {localColumns.map((column) => (
              <KanbanColumnPanel
                boardId={boardId}
                column={column}
                isMutating={moveCardMutation.isPending}
                key={column.id}
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
    </DndContext>
  );
};
