"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { type KanbanCard as KanbanCardModel } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";

const dragHandleClassName =
  "absolute top-2 right-2 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30";

interface Props {
  card: KanbanCardModel;
  disabled: boolean;
}

export const SortableKanbanCard = ({ card, disabled }: Props) => {
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
          className={dragHandleClassName}
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
};
