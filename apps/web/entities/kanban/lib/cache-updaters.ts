import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

function sortColumns(columns: KanbanColumnWithCards[]) {
  return [...columns].sort(
    (leftColumn, rightColumn) => leftColumn.position - rightColumn.position,
  );
}

function sortCards(cards: KanbanCard[]) {
  return [...cards].sort(
    (leftCard, rightCard) => leftCard.position - rightCard.position,
  );
}

function findCard(columns: KanbanColumnWithCards[], cardId: string) {
  for (const column of columns) {
    const card = column.cards.find((currentCard) => currentCard.id === cardId);

    if (card) {
      return card;
    }
  }

  return null;
}

function preserveCardClientFields(
  columns: KanbanColumnWithCards[],
  card: KanbanCard,
) {
  const currentCard = findCard(columns, card.id);

  if (!currentCard) {
    return card;
  }

  return {
    ...card,
    tracked_seconds: Math.max(
      card.tracked_seconds,
      currentCard.tracked_seconds,
    ),
  };
}

export function addColumnToBoard(
  columns: KanbanColumnWithCards[],
  column: KanbanColumnWithCards,
) {
  return sortColumns([
    ...columns.filter((currentColumn) => currentColumn.id !== column.id),
    column,
  ]);
}

export function replaceColumnInBoard(
  columns: KanbanColumnWithCards[],
  column: KanbanColumn,
) {
  return sortColumns(
    columns.map((currentColumn) =>
      currentColumn.id === column.id
        ? {
            ...column,
            cards: currentColumn.cards,
          }
        : currentColumn,
    ),
  );
}

export function replaceColumnIdInBoard(
  columns: KanbanColumnWithCards[],
  columnId: string,
  column: KanbanColumn,
) {
  let replaced = false;
  const nextColumns = columns.flatMap((currentColumn) => {
    if (currentColumn.id === columnId) {
      replaced = true;

      return [
        {
          ...column,
          cards: currentColumn.cards,
        },
      ];
    }

    if (currentColumn.id === column.id) {
      return [];
    }

    return [currentColumn];
  });

  if (!replaced) {
    return addColumnToBoard(nextColumns, {
      ...column,
      cards: [],
    });
  }

  return sortColumns(nextColumns);
}

export function removeColumnFromBoard(
  columns: KanbanColumnWithCards[],
  columnId: string,
) {
  return columns.filter((column) => column.id !== columnId);
}

export function addCardToBoard(
  columns: KanbanColumnWithCards[],
  card: KanbanCard,
) {
  return columns.map((column) => {
    if (column.id !== card.column_id) {
      return {
        ...column,
        cards: column.cards.filter((currentCard) => currentCard.id !== card.id),
      };
    }

    return {
      ...column,
      cards: sortCards([
        ...column.cards.filter((currentCard) => currentCard.id !== card.id),
        card,
      ]),
    };
  });
}

export function replaceCardInBoard(
  columns: KanbanColumnWithCards[],
  card: KanbanCard,
) {
  return addCardToBoard(columns, preserveCardClientFields(columns, card));
}

export function replaceCardIdInBoard(
  columns: KanbanColumnWithCards[],
  cardId: string,
  card: KanbanCard,
) {
  return addCardToBoard(removeCardFromBoard(columns, cardId), card);
}

export function addTrackedSecondsToCard(
  columns: KanbanColumnWithCards[],
  cardId: string,
  trackedSeconds: number,
) {
  if (!Number.isFinite(trackedSeconds) || trackedSeconds <= 0) {
    return columns;
  }

  return columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            tracked_seconds: card.tracked_seconds + Math.floor(trackedSeconds),
          }
        : card,
    ),
  }));
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
