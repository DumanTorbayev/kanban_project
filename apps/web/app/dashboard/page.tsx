import { getBoards } from "@/entities/board/api/get-boards";
import { CreateBoardForm } from "@/features/create-board/ui/create-board-form";
import { requireUser } from "@/shared/lib/auth/require-user";
import { BoardsList } from "@/widgets/boards-list/ui/boards-list";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/dashboard-header";

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const { user } = await requireUser({ redirectTo: "/dashboard" });
  const { data: boards, error: boardsError } = await getBoards();

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <DashboardHeader email={user.email} />
        <CreateBoardForm error={params?.error} />
        <BoardsList boards={boards ?? []} error={boardsError?.message} />
      </section>
    </main>
  );
}
