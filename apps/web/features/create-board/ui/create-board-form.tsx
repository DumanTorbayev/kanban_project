"use client";

import { Button } from "@workspace/ui/components/button";

import { useCreateBoardForm } from "../model/use-create-board-form";

export const CreateBoardForm = () => {
  const { error, formRef, handleSubmit, isPending } = useCreateBoardForm();

  return (
    <section className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium">Create board</h2>
        <p className="text-sm text-muted-foreground">
          Start with a workspace for a product, sprint, or team.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Board title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="title"
            placeholder="Product Roadmap"
            required
            type="text"
          />
        </label>
        <Button disabled={isPending} type="submit">
          {isPending ? "Creating..." : "Create board"}
        </Button>
      </form>
    </section>
  );
};
