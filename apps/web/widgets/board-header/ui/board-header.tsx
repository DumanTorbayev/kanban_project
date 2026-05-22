import Link from "next/link";

import { Button } from "@workspace/ui/components/button";

import { type BoardDetails } from "@/entities/board/model/types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

interface Props {
  board: BoardDetails;
}

export const BoardHeader = ({ board }: Props) => {
  return (
    <header className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
      <div className="min-w-0">
        <Button asChild size="sm" variant="ghost" className="mb-3 -ml-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <h1 className="truncate text-xl font-semibold">{board.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created {dateFormatter.format(new Date(board.created_at))}
        </p>
      </div>
    </header>
  );
};
