import { PaymentMethod, TransactionStatus } from '../enums/TicketSales';

export interface RecordedSaleCreateForm {
  totalAmount: number;
  paymentMethod: PaymentMethod;
  saleDate: Date;
  transactionStatus: TransactionStatus;
  applicationUserId: string;
}

export interface RecordedSaleUpdateForm {
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  saleDate?: Date;
  transactionStatus?: TransactionStatus;
}