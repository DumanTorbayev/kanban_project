const padDatePart = (value: number) => value.toString().padStart(2, "0");

export const formatTimeReportDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return [
    date.getUTCFullYear(),
    "-",
    padDatePart(date.getUTCMonth() + 1),
    "-",
    padDatePart(date.getUTCDate()),
    " ",
    padDatePart(date.getUTCHours()),
    ":",
    padDatePart(date.getUTCMinutes()),
    ":",
    padDatePart(date.getUTCSeconds()),
  ].join("");
};

export const getDateFileStamp = (date = new Date()) => {
  if (Number.isNaN(date.getTime())) {
    return "unknown-date";
  }

  return date.toISOString().slice(0, 10);
};
