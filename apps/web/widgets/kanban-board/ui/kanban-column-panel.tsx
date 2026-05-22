"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { CreateCardForm } from "@/features/create-card/ui/create-card-form";
import { ColumnActionsMenu } from "@/features/manage-kanban-column/ui/column-actions-menu";
import { cn } from "@workspace/ui/lib/utils";

import { SortableKanbanCard } from "./sortable-kanban-card";

interface Props {
  boardId: string;
  column: KanbanColumnWithCards;
  isMutating: boolean;
}

export const KanbanColumnPanel = ({ boardId, column, isMutating }: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <section
      className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/40 p-3 shadow-sm"
      ref={setNodeRef}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{column.title}</h2>
          <span className="rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {column.cards.length}
          </span>
        </div>
        <ColumnActionsMenu column={column} disabled={isMutating} />
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
};
