"use client";

import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { useCreateKanbanColumnForm } from "../model/use-create-kanban-column-form";

interface Props {
  boardId: string;
}

export const CreateKanbanColumnForm = ({ boardId }: Props) => {
  const { error, formRef, handleSubmit, isPending } = useCreateKanbanColumnForm(
    {
      boardId,
    },
  );

  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      {error ? (
        <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
        ref={formRef}
      >
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
        <Button disabled={isPending} type="submit">
          <Plus aria-hidden="true" data-icon="inline-start" />
          {isPending ? "Adding..." : "Add column"}
        </Button>
      </form>
    </section>
  );
};
