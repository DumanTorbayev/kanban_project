"use client";

import { Button } from "@workspace/ui/components/button";

import { FormErrorMessage } from "@/shared/ui/form-error-message";

import { useCreateBoardForm } from "../model/use-create-board-form";

export const CreateBoardForm = () => {
  const { error, formRef, handleSubmit, isDisabled, isPending } =
    useCreateBoardForm();
  const errorId = "create-board-error";

  return (
    <section className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium">Create board</h2>
        <p className="text-sm text-muted-foreground">
          Start with a workspace for a product, sprint, or team.
        </p>
      </div>

      {error ? (
        <FormErrorMessage className="mb-4" id={errorId}>
          {error}
        </FormErrorMessage>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Board title</span>
          <input
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled}
            name="title"
            placeholder="Product Roadmap"
            required
            type="text"
          />
        </label>
        <Button disabled={isDisabled} type="submit">
          {isPending ? "Creating..." : "Create board"}
        </Button>
      </form>
    </section>
  );
};
