import { SegmentType } from '../enums/ticketSales';

export interface SegmentResponse {
  segmentId: number;
  name?: string;
  description?: string;
  capacity: number;
  segmentType: SegmentType;
  venueId: number;
  zones?: number[];
}