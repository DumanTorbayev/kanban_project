"use client";

import { useState } from "react";

export const useCreateCardDialog = () => {
  const [columnId, setColumnId] = useState<string | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [open, setOpen] = useState(false);

  const openForColumn = (nextColumnId: string) => {
    setColumnId(nextColumnId);
    setDialogKey((currentKey) => currentKey + 1);
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setColumnId(null);
    }
  };

  return {
    columnId,
    dialogKey,
    handleOpenChange,
    open,
    openForColumn,
  };
};
