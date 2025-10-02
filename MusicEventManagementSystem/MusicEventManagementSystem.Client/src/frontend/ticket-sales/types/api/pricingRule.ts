import { PricingCondition } from '../enums/TicketSales';

export interface PricingRuleResponse {
  pricingRuleId: number;
  name?: string;
  description?: string;
  minimumPrice: number;
  maximumPrice: number;
  occupancyPercentage1: number;
  occupancyPercentage2: number;
  occupancyThreshold1: number;
  occupancyThreshold2: number;
  earlyBirdPercentage: number;
  pricingCondition: PricingCondition;
  dynamicCondition?: string;
  modifier: number;
  eventIds?: number[];
  ticketTypesIds?: number[];
}

export interface CalculatePriceRequest {
  basePrice: number;
  occupancyRate: number;
  isEarlyBird: boolean;
}