"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { ColumnActionsMenu } from "@/features/manage-kanban-column/ui/column-actions-menu";
import { type CardTimerControls } from "@/features/track-card-time/model/use-card-timer";
import { Button } from "@workspace/ui/components/button";

import { VirtualizedKanbanCardList } from "./virtualized-kanban-card-list";

interface Props {
  column: KanbanColumnWithCards;
  isMutating: boolean;
  timer: CardTimerControls;
  onCreateCard: (columnId: string) => void;
}

export const KanbanColumnPanel = ({
  column,
  isMutating,
  onCreateCard,
  timer,
}: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <section
      aria-label={column.title + " column"}
      className="flex h-[calc(100vh-18rem)] max-h-[44rem] min-h-112 min-w-72 flex-1 flex-col rounded-lg border bg-muted/40 p-3 shadow-sm"
      ref={setNodeRef}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{column.title}</h2>
          <span className="rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {column.cards.length}
          </span>
        </div>
        <ColumnActionsMenu column={column} disabled={isMutating} />
      </header>

      <Button
        aria-label={"Add card to " + column.title}
        className="mb-3 w-full"
        disabled={isMutating}
        onClick={() => onCreateCard(column.id)}
        size="sm"
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add card
      </Button>

      <VirtualizedKanbanCardList
        cards={column.cards}
        disabled={isMutating}
        isOver={isOver}
        timer={timer}
      />
    </section>
  );
};
