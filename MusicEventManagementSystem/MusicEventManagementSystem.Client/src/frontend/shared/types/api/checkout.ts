import type { PaymentMethod } from '../../../ticket-sales/types/enums/TicketSales';
import type { OrderTicketDto } from './order';

export interface CheckoutRequestDto {
  applicationUserId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

export interface CheckoutResponseDto {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  orderDate: string;
  status: string;
  tickets: OrderTicketDto[];
}