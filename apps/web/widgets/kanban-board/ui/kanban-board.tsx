import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { KanbanCard } from "@/entities/kanban/ui/kanban-card";
import { CreateCardForm } from "@/features/create-card/ui/create-card-form";
import { CreateKanbanColumnForm } from "@/features/create-kanban-column/ui/create-kanban-column-form";

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
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-h-112 gap-4">
            {columns.map((column) => (
              <KanbanColumnPanel
                boardId={boardId}
                column={column}
                key={column.id}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

type KanbanColumnPanelProps = {
  boardId: string;
  column: KanbanColumnWithCards;
};

function KanbanColumnPanel({ boardId, column }: KanbanColumnPanelProps) {
  return (
    <section className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/40 p-3 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-semibold">{column.title}</h2>
        <span className="rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
          {column.cards.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2">
        {column.cards.length > 0 ? (
          column.cards.map((card) => <KanbanCard card={card} key={card.id} />)
        ) : (
          <div className="rounded-md border border-dashed bg-background/70 p-4 text-center text-sm text-muted-foreground">
            No cards
          </div>
        )}
      </div>

      <div className="mt-3 border-t pt-3">
        <CreateCardForm boardId={boardId} columnId={column.id} />
      </div>
    </section>
  );
}
