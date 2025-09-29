import { TicketTypeStatus } from '../enums/TicketSales';

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