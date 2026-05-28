const DATETIME_LOCAL_LENGTH = 16;

export const toDateTimeLocalValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, DATETIME_LOCAL_LENGTH);
};

export const fromDateTimeLocalValue = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value + ":00.000Z");

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

export const getDurationSeconds = (startedAt: string, stoppedAt: string) => {
  const startedAtTime = Date.parse(startedAt);
  const stoppedAtTime = Date.parse(stoppedAt);

  if (!Number.isFinite(startedAtTime) || !Number.isFinite(stoppedAtTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((stoppedAtTime - startedAtTime) / 1000));
};
