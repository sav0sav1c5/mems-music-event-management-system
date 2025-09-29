import { OfferType } from '../enums/TicketSales';

export interface SpecialOfferCreateForm {
  name: string;
  description?: string;
  offerType: OfferType;
  startDate: Date;
  endDate: Date;
  applicationCondition?: string;
  discountValue: number;
  ticketLimit: number;
}

export interface SpecialOfferUpdateForm {
  name?: string;
  description?: string;
  offerType?: OfferType;
  startDate?: Date;
  endDate?: Date;
  applicationCondition?: string;
  discountValue?: number;
  ticketLimit?: number;
}