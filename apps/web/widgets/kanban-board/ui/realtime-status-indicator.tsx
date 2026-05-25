"use client";

import {
  LoaderCircle,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { type KanbanRealtimeStatus } from "../model/use-kanban-board-realtime";
import { cn } from "@workspace/ui/lib/utils";

interface Props {
  status: KanbanRealtimeStatus;
}

type StatusContent = {
  className: string;
  icon?: LucideIcon;
  indicatorClassName?: string;
  isLoading?: boolean;
  label: string;
};

const statusContent: Record<KanbanRealtimeStatus, StatusContent> = {
  connecting: {
    className: "px-1 text-muted-foreground",
    indicatorClassName: "bg-muted-foreground/70",
    isLoading: true,
    label: "Connecting",
  },
  connected: {
    className: "px-1 text-muted-foreground",
    indicatorClassName: "bg-emerald-500",
    label: "Synced",
  },
  disconnected: {
    className:
      "rounded-md border border-border bg-muted px-2 text-muted-foreground",
    icon: WifiOff,
    label: "Offline",
  },
  error: {
    className:
      "rounded-md border border-destructive/30 bg-destructive/10 px-2 text-destructive",
    icon: TriangleAlert,
    label: "Realtime error",
  },
  reconnecting: {
    className: "px-1 text-amber-700",
    indicatorClassName: "bg-amber-500",
    isLoading: true,
    label: "Reconnecting",
  },
};

export const RealtimeStatusIndicator = ({ status }: Props) => {
  const content = statusContent[status];
  const Icon = content.icon;

  return (
    <div
      aria-live="polite"
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 text-xs font-medium",
        content.className,
      )}
      role="status"
    >
      {content.isLoading ? (
        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
      ) : null}

      {!content.isLoading && Icon ? (
        <Icon aria-hidden="true" className="size-3.5" />
      ) : null}

      {!content.isLoading && !Icon ? (
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", content.indicatorClassName)}
        />
      ) : null}

      <span>{content.label}</span>
    </div>
  );
};
