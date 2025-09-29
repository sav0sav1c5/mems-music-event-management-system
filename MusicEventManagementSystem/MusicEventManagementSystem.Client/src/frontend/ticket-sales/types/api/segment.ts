import { SegmentType } from '../enums/TicketSales';

export interface SegmentResponse {
  segmentId: number;
  name?: string;
  description?: string;
  capacity: number;
  segmentType: SegmentType;
  venueId: number;
  zoneIds?: number[];
}
