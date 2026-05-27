"use client";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import {
  type ActiveTimeEntry,
  type BoardTimeSummary,
  type CompletedTimeEntry,
} from "@/entities/time-entry/model/types";
import { useCardTimer } from "@/features/track-card-time/model/use-card-timer";
import { useTimeEntriesHistory } from "@/features/track-card-time/model/use-time-entries-history";
import { useTimeEntriesSummary } from "@/features/track-card-time/model/use-time-entries-summary";
import { TimeEntriesHistory } from "@/features/track-card-time/ui/time-entries-history";
import { TimeEntriesSummary } from "@/features/track-card-time/ui/time-entries-summary";

import { useCreateCardDialog } from "../model/use-create-card-dialog";
import { useKanbanBoardCache } from "../model/use-kanban-board-cache";
import { useKanbanCardMove } from "../model/use-kanban-card-move";
import { useKanbanDnd } from "../model/use-kanban-dnd";
import { KanbanColumnPanel } from "./kanban-column-panel";

const CreateCardDialog = dynamic(() =>
  import("@/features/create-card/ui/create-card-dialog").then(
    (module) => module.CreateCardDialog,
  ),
);

interface Props {
  activeTimeEntry: ActiveTimeEntry | null;
  boardId: string;
  columns: KanbanColumnWithCards[];
  timeEntries: CompletedTimeEntry[];
  timeSummary: BoardTimeSummary;
}

export const KanbanDndBoard = ({
  activeTimeEntry,
  boardId,
  columns: initialColumns,
  timeEntries: initialTimeEntries,
  timeSummary: initialTimeSummary,
}: Props) => {
  const { columns, queryClient, queryKey } = useKanbanBoardCache({
    boardId,
    initialColumns,
  });
  const cardTitlesById = useMemo(() => {
    const nextCardTitlesById: Record<string, string> = {};

    for (const column of columns) {
      for (const card of column.cards) {
        nextCardTitlesById[card.id] = card.title;
      }
    }

    return nextCardTitlesById;
  }, [columns]);
  const createCardDialog = useCreateCardDialog();
  const timeEntriesSummary = useTimeEntriesSummary({
    boardId,
    initialSummary: initialTimeSummary,
  });
  const timeEntriesHistory = useTimeEntriesHistory({
    boardId,
    initialTimeEntries,
  });
  const timer = useCardTimer({
    boardId,
    initialActiveTimeEntry: activeTimeEntry,
  });
  const cardMove = useKanbanCardMove({
    queryClient,
    queryKey,
  });
  const dnd = useKanbanDnd({
    boardId,
    columns,
    isMoving: cardMove.isMoving,
    onMoveCard: cardMove.moveCard,
    onMoveErrorReset: cardMove.resetMoveError,
  });

  return (
    <DndContext
      id={"kanban-board-" + boardId}
      collisionDetection={dnd.collisionDetection}
      onDragEnd={dnd.handleDragEnd}
      onDragStart={dnd.handleDragStart}
      sensors={dnd.sensors}
    >
      <div className="space-y-3">
        <TimeEntriesSummary
          activeTimeEntry={timer.activeTimeEntry}
          cardTitlesById={cardTitlesById}
          summary={timeEntriesSummary.summary}
        />

        <TimeEntriesHistory
          cardTitlesById={cardTitlesById}
          timeEntries={timeEntriesHistory.timeEntries}
        />

        {cardMove.moveError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {cardMove.moveError}
          </p>
        ) : null}

        {timer.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {timer.error}
          </p>
        ) : null}

        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-h-112 min-w-full gap-4">
            {columns.map((column) => (
              <KanbanColumnPanel
                column={column}
                isMutating={cardMove.isMoving}
                key={column.id}
                onCreateCard={createCardDialog.openForColumn}
                timer={timer}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {dnd.activeCard ? (
          <div className="w-72 rotate-2 opacity-95 shadow-lg">
            <KanbanCard card={dnd.activeCard} className="pr-9" />
          </div>
        ) : null}
      </DragOverlay>

      {createCardDialog.open ? (
        <CreateCardDialog
          boardId={boardId}
          key={createCardDialog.dialogKey}
          columns={columns}
          onOpenChange={createCardDialog.handleOpenChange}
          open={createCardDialog.open}
          selectedColumnId={createCardDialog.columnId}
        />
      ) : null}
    </DndContext>
  );
};
