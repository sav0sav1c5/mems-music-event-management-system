import { PaymentMethod, TransactionStatus } from '../enums/ticketSales';

export interface RecordedSaleResponse {
  recordedSaleId: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  saleDate: Date;
  transactionStatus: TransactionStatus;
  applicationUserId: string;
  ticketIds?: number[];
  specialOfferIds?: number[];
}