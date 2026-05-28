import { type TimeReportPeriod } from "@/entities/time-entry/model/types";

type PeriodOption = {
  label: string;
  value: TimeReportPeriod;
};

export const timeReportPeriodOptions: PeriodOption[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Today",
    value: "today",
  },
  {
    label: "This week",
    value: "week",
  },
];
