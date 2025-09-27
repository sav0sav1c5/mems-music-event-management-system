import { TicketTypeStatus } from '../enums/ticketSales';

export interface TicketTypeCreateForm {
  name: string;
  description?: string;
  status: TicketTypeStatus;
  availableQuantity: number;
  zoneId: number;
  eventId: number;
}

export interface TicketTypeUpdateForm {
  name?: string;
  description?: string;
  status?: TicketTypeStatus;
  availableQuantity?: number;
  zoneId?: number;
  eventId?: number;
}