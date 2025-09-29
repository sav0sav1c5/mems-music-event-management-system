
export const EventStatus = {
  Planned: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4
} as const;

export const PerformanceStatus = {
  Planned: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4
} as const;

export type PerformanceStatus = typeof PerformanceStatus[keyof typeof PerformanceStatus];
export type EventStatus = typeof EventStatus[keyof typeof EventStatus];