import { TicketStatus } from '../enums/ticketSales';

export interface TicketResponse {
  ticketId: number;
  uniqueCode?: string;
  qrCode?: string;
  issueDate: Date;
  finalPrice: number;
  status: TicketStatus;
  ticketTypeId: number;
  recordedSaleId?: number;
}