import type { VenueInfoDto } from './venue';
import type { TicketZoneDto } from './ticket';
import type { PerformerInfoDto } from './performer';

export interface ClientEventDto {
  id: number;
  name?: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
  locationName?: string;
  minPrice: number;
  maxPrice: number;
  totalCapacity: number;
  availableTickets: number;
  performerNames?: string[];
  venueNames?: string[];
  imageUrl?: string;
}

export interface EventDetailsDto {
  id: number;
  name?: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
  venues?: VenueInfoDto[];
  performers?: PerformerInfoDto[];
  ticketZones?: TicketZoneDto[];
}