"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type KanbanCard as KanbanCardModel } from "@/entities/kanban/model/types";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import { CreateCardForm } from "@/features/create-card/ui/create-card-form";
import {
  moveCard,
  type MoveCardInput,
} from "@/features/move-card/actions/move-card";
import { cn } from "@workspace/ui/lib/utils";

import { findCardLocation, moveCardInColumns } from "../lib/dnd";

type KanbanDndBoardProps = {
  boardId: string;
  columns: KanbanColumnWithCards[];
};

export function KanbanDndBoard({ boardId, columns }: KanbanDndBoardProps) {
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

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const location = findCardLocation(localColumns, activeId);

    setMoveError(null);
    setActiveCard(location?.card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
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
  }

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
}

type KanbanColumnPanelProps = {
  boardId: string;
  column: KanbanColumnWithCards;
  isMutating: boolean;
};

function KanbanColumnPanel({
  boardId,
  column,
  isMutating,
}: KanbanColumnPanelProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <section
      className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/40 p-3 shadow-sm"
      ref={setNodeRef}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-semibold">{column.title}</h2>
        <span className="rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
          {column.cards.length}
        </span>
      </header>

      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "flex flex-1 flex-col gap-2 rounded-md transition-colors",
            isOver && "bg-primary/5",
          )}
        >
          {column.cards.length > 0 ? (
            column.cards.map((card) => (
              <SortableKanbanCard
                card={card}
                disabled={isMutating}
                key={card.id}
              />
            ))
          ) : (
            <div className="rounded-md border border-dashed bg-background/70 p-4 text-center text-sm text-muted-foreground">
              No cards
            </div>
          )}
        </div>
      </SortableContext>

      <div className="mt-3 border-t pt-3">
        <CreateCardForm boardId={boardId} columnId={column.id} />
      </div>
    </section>
  );
}

type SortableKanbanCardProps = {
  card: KanbanCardModel;
  disabled: boolean;
};

function SortableKanbanCard({ card, disabled }: SortableKanbanCardProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    disabled,
    id: card.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={isDragging ? "opacity-40" : undefined}
      ref={setNodeRef}
      style={style}
    >
      <div className="group relative">
        <button
          aria-label="Drag card"
          className="absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
          disabled={disabled}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <KanbanCard card={card} className="pr-9" />
      </div>
    </div>
  );
}
