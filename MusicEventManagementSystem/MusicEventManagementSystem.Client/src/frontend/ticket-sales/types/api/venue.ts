import { VenueType } from '../enums/TicketSales';

export interface VenueResponse {
  venueId: number;
  name?: string;
  description?: string;
  city?: string;
  address?: string;
  capacity: number;
  venueType: VenueType;
  eventId: number;
  segmentIds?: number[];
  performanceIds?: number[];
}
