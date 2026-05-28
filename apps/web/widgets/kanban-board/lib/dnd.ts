import { getPositionBetween } from "@/entities/kanban/lib/position";
import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";

type CardLocation = {
  card: KanbanCard;
  cardIndex: number;
  column: KanbanColumnWithCards;
  columnIndex: number;
};

type MoveCardResult = {
  columns: KanbanColumnWithCards[];
  cardId: string;
  columnId: string;
  position: number;
};

export function findCardLocation(
  columns: KanbanColumnWithCards[],
  cardId: string,
): CardLocation | null {
  for (const [columnIndex, column] of columns.entries()) {
    const cardIndex = column.cards.findIndex((card) => card.id === cardId);

    if (cardIndex >= 0) {
      const card = column.cards[cardIndex];

      if (!card) {
        continue;
      }

      return {
        card,
        cardIndex,
        column,
        columnIndex,
      };
    }
  }

  return null;
}

export function moveCardInColumns(
  columns: KanbanColumnWithCards[],
  activeCardId: string,
  overId: string,
): MoveCardResult | null {
  const activeLocation = findCardLocation(columns, activeCardId);

  if (!activeLocation) {
    return null;
  }

  const overColumnIndex = columns.findIndex((column) => column.id === overId);
  const overCardLocation =
    overColumnIndex >= 0 ? null : findCardLocation(columns, overId);
  const targetColumnIndex =
    overColumnIndex >= 0 ? overColumnIndex : overCardLocation?.columnIndex;

  if (targetColumnIndex === undefined || targetColumnIndex < 0) {
    return null;
  }

  const nextColumns = columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }));
  const sourceColumn = nextColumns[activeLocation.columnIndex];
  const targetColumn = nextColumns[targetColumnIndex];

  if (!sourceColumn || !targetColumn) {
    return null;
  }

  const [movedCard] = sourceColumn.cards.splice(activeLocation.cardIndex, 1);

  if (!movedCard) {
    return null;
  }

  let targetCardIndex = targetColumn.cards.length;

  if (overCardLocation) {
    targetCardIndex = targetColumn.cards.findIndex(
      (card) => card.id === overId,
    );

    if (targetCardIndex < 0) {
      targetCardIndex = targetColumn.cards.length;
    }

    if (
      activeLocation.columnIndex === targetColumnIndex &&
      activeLocation.cardIndex < overCardLocation.cardIndex
    ) {
      targetCardIndex += 1;
    }
  }

  const cardInTargetColumn: KanbanCard = {
    ...movedCard,
    column_id: targetColumn.id,
  };

  targetColumn.cards.splice(targetCardIndex, 0, cardInTargetColumn);

  const nextPosition = getPositionAtIndex(targetColumn.cards, targetCardIndex);
  targetColumn.cards[targetCardIndex] = {
    ...cardInTargetColumn,
    position: nextPosition,
  };

  return {
    columns: nextColumns,
    cardId: movedCard.id,
    columnId: targetColumn.id,
    position: nextPosition,
  };
}

function getPositionAtIndex(cards: KanbanCard[], index: number) {
  return getPositionBetween(
    cards[index - 1]?.position,
    cards[index + 1]?.position,
  );
}
