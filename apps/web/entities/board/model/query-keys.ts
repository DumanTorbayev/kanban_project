export const boardsQueryKey = ["boards"] as const;

export const boardQueryKey = (boardId: string) => ["board", boardId] as const;
