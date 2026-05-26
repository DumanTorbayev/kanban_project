const padTimePart = (value: number) => value.toString().padStart(2, "0");

export const formatTimerDuration = (durationSeconds: number) => {
  const normalizedSeconds = Math.max(0, Math.floor(durationSeconds));
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  const seconds = normalizedSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padTimePart(minutes)}:${padTimePart(seconds)}`;
  }

  return `${padTimePart(minutes)}:${padTimePart(seconds)}`;
};
