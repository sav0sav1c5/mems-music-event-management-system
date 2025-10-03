export interface OrderDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  totalTickets: number;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  eventName?: string;
  ticketTypeName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderTicketDto {
  ticketId: number;
  uniqueCode?: string;
  qrCode?: string;
  eventName?: string;
  ticketTypeName?: string;
  zoneName?: string;
  eventStartDate: string;
  price: number;
  status: string;
}

export interface OrderDetailsDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  tickets: OrderTicketDto[];
  appliedOffers: AppliedOfferDto[];
}

export interface AppliedOfferDto {
  offerName?: string;
  description?: string;
  discountAmount: number;
}