export interface CartItemDto {
  ticketTypeId: number;
  ticketTypeName?: string;
  eventName?: string;
  zoneName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialOfferId?: number;
  specialOfferName?: string;
  discountAmount: number;
}

export interface AddToCartDto {
  ticketTypeId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  ticketTypeId: number;
  quantity: number;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalItems: number;
}