import { SegmentType } from '../enums/ticketSales';

export interface SegmentCreateForm {
  name: string;
  description?: string;
  capacity: number;
  segmentType: SegmentType;
  venueId: number;
}

export interface SegmentUpdateForm {
  name?: string;
  description?: string;
  capacity?: number;
  segmentType?: SegmentType;
  venueId?: number;
}