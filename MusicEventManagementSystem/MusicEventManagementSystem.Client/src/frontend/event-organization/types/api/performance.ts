import { PerformanceStatus } from '../enums/EventOrganization';

export interface PerformanceResponse {
  id: number;
  performerId: number;
  venueId: number;
  startTime: Date;
  endTime: Date;
  setupTime: number;
  soundcheckTime: number;
  status: PerformanceStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}