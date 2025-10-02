import { TicketStatus } from '../enums/TicketSales';

export interface TicketCreateForm {
  uniqueCode?: string;
  qrCode?: string;
  issueDate: Date;
  finalPrice: number;
  status: TicketStatus;
  ticketTypeId: number;
  recordedSaleId?: number;
}

export interface TicketUpdateForm {
  uniqueCode?: string;
  qrCode?: string;
  issueDate?: Date;
  finalPrice?: number;
  status?: TicketStatus;
  recordedSaleId?: number;
}