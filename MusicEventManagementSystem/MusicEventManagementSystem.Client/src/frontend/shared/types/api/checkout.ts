import type { PaymentMethod } from '../../../ticket-sales/types/enums/TicketSales';
import type { CartItemDto } from './cart';
import type { OrderTicketDto } from './order';

export interface BillingInfoDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface PaymentInfoDto {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface CheckoutRequestDto {
  applicationUserId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  cartItems: CartItemDto[];
  // billingInfo: BillingInfoDto;
  // paymentInfo: PaymentInfoDto;
}

export interface CheckoutResponseDto {
  orderId: number;
  success: boolean;
  message?: string;
  orderNumber?: string;
  totalAmount?: number;
  orderDate?: string;
  status?: string;
  tickets?: OrderTicketDto[];
}

export interface CheckoutFormData {
  paymentMethod: PaymentMethod;
  promoCode?: string;
  // Ovo je samo za prikaz u formi:
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}