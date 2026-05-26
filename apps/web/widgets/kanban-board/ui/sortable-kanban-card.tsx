"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type KanbanCard as KanbanCardModel } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import { CardActionsMenu } from "@/features/manage-card/ui/card-actions-menu";
import { type CardTimerControls } from "@/features/track-card-time/model/use-card-timer";
import { CardTimerControl } from "@/features/track-card-time/ui/card-timer-control";
import { cn } from "@workspace/ui/lib/utils";

const cardActionsClassName =
  "absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-data-[state=open]:opacity-100";

interface Props {
  card: KanbanCardModel;
  disabled: boolean;
  timer: CardTimerControls;
}

export const SortableKanbanCard = ({ card, disabled, timer }: Props) => {
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
        <div
          className={cn(
            "cursor-grab rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing",
            disabled && "cursor-default active:cursor-default",
          )}
          {...attributes}
          {...listeners}
        >
          <KanbanCard
            card={card}
            className="pr-12"
            footer={
              <CardTimerControl
                cardId={card.id}
                disabled={disabled}
                timer={timer}
              />
            }
          />
        </div>
        <div className={cardActionsClassName}>
          <CardActionsMenu card={card} disabled={disabled} />
        </div>
      </div>
    </div>
  );
};
