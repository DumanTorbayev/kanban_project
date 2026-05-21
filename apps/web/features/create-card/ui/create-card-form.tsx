import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { createCard } from "../actions/create-card";

type CreateCardFormProps = {
  boardId: string;
  columnId: string;
};

export function CreateCardForm({ boardId, columnId }: CreateCardFormProps) {
  return (
    <form action={createCard} className="space-y-2">
      <input name="boardId" type="hidden" value={boardId} />
      <input name="columnId" type="hidden" value={columnId} />
      <label className="block">
        <span className="sr-only">Card title</span>
        <input
          className="h-8 w-full rounded-md border bg-background px-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="title"
          placeholder="Task title"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="sr-only">Card description</span>
        <textarea
          className="min-h-16 w-full resize-none rounded-md border bg-background px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="description"
          placeholder="Description"
          rows={2}
        />
      </label>
      <Button className="w-full" size="sm" type="submit" variant="outline">
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add card
      </Button>
    </form>
  );
}
