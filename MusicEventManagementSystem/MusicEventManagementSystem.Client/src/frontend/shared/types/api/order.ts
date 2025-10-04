export interface OrderDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  totalTickets: number;
  items: OrderItemDto[];
  subtotal?: number;
  discount?: number;
  serviceFee?: number;
  totalItems?: number;
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
  eventDate?: string;
  venueName?: string;
  seatNumber?: string;
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
  subtotal?: number;
  discount?: number;
  serviceFee?: number;
  billingInfo?: BillingInfoDto;
}

export interface AppliedOfferDto {
  offerName?: string;
  description?: string;
  discountAmount: number;
}

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