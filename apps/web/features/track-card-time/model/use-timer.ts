"use client";

import { useEffect, useState } from "react";

interface Props {
  running: boolean;
  startedAt?: string;
}

const getElapsedSeconds = (startedAt: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

export const useTimer = ({ running, startedAt }: Props) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!running || !startedAt) {
      return;
    }

    const updateElapsedSeconds = () => {
      setElapsedSeconds(getElapsedSeconds(startedAt));
    };
    const timeoutId = window.setTimeout(updateElapsedSeconds, 0);
    const intervalId = window.setInterval(updateElapsedSeconds, 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [running, startedAt]);

  return {
    elapsedSeconds: running ? elapsedSeconds : 0,
  };
};
