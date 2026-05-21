import { notFound } from "next/navigation";

import { getBoard } from "@/entities/board/api/get-board";
import { getKanbanBoard } from "@/entities/kanban/api/get-kanban-board";
import { requireUser } from "@/shared/lib/auth/require-user";
import { AppContainer } from "@/shared/ui/app-container";
import { BoardHeader } from "@/widgets/board-header/ui/board-header";
import { KanbanBoard } from "@/widgets/kanban-board/ui/kanban-board";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function BoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const { boardId } = await params;
  const queryParams = await searchParams;
  const { supabase } = await requireUser({
    redirectTo: "/boards/" + boardId,
  });
  const [boardResult, kanbanResult] = await Promise.all([
    getBoard(supabase, boardId),
    getKanbanBoard(supabase, boardId),
  ]);

  if (boardResult.error || !boardResult.data) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <AppContainer>
        <BoardHeader board={boardResult.data} />
        <KanbanBoard
          boardId={boardResult.data.id}
          columns={kanbanResult.data ?? []}
          error={queryParams?.error ?? kanbanResult.error?.message}
        />
      </AppContainer>
    </main>
  );
}
