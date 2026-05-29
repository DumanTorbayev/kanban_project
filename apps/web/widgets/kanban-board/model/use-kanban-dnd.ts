"use client";

import {
  closestCorners,
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
import { useState } from "react";

import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";

import { findCardLocation, moveCardInColumns } from "../lib/dnd";
import { type MoveCardMutationInput } from "./use-kanban-card-move";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
  isMoving: boolean;
  onMoveCard: (input: MoveCardMutationInput) => void;
  onMoveErrorReset: () => void;
}

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0
    ? pointerCollisions
    : closestCorners(args);
};

export const useKanbanDnd = ({
  boardId,
  columns,
  isMoving,
  onMoveCard,
  onMoveErrorReset,
}: Props) => {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
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

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const location = findCardLocation(columns, activeId);

    onMoveErrorReset();
    setActiveCard(location?.card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;

    setActiveCard(null);

    if (!overId || activeId === overId || isMoving) {
      return;
    }

    const nextState = moveCardInColumns(columns, activeId, overId);

    if (!nextState) {
      return;
    }

    onMoveCard({
      boardId,
      cardId: nextState.cardId,
      columnId: nextState.columnId,
      nextCardId: nextState.nextCardId,
      nextColumns: nextState.columns,
      position: nextState.position,
      previousCardId: nextState.previousCardId,
    });
  };

  return {
    activeCard,
    collisionDetection: kanbanCollisionDetection,
    handleDragEnd,
    handleDragStart,
    sensors,
  };
};
