import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { createKanbanColumn } from "../actions/create-kanban-column";

type CreateKanbanColumnFormProps = {
  boardId: string;
};

export function CreateKanbanColumnForm({
  boardId,
}: CreateKanbanColumnFormProps) {
  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      <form
        action={createKanbanColumn}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input name="boardId" type="hidden" value={boardId} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Column title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="title"
            placeholder="Next up"
            required
            type="text"
          />
        </label>
        <Button type="submit">
          <Plus aria-hidden="true" data-icon="inline-start" />
          Add column
        </Button>
      </form>
    </section>
  );
}
