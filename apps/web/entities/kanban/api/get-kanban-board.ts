import { type createClient } from "@/lib/supabase/server";

import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getKanbanBoard(
  supabase: SupabaseServerClient,
  boardId: string,
) {
  const [columnsResult, cardsResult] = await Promise.all([
    supabase
      .from("board_columns")
      .select("id, board_id, title, position, created_at, updated_at")
      .eq("board_id", boardId)
      .order("position", {
        ascending: true,
      }),
    supabase
      .from("cards")
      .select(
        "id, board_id, column_id, title, description, position, created_by, assignee_id, created_at, updated_at",
      )
      .eq("board_id", boardId)
      .order("position", {
        ascending: true,
      }),
  ]);

  if (columnsResult.error) {
    return {
      data: null,
      error: columnsResult.error,
    };
  }

  if (cardsResult.error) {
    return {
      data: null,
      error: cardsResult.error,
    };
  }

  const columns = (columnsResult.data ?? []) as KanbanColumn[];
  const cards = (cardsResult.data ?? []) as KanbanCard[];
  const cardsByColumn = new Map<string, KanbanCard[]>();

  for (const card of cards) {
    const columnCards = cardsByColumn.get(card.column_id) ?? [];
    columnCards.push(card);
    cardsByColumn.set(card.column_id, columnCards);
  }

  const boardColumns: KanbanColumnWithCards[] = columns.map((column) => ({
    ...column,
    cards: cardsByColumn.get(column.id) ?? [],
  }));

  return {
    data: boardColumns,
    error: null,
  };
}
