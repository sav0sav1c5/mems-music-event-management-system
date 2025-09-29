import { OfferType } from '../enums/TicketSales';

export interface SpecialOfferResponse {
  specialOfferId: number;
  name?: string;
  description?: string;
  offerType: OfferType;
  startDate: Date;
  endDate: Date;
  applicationCondition?: string;
  discountValue: number;
  ticketLimit: number;
  ticketTypeIds?: number[];
  recordedSaleIds?: number[];
}