import { describe, expect, it } from "vitest";

import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";

import { findCardLocation, moveCardInColumns } from "./dnd";

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

describe("findCardLocation", () => {
  it("returns the card and its column indexes", () => {
    const card = createCard({
      id: "card-2",
      position: 2048,
    });
    const columns = [
      createColumn({
        id: "todo",
      }),
      createColumn({
        cards: [card],
        id: "doing",
      }),
    ];

    const location = findCardLocation(columns, "card-2");

    expect(location).toMatchObject({
      card,
      cardIndex: 0,
      column: columns[1],
      columnIndex: 1,
    });
  });

  it("returns null when the card does not exist", () => {
    expect(findCardLocation([], "missing-card")).toBeNull();
  });
});

describe("moveCardInColumns", () => {
  it("moves a card before another card in the same column", () => {
    const columns = [
      createColumn({
        cards: [
          createCard({
            id: "card-1",
            position: 1024,
          }),
          createCard({
            id: "card-2",
            position: 2048,
          }),
          createCard({
            id: "card-3",
            position: 3072,
          }),
        ],
        id: "todo",
      }),
    ];

    const result = moveCardInColumns(columns, "card-3", "card-1");

    expect(result?.cardId).toBe("card-3");
    expect(result?.columnId).toBe("todo");
    expect(result?.position).toBe(512);
    expect(result?.columns[0]?.cards.map((card) => card.id)).toEqual([
      "card-3",
      "card-1",
      "card-2",
    ]);
  });

  it("moves a card one position down in the same column", () => {
    const columns = [
      createColumn({
        cards: [
          createCard({
            id: "card-1",
            position: 1024,
          }),
          createCard({
            id: "card-2",
            position: 2048,
          }),
          createCard({
            id: "card-3",
            position: 3072,
          }),
        ],
        id: "todo",
      }),
    ];

    const result = moveCardInColumns(columns, "card-1", "card-2");

    expect(result?.cardId).toBe("card-1");
    expect(result?.columnId).toBe("todo");
    expect(result?.position).toBe(2560);
    expect(result?.columns[0]?.cards.map((card) => card.id)).toEqual([
      "card-2",
      "card-1",
      "card-3",
    ]);
  });

  it("moves a card into another column before the target card", () => {
    const columns = [
      createColumn({
        cards: [
          createCard({
            id: "todo-card",
            position: 1024,
          }),
        ],
        id: "todo",
      }),
      createColumn({
        cards: [
          createCard({
            column_id: "doing",
            id: "doing-card-1",
            position: 1024,
          }),
          createCard({
            column_id: "doing",
            id: "doing-card-2",
            position: 2048,
          }),
        ],
        id: "doing",
      }),
    ];

    const result = moveCardInColumns(columns, "todo-card", "doing-card-2");

    expect(result?.columnId).toBe("doing");
    expect(result?.position).toBe(1536);
    expect(result?.columns[0]?.cards).toEqual([]);
    expect(result?.columns[1]?.cards.map((card) => card.id)).toEqual([
      "doing-card-1",
      "todo-card",
      "doing-card-2",
    ]);
    expect(result?.columns[1]?.cards[1]).toMatchObject({
      column_id: "doing",
      id: "todo-card",
      position: 1536,
    });
  });

  it("moves a card into an empty column when dropping over the column", () => {
    const columns = [
      createColumn({
        cards: [
          createCard({
            id: "todo-card",
            position: 1024,
          }),
        ],
        id: "todo",
      }),
      createColumn({
        id: "done",
      }),
    ];

    const result = moveCardInColumns(columns, "todo-card", "done");

    expect(result?.columnId).toBe("done");
    expect(result?.position).toBe(1024);
    expect(result?.columns[1]?.cards).toEqual([
      expect.objectContaining({
        column_id: "done",
        id: "todo-card",
      }),
    ]);
  });

  it("returns null when active card or drop target is missing", () => {
    const columns = [
      createColumn({
        id: "todo",
      }),
    ];

    expect(moveCardInColumns(columns, "missing-card", "todo")).toBeNull();
    expect(moveCardInColumns(columns, "card-1", "missing-target")).toBeNull();
  });

  it("does not mutate the original column references", () => {
    const originalCard = createCard({
      id: "card-1",
      position: 1024,
    });
    const columns = [
      createColumn({
        cards: [originalCard],
        id: "todo",
      }),
      createColumn({
        id: "done",
      }),
    ];

    moveCardInColumns(columns, "card-1", "done");

    expect(columns[0]?.cards).toEqual([originalCard]);
    expect(columns[1]?.cards).toEqual([]);
  });
});
