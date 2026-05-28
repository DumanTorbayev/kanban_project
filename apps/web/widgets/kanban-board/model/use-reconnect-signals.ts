"use client";

import { useEffect } from "react";

interface Props {
  onOffline: () => void;
  onOnline: () => void;
  onVisible: () => void;
}

/**
 * Subscribes to the browser connectivity and tab-visibility signals that should
 * trigger a board resync, keeping that wiring out of the realtime hook. Reports
 * the initial offline state once after mount.
 */
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
