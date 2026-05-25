import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

export type KanbanCardRow = Omit<KanbanCard, "position"> & {
  position: number | string;
};

export type KanbanColumnRow = Omit<KanbanColumn, "position"> & {
  position: number | string;
};

const normalizePosition = (position: number | string) => {
  const parsedPosition = Number(position);

  if (!Number.isFinite(parsedPosition) || parsedPosition < 0) {
    return 0;
  }

  return parsedPosition;
};

export const normalizeKanbanCard = (card: KanbanCardRow): KanbanCard => ({
  ...card,
  position: normalizePosition(card.position),
});

export const normalizeKanbanColumn = (
  column: KanbanColumnRow,
): KanbanColumn => ({
  ...column,
  position: normalizePosition(column.position),
});

export const normalizeKanbanBoard = (
  columns: KanbanColumnRow[],
  cards: KanbanCardRow[],
): KanbanColumnWithCards[] => {
  const normalizedColumns = columns.map(normalizeKanbanColumn);
  const cardsByColumn = new Map<string, KanbanCard[]>();

  for (const card of cards.map(normalizeKanbanCard)) {
    const columnCards = cardsByColumn.get(card.column_id) ?? [];
    columnCards.push(card);
    cardsByColumn.set(card.column_id, columnCards);
  }

  return normalizedColumns.map((column) => ({
    ...column,
    cards: cardsByColumn.get(column.id) ?? [],
  }));
};
