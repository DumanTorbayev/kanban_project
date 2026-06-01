import { getBoards } from "@/entities/board/api/get-boards";
import { CreateBoardForm } from "@/features/create-board/ui/create-board-form";
import { requireUser } from "@/shared/lib/auth/require-user";
import { AppContainer } from "@/shared/ui/app-container";
import { BoardsList } from "@/widgets/boards-list/ui/boards-list";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/dashboard-header";

const DashboardPage = async () => {
  const { user } = await requireUser({
    redirectTo: "/dashboard",
  });
  const { data: boards, error: boardsError } = await getBoards();

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <AppContainer>
        <DashboardHeader email={user.email} />
        <CreateBoardForm />
        <BoardsList
          boards={boards ?? []}
          currentUserId={user.id}
          error={boardsError?.message}
        />
      </AppContainer>
    </main>
  );
};

export default DashboardPage;
