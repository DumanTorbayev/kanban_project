export const kanbanBoardQueryKey = (boardId: string) =>
  ["kanban-board", boardId] as const;
