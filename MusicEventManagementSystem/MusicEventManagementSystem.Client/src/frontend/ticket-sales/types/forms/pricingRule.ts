import { PricingCondition } from '../enums/TicketSales';

export interface PricingRuleCreateForm {
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
}

export interface PricingRuleUpdateForm {
  name?: string;
  description?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  occupancyPercentage1?: number;
  occupancyPercentage2?: number;
  occupancyThreshold1?: number;
  occupancyThreshold2?: number;
  earlyBirdPercentage?: number;
  pricingCondition?: PricingCondition;
  dynamicCondition?: string;
  modifier?: number;
}