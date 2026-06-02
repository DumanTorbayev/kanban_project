import { CreateBoardFormSkeleton } from "@/features/create-board/ui/create-board-form-skeleton";
import { AppContainer } from "@/shared/ui/app-container";
import { BoardsListSkeleton } from "@/widgets/boards-list/ui/boards-list-skeleton";
import { DashboardHeaderSkeleton } from "@/widgets/dashboard-header/ui/dashboard-header-skeleton";

const DashboardLoading = () => (
  <main aria-busy="true" className="min-h-svh bg-muted/30 p-6">
    <span className="sr-only">Loading dashboard</span>
    <AppContainer>
      <DashboardHeaderSkeleton />
      <CreateBoardFormSkeleton />
      <BoardsListSkeleton />
    </AppContainer>
  </main>
);

export default DashboardLoading;
