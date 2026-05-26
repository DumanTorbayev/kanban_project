import { describe, expect, it } from "vitest";

import {
  addCardToBoard,
  addTrackedSecondsToCard,
  addColumnToBoard,
  removeCardFromBoard,
  removeColumnFromBoard,
  replaceCardIdInBoard,
  replaceCardInBoard,
  replaceColumnIdInBoard,
  replaceColumnInBoard,
} from "./cache-updaters";
import {
  type KanbanCard,
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "../model/types";

const timestamp = "2026-05-22T00:00:00.000Z";

const createCard = (overrides: Partial<KanbanCard> = {}): KanbanCard => ({
  assignee_id: null,
  board_id: "board-1",
  column_id: "todo",
  created_at: timestamp,
  created_by: "user-1",
  description: null,
  id: "card-1",
  position: 1024,
  title: "Card",
  tracked_seconds: 0,
  updated_at: timestamp,
  ...overrides,
});

const createColumn = (
  overrides: Partial<KanbanColumnWithCards> = {},
): KanbanColumnWithCards => ({
  board_id: "board-1",
  cards: [],
  created_at: timestamp,
  id: "todo",
  position: 1024,
  title: "Todo",
  updated_at: timestamp,
  ...overrides,
});

const toColumn = (column: KanbanColumnWithCards): KanbanColumn => ({
  board_id: column.board_id,
  created_at: column.created_at,
  id: column.id,
  position: column.position,
  title: column.title,
  updated_at: column.updated_at,
});

describe("kanban cache updaters", () => {
  it("adds a column and keeps columns sorted by position", () => {
    const done = createColumn({
      id: "done",
      position: 3072,
      title: "Done",
    });
    const todo = createColumn({
      id: "todo",
      position: 1024,
      title: "Todo",
    });
    const review = createColumn({
      id: "review",
      position: 2048,
      title: "Review",
    });

    const result = addColumnToBoard([todo, done], review);

    expect(result.map((column) => column.id)).toEqual([
      "todo",
      "review",
      "done",
    ]);
  });

  it("replaces a column while preserving its cards", () => {
    const card = createCard({
      id: "card-1",
      column_id: "todo",
    });
    const todo = createColumn({
      cards: [card],
      id: "todo",
      title: "Todo",
    });
    const updatedColumn = toColumn({
      ...todo,
      title: "Backlog",
      updated_at: "2026-05-22T01:00:00.000Z",
    });

    const result = replaceColumnInBoard([todo], updatedColumn);

    expect(result[0]).toMatchObject({
      id: "todo",
      title: "Backlog",
    });
    expect(result[0]?.cards).toEqual([card]);
  });

  it("replaces an optimistic column id with the persisted column id", () => {
    const optimisticColumn = createColumn({
      id: "optimistic-column-1",
      position: 2048,
      title: "Review",
    });
    const persistedColumn = toColumn({
      ...optimisticColumn,
      id: "review",
    });

    const result = replaceColumnIdInBoard(
      [optimisticColumn],
      "optimistic-column-1",
      persistedColumn,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "review",
      title: "Review",
    });
  });

  it("deduplicates a column when the persisted record arrives before server success", () => {
    const optimisticColumn = createColumn({
      id: "optimistic-column-1",
      position: 2048,
      title: "Review",
    });
    const persistedColumn = createColumn({
      id: "review",
      position: 2048,
      title: "Review",
    });

    const result = replaceColumnIdInBoard(
      [optimisticColumn, persistedColumn],
      "optimistic-column-1",
      toColumn(persistedColumn),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("review");
  });

  it("removes a column from the board", () => {
    const todo = createColumn({
      id: "todo",
    });
    const done = createColumn({
      id: "done",
    });

    expect(removeColumnFromBoard([todo, done], "todo")).toEqual([done]);
  });

  it("adds a card to the target column and sorts cards by position", () => {
    const todo = createColumn({
      cards: [
        createCard({
          id: "card-2",
          position: 2048,
        }),
        createCard({
          id: "card-1",
          position: 1024,
        }),
      ],
      id: "todo",
    });
    const card = createCard({
      id: "card-3",
      position: 1536,
    });

    const result = addCardToBoard([todo], card);

    expect(result[0]?.cards.map((item) => item.id)).toEqual([
      "card-1",
      "card-3",
      "card-2",
    ]);
  });

  it("moves an existing card between columns when replacing it", () => {
    const movingCard = createCard({
      id: "card-1",
      column_id: "todo",
    });
    const todo = createColumn({
      cards: [movingCard],
      id: "todo",
    });
    const done = createColumn({
      id: "done",
    });
    const updatedCard = createCard({
      ...movingCard,
      column_id: "done",
      position: 1024,
    });

    const result = replaceCardInBoard([todo, done], updatedCard);

    expect(result.find((column) => column.id === "todo")?.cards).toEqual([]);
    expect(result.find((column) => column.id === "done")?.cards).toEqual([
      updatedCard,
    ]);
  });

  it("replaces an optimistic card id with the persisted card id", () => {
    const optimisticCard = createCard({
      id: "optimistic-card-1",
    });
    const todo = createColumn({
      cards: [optimisticCard],
      id: "todo",
    });
    const persistedCard = createCard({
      id: "card-1",
    });

    const result = replaceCardIdInBoard(
      [todo],
      "optimistic-card-1",
      persistedCard,
    );

    expect(result[0]?.cards).toEqual([persistedCard]);
  });

  it("preserves tracked seconds when replacing a card from a server payload", () => {
    const currentCard = createCard({
      id: "card-1",
      tracked_seconds: 120,
    });
    const todo = createColumn({
      cards: [currentCard],
      id: "todo",
    });
    const updatedCard = createCard({
      id: "card-1",
      title: "Updated card",
      tracked_seconds: 0,
    });

    const result = replaceCardInBoard([todo], updatedCard);

    expect(result[0]?.cards[0]).toMatchObject({
      id: "card-1",
      title: "Updated card",
      tracked_seconds: 120,
    });
  });

  it("adds tracked seconds to a card", () => {
    const todo = createColumn({
      cards: [
        createCard({
          id: "card-1",
          tracked_seconds: 30,
        }),
      ],
      id: "todo",
    });

    const result = addTrackedSecondsToCard([todo], "card-1", 45);

    expect(result[0]?.cards[0]?.tracked_seconds).toBe(75);
  });

  it("removes a card from every column", () => {
    const todo = createColumn({
      cards: [
        createCard({
          id: "card-1",
        }),
      ],
      id: "todo",
    });
    const done = createColumn({
      cards: [
        createCard({
          id: "card-2",
          column_id: "done",
        }),
      ],
      id: "done",
    });

    const result = removeCardFromBoard([todo, done], "card-1");

    expect(result.find((column) => column.id === "todo")?.cards).toEqual([]);
    expect(result.find((column) => column.id === "done")?.cards).toEqual(
      done.cards,
    );
  });
});
