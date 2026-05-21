import { BoardCard } from "@/entities/board/ui/board-card";
import { type BoardListItem } from "@/entities/board/model/types";

type BoardsListProps = {
  boards: BoardListItem[];
  error?: string;
};

export function BoardsList({ boards, error }: BoardsListProps) {
  const hasBoards = boards.length > 0;

  return (
    <section className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Boards</h2>
          <p className="text-sm text-muted-foreground">
            Boards available to your account through Supabase RLS.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {boards.length} total
        </span>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!error && !hasBoards ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h3 className="text-sm font-medium">No boards yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first board to start organizing work.
          </p>
        </div>
      ) : null}

      {!error && hasBoards ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard board={board} key={board.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
