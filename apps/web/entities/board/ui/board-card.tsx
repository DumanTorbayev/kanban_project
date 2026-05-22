import Link from "next/link";

import { type BoardListItem } from "../model/types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

interface Props {
  board: BoardListItem;
}

export const BoardCard = ({ board }: Props) => (
  <Link
    className="rounded-md border p-4 transition-colors hover:bg-muted/50"
    href={"/boards/" + board.id}
  >
    <h3 className="truncate text-sm font-medium">{board.title}</h3>
    <p className="mt-2 text-xs text-muted-foreground">
      Created {dateFormatter.format(new Date(board.created_at))}
    </p>
  </Link>
);
