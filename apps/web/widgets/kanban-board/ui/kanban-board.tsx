import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { CreateKanbanColumnForm } from "@/features/create-kanban-column/ui/create-kanban-column-form";

import { KanbanDndBoard } from "./kanban-dnd-board";

type KanbanBoardProps = {
  boardId: string;
  columns: KanbanColumnWithCards[];
  error?: string;
};

export function KanbanBoard({ boardId, columns, error }: KanbanBoardProps) {
  const hasColumns = columns.length > 0;

  return (
    <section className="space-y-4">
      <CreateKanbanColumnForm boardId={boardId} />

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!error && !hasColumns ? (
        <div className="rounded-lg border border-dashed bg-background p-8 text-center shadow-sm">
          <h2 className="text-sm font-medium">No columns yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the first workflow column for this board.
          </p>
        </div>
      ) : null}

      {!error && hasColumns ? (
        <KanbanDndBoard boardId={boardId} columns={columns} />
      ) : null}
    </section>
  );
}
