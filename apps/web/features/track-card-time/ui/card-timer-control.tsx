"use client";

import { Timer, TimerOff } from "lucide-react";

import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CardTimerControls } from "@/features/track-card-time/model/use-card-timer";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { useTimer } from "../model/use-timer";

interface Props {
  cardId: string;
  disabled: boolean;
  timer: CardTimerControls;
  trackedSeconds: number;
}

export const CardTimerControl = ({
  cardId,
  disabled,
  timer,
  trackedSeconds,
}: Props) => {
  const activeTimeEntry = timer.activeTimeEntry;
  const isRunning = activeTimeEntry?.card_id === cardId;
  const isSwitching = Boolean(activeTimeEntry && !isRunning);
  const { elapsedSeconds } = useTimer({
    running: isRunning,
    startedAt: activeTimeEntry?.started_at,
  });
  const handleClick = () => {
    if (isRunning) {
      timer.stopTimer(cardId);
      return;
    }

    timer.startTimer(cardId);
  };
  const label = isRunning
    ? "Stop timer"
    : isSwitching
      ? "Switch timer"
      : "Start timer";
  const visibleSeconds = isRunning ? elapsedSeconds : trackedSeconds;

  return (
    <Button
      aria-label={label}
      className={cn(
        "h-7 w-full cursor-pointer justify-between rounded-md text-xs",
        isRunning && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
      )}
      disabled={disabled || timer.isMutating}
      onClick={handleClick}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      size="sm"
      title={
        isSwitching ? "Stop the current timer and start this card." : label
      }
      type="button"
      variant={isRunning ? "outline" : "secondary"}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isRunning ? (
          <TimerOff aria-hidden="true" className="size-3.5" />
        ) : (
          <Timer aria-hidden="true" className="size-3.5" />
        )}
        <span className="truncate">{label}</span>
      </span>
      {visibleSeconds > 0 ? (
        <span className="font-mono text-[0.7rem]">
          {formatTimerDuration(visibleSeconds)}
        </span>
      ) : null}
    </Button>
  );
};
