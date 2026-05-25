import { describe, expect, it } from "vitest";

import {
  normalizeKanbanBoard,
  normalizeKanbanCard,
  normalizeKanbanColumn,
  type KanbanCardRow,
  type KanbanColumnRow,
} from "./normalize-kanban";

const timestamp = "2026-05-25T00:00:00.000Z";

const cardRow = (overrides: Partial<KanbanCardRow> = {}): KanbanCardRow => ({
  assignee_id: null,
  board_id: "board-1",
  column_id: "todo",
  created_at: timestamp,
  created_by: "user-1",
  description: null,
  id: "card-1",
  position: "1024",
  title: "Card",
  updated_at: timestamp,
  ...overrides,
});

const columnRow = (
  overrides: Partial<KanbanColumnRow> = {},
): KanbanColumnRow => ({
  board_id: "board-1",
  created_at: timestamp,
  id: "todo",
  position: "1024",
  title: "Todo",
  updated_at: timestamp,
  ...overrides,
});

describe("kanban normalizers", () => {
  it("converts card position from Supabase numeric string to number", () => {
    expect(normalizeKanbanCard(cardRow())).toMatchObject({
      id: "card-1",
      position: 1024,
    });
  });

  it("converts column position from Supabase numeric string to number", () => {
    expect(normalizeKanbanColumn(columnRow())).toMatchObject({
      id: "todo",
      position: 1024,
    });
  });

  it("groups normalized cards by column", () => {
    const result = normalizeKanbanBoard(
      [
        columnRow(),
        columnRow({
          id: "done",
          position: "2048",
        }),
      ],
      [
        cardRow({
          id: "card-1",
          position: "1024",
        }),
        cardRow({
          column_id: "done",
          id: "card-2",
          position: "2048",
        }),
      ],
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: "todo",
        position: 1024,
        cards: [
          expect.objectContaining({
            id: "card-1",
            position: 1024,
          }),
        ],
      }),
      expect.objectContaining({
        id: "done",
        position: 2048,
        cards: [
          expect.objectContaining({
            id: "card-2",
            position: 2048,
          }),
        ],
      }),
    ]);
  });
});
