export interface TicketTypeInfoDto {
  ticketTypeId: number;
  name?: string;
  description?: string;
  basePrice: number;
  currentPrice: number;
  availableQuantity: number;
  status?: string;
  hasSpecialOffer: boolean;
  specialOfferDescription?: string;
  discountPercentage?: number;
}

export interface TicketZoneDto {
  zoneId: number;
  zoneName?: string;
  zoneDescription?: string;
  position?: string;
  ticketTypes?: TicketTypeInfoDto[];
}