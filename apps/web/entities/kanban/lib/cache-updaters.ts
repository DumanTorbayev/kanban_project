import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

export function replaceColumnInBoard(
  columns: KanbanColumnWithCards[],
  column: KanbanColumn,
) {
  return columns.map((currentColumn) =>
    currentColumn.id === column.id
      ? { ...column, cards: currentColumn.cards }
      : currentColumn,
  );
}

export function removeColumnFromBoard(
  columns: KanbanColumnWithCards[],
  columnId: string,
) {
  return columns.filter((column) => column.id !== columnId);
}

export function replaceCardInBoard(
  columns: KanbanColumnWithCards[],
  card: KanbanCard,
) {
  return columns.map((column) => {
    const cardsWithoutUpdated = column.cards.filter(
      (currentCard) => currentCard.id !== card.id,
    );

    if (column.id !== card.column_id) {
      return { ...column, cards: cardsWithoutUpdated };
    }

    return {
      ...column,
      cards: [...cardsWithoutUpdated, card].sort(
        (leftCard, rightCard) => leftCard.position - rightCard.position,
      ),
    };
  });
}

export function removeCardFromBoard(
  columns: KanbanColumnWithCards[],
  cardId: string,
) {
  return columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  }));
}
