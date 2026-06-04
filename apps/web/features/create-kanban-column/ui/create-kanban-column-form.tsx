"use client";

import { Plus } from "lucide-react";

import { FormErrorMessage } from "@/shared/ui/form-error-message";
import { Button } from "@workspace/ui/components/button";

import { useCreateKanbanColumnForm } from "../model/use-create-kanban-column-form";

interface Props {
  boardId: string;
}

export const CreateKanbanColumnForm = ({ boardId }: Props) => {
  const { error, formRef, handleSubmit, isDisabled, isPending } =
    useCreateKanbanColumnForm({
      boardId,
    });
  const errorId = "create-column-error";

  return (
    <section className="rounded-lg border bg-background p-4 shadow-sm">
      {error ? (
        <FormErrorMessage className="mb-3" id={errorId}>
          {error}
        </FormErrorMessage>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Column title</span>
          <input
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled}
            name="title"
            placeholder="Next up"
            required
            type="text"
          />
        </label>
        <Button disabled={isDisabled} type="submit">
          <Plus aria-hidden="true" data-icon="inline-start" />
          {isPending ? "Adding..." : "Add column"}
        </Button>
      </form>
    </section>
  );
};
