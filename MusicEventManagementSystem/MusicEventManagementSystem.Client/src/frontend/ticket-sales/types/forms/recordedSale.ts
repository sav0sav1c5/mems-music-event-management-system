import { PaymentMethod, TransactionStatus } from '../enums/ticketSales';

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