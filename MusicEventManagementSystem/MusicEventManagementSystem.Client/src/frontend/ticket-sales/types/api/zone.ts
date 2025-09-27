import { ZonePosition } from '../enums/ticketSales';

export interface ZoneResponse {
  zoneId: number;
  name?: string;
  description?: string;
  capacity: number;
  basePrice: number;
  position: ZonePosition;
  segmentId: number;
  ticketTypeIds?: number[];
}