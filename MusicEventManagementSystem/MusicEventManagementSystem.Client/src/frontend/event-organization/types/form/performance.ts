import { PerformanceStatus } from '../enums/EventOrganization';

export interface PerformanceCreateForm {
  performerId: number;
  venueId: number;
  startTime: Date;
  endTime: Date;
  setupTime: number;
  soundcheckTime: number;
  status: PerformanceStatus;
}

export interface PerformanceUpdateForm {
  performerId?: number;
  venueId?: number;
  startTime?: Date;
  endTime?: Date;
  setupTime?: number;
  soundcheckTime?: number;
  status?: PerformanceStatus;
}