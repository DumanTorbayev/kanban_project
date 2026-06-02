import { AppContainer } from "@/shared/ui/app-container";
import { BoardHeaderSkeleton } from "@/widgets/board-header/ui/board-header-skeleton";
import { KanbanBoardSkeleton } from "@/widgets/kanban-board/ui/kanban-board-skeleton";

const BoardLoading = () => (
  <main aria-busy="true" className="min-h-svh bg-muted/30 p-6">
    <span className="sr-only">Loading board</span>
    <AppContainer>
      <BoardHeaderSkeleton />
      <KanbanBoardSkeleton />
    </AppContainer>
  </main>
);

export default BoardLoading;
