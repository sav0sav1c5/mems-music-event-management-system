import { ZonePosition } from '../enums/TicketSales';

export interface ZoneCreateForm {
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
  position: ZonePosition;
  segmentId: number;
}

export interface ZoneUpdateForm {
  name?: string;
  description?: string;
  capacity?: number;
  basePrice?: number;
  position?: ZonePosition;
  segmentId?: number;
}