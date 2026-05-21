export type KanbanCard = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  created_by: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
};

export type KanbanColumn = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type KanbanColumnWithCards = KanbanColumn & {
  cards: KanbanCard[];
};
