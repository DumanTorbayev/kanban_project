import { notFound } from "next/navigation";

import { getBoard } from "@/entities/board/api/get-board";
import { getKanbanBoard } from "@/entities/kanban/api/get-kanban-board";
import { getActiveTimeEntry } from "@/entities/time-entry/api/get-active-time-entry";
import { getBoardTimeSummary } from "@/entities/time-entry/api/get-board-time-summary";
import { requireUser } from "@/shared/lib/auth/require-user";
import { AppContainer } from "@/shared/ui/app-container";
import { BoardHeader } from "@/widgets/board-header/ui/board-header";
import { KanbanBoard } from "@/widgets/kanban-board/ui/kanban-board";

interface Props {
  params: Promise<{
    boardId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
}

const BoardPage = async ({ params, searchParams }: Props) => {
  const { boardId } = await params;
  const queryParams = await searchParams;
  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + boardId,
  });
  const [boardResult, kanbanResult, activeTimeEntryResult, timeSummaryResult] =
    await Promise.all([
      getBoard(supabase, boardId),
      getKanbanBoard(supabase, boardId),
      getActiveTimeEntry(supabase, boardId, user.id),
      getBoardTimeSummary(supabase, boardId),
    ]);

  if (boardResult.error || !boardResult.data) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <AppContainer>
        <BoardHeader board={boardResult.data} />
        <KanbanBoard
          activeTimeEntry={activeTimeEntryResult.data}
          boardId={boardResult.data.id}
          columns={kanbanResult.data ?? []}
          error={queryParams?.error ?? kanbanResult.error?.message}
          timeSummary={timeSummaryResult.data}
          timerError={
            activeTimeEntryResult.error?.message ??
            timeSummaryResult.error?.message
          }
        />
      </AppContainer>
    </main>
  );
};

export default BoardPage;
