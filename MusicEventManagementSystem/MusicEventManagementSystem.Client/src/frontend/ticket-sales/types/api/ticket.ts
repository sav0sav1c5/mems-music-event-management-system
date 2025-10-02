import { TicketStatus } from '../enums/TicketSales';

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