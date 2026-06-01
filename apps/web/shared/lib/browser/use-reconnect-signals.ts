"use client";

import { useEffect } from "react";

interface Props {
  onOffline: () => void;
  onOnline: () => void;
  onVisible: () => void;
}

export const useReconnectSignals = ({
  onOffline,
  onOnline,
  onVisible,
}: Props) => {
  useEffect(() => {
    let isActive = true;
    const handleOnline = () => onOnline();
    const handleOffline = () => onOffline();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onVisible();
      }
    };

    queueMicrotask(() => {
      if (isActive && !navigator.onLine) {
        onOffline();
      }
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onOffline, onOnline, onVisible]);
};
