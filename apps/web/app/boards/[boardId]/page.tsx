import { notFound } from "next/navigation";

import { getBoard } from "@/entities/board/api/get-board";
import { requireUser } from "@/shared/lib/auth/require-user";
import { BoardHeader } from "@/widgets/board-header/ui/board-header";
import { KanbanPlaceholder } from "@/widgets/kanban-placeholder/ui/kanban-placeholder";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const { supabase } = await requireUser({
    redirectTo: `/boards/${boardId}`,
  });
  const { data: board, error } = await getBoard(supabase, boardId);

  if (error || !board) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <BoardHeader board={board} />
        <KanbanPlaceholder />
      </section>
    </main>
  );
}
