"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useRef } from "react";

import { type KanbanCard } from "@/entities/kanban/model/types";
import { type CardTimerControls } from "@/features/track-card-time/model/use-card-timer";
import { cn } from "@workspace/ui/lib/utils";

import { SortableKanbanCard } from "./sortable-kanban-card";

const ESTIMATED_CARD_HEIGHT = 148;

interface Props {
  cards: KanbanCard[];
  disabled: boolean;
  isOver: boolean;
  timer: CardTimerControls;
}

export const VirtualizedKanbanCardList = ({
  cards,
  disabled,
  isOver,
  timer,
}: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual exposes imperative measurement helpers by design.
  const rowVirtualizer = useVirtualizer({
    count: cards.length,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    getItemKey: (index) => cards[index]?.id ?? index,
    getScrollElement: () => parentRef.current,
    overscan: 6,
  });

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto rounded-md pr-1 transition-colors",
          isOver && "bg-primary/5",
        )}
        ref={parentRef}
      >
        {cards.length > 0 ? (
          <div
            className="relative w-full"
            style={{
              height: rowVirtualizer.getTotalSize(),
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const card = cards[virtualRow.index];

              if (!card) {
                return null;
              }

              return (
                <div
                  className="absolute top-0 left-0 w-full pb-2"
                  data-index={virtualRow.index}
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SortableKanbanCard
                    card={card}
                    disabled={disabled}
                    timer={timer}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed bg-background/70 p-4 text-center text-sm text-muted-foreground">
            No cards
          </div>
        )}
      </div>
    </SortableContext>
  );
};
