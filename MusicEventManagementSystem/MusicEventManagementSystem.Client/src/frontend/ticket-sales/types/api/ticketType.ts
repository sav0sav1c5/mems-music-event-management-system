import { TicketTypeStatus } from '../enums/ticketSales';

export interface TicketTypeResponse {
  ticketTypeId: number;
  name?: string;
  description?: string;
  status: TicketTypeStatus;
  availableQuantity: number;
  zoneId: number;
  eventId: number;
  ticketIds?: number[];
  specialOfferIds?: number[];
  pricingRuleIds?: number[];
}