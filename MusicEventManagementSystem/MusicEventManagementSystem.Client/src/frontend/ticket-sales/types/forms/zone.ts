import { ZonePosition } from '../enums/ticketSales';

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