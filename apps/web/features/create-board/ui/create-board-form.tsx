import { Button } from "@workspace/ui/components/button";

import { createBoard } from "../actions/create-board";

type CreateBoardFormProps = {
  error?: string;
};

export function CreateBoardForm({ error }: CreateBoardFormProps) {
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

      <form action={createBoard} className="flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Board title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="title"
            type="text"
            placeholder="Product Roadmap"
            required
          />
        </label>
        <Button type="submit">Create board</Button>
      </form>
    </section>
  );
}
