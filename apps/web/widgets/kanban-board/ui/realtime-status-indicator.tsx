"use client";

import { LoaderCircle, TriangleAlert, Wifi, WifiOff } from "lucide-react";

import { type KanbanRealtimeStatus } from "../model/use-kanban-board-realtime";
import { cn } from "@workspace/ui/lib/utils";

interface Props {
  status: KanbanRealtimeStatus;
}

const statusContent = {
  connecting: {
    className: "border-border bg-muted text-muted-foreground",
    icon: LoaderCircle,
    iconClassName: "animate-spin",
    label: "Connecting",
  },
  connected: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
    icon: Wifi,
    iconClassName: "",
    label: "Live",
  },
  disconnected: {
    className: "border-muted-foreground/30 bg-muted text-muted-foreground",
    icon: WifiOff,
    iconClassName: "",
    label: "Offline",
  },
  error: {
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: TriangleAlert,
    iconClassName: "",
    label: "Realtime error",
  },
  reconnecting: {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
    icon: LoaderCircle,
    iconClassName: "animate-spin",
    label: "Reconnecting",
  },
} satisfies Record<
  KanbanRealtimeStatus,
  {
    className: string;
    icon: typeof Wifi;
    iconClassName: string;
    label: string;
  }
>;

export const RealtimeStatusIndicator = ({ status }: Props) => {
  const content = statusContent[status];
  const Icon = content.icon;

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium",
        content.className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-4", content.iconClassName)}
      />
      <span>{content.label}</span>
    </div>
  );
};
