"use client";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { toDateTimeLocalValue } from "../model/date-time-local";
import { useEditTimeEntryDialog } from "../model/use-edit-time-entry-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: CompletedTimeEntry;
}

export const EditTimeEntryDialog = ({
  onOpenChange,
  open,
  timeEntry,
}: Props) => {
  const { error, handleCancel, handleSubmit, isPending } =
    useEditTimeEntryDialog({
      onOpenChange,
      timeEntry,
    });

  return (
    <Modal
      description="Adjust the completed time session boundaries. Times are saved in UTC."
      onOpenChange={onOpenChange}
      open={open}
      title="Edit time entry"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Started at UTC</span>
          <input
            className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={toDateTimeLocalValue(timeEntry.started_at)}
            name="startedAt"
            required
            type="datetime-local"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Stopped at UTC</span>
          <input
            className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={toDateTimeLocalValue(timeEntry.stopped_at)}
            name="stoppedAt"
            required
            type="datetime-local"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
