import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

export type KanbanCardRow = Omit<KanbanCard, "position" | "tracked_seconds"> & {
  position: number | string;
  tracked_seconds?: number | string | null;
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

const normalizeTrackedSeconds = (
  trackedSeconds: number | string | null | undefined,
) => {
  const parsedTrackedSeconds = Number(trackedSeconds);

  if (!Number.isFinite(parsedTrackedSeconds) || parsedTrackedSeconds < 0) {
    return 0;
  }

  return Math.floor(parsedTrackedSeconds);
};

export const normalizeKanbanCard = (card: KanbanCardRow): KanbanCard => ({
  ...card,
  position: normalizePosition(card.position),
  tracked_seconds: normalizeTrackedSeconds(card.tracked_seconds),
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
  trackedSecondsByCard = new Map<string, number>(),
): KanbanColumnWithCards[] => {
  const normalizedColumns = columns.map(normalizeKanbanColumn);
  const cardsByColumn = new Map<string, KanbanCard[]>();

  for (const card of cards) {
    const normalizedCard = normalizeKanbanCard({
      ...card,
      tracked_seconds: trackedSecondsByCard.get(card.id),
    });
    const columnCards = cardsByColumn.get(normalizedCard.column_id) ?? [];
    columnCards.push(normalizedCard);
    cardsByColumn.set(normalizedCard.column_id, columnCards);
  }

  return normalizedColumns.map((column) => ({
    ...column,
    cards: cardsByColumn.get(column.id) ?? [],
  }));
};
