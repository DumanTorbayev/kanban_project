import { Clock3 } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@workspace/ui/lib/utils";

import { type KanbanCard as KanbanCardModel } from "../model/types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

interface Props {
  card: KanbanCardModel;
  className?: string;
  footer?: ReactNode;
}

export const KanbanCard = ({ card, className, footer }: Props) => (
  <article
    aria-label={"Card: " + card.title}
    className={cn("rounded-md border bg-background p-3 shadow-xs", className)}
  >
    <h3 className="text-sm leading-5 font-medium">{card.title}</h3>
    {card.description ? (
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
        {card.description}
      </p>
    ) : null}
    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock3 aria-hidden="true" className="size-3.5" />
      <span>{dateFormatter.format(new Date(card.created_at))}</span>
    </div>
    {footer ? <div className="mt-3">{footer}</div> : null}
  </article>
);
