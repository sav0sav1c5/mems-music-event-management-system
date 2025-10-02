import { EventStatus } from '../enums/EventOrganization';

export interface EventResponse {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  createdById: string;
  locationId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  venueIds?: number[];
  ticketTypeIds?: number[];
  pricingRuleIds?: number[];
}