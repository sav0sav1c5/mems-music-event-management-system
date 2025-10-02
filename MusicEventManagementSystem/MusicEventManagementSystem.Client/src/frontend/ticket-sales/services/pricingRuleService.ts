import type { PricingRuleResponse } from '../types/api/pricingRule';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';
//import { PricingCondition } from '../enums/ticketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export interface CalculatePriceRequest {
  basePrice: number;
  occupancyRate: number;
  isEarlyBird: boolean;
}

export class PricingRuleService {
  private static readonly BASE_URL = `${API_BASE_URL}/pricingrule`;

  // GET: api/pricingrule
  static async getAllPricingRules(): Promise<PricingRuleResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      throw new Error('Failed to fetch pricing rules');
    }
  }

  // GET: api/pricingrule/{id}
  static async getPricingRuleById(id: number): Promise<PricingRuleResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pricing Rule with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching pricing rule ${id}:`, error);
      throw error;
    }
  }

  // POST: api/pricingrule
  static async createPricingRule(createForm: PricingRuleCreateForm): Promise<PricingRuleResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      throw new Error('Failed to create pricing rule');
    }
  }

  // PUT: api/pricingrule/{id}
  static async updatePricingRule(id: number, updateForm: PricingRuleUpdateForm): Promise<PricingRuleResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateForm),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pricing Rule with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating pricing rule ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/pricingrule/{id}
  static async deletePricingRule(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pricing Rule with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting pricing rule ${id}:`, error);
      throw error;
    }
  }

  // POST: api/pricingrule/{id}/calculate-price
  static async calculatePrice(id: number, priceRequest: CalculatePriceRequest): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/calculate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceRequest),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pricing Rule with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calculating price with rule ${id}:`, error);
      throw error;
    }
  }

  // GET: api/pricingrule/active
  static async getActivePricingRules(): Promise<PricingRuleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active pricing rules:', error);
      throw new Error('Failed to fetch active pricing rules');
    }
  }

  // GET: api/pricingrule/event/{eventId}
  static async getPricingRulesByEvent(eventId: number): Promise<PricingRuleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/event/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching pricing rules for event ${eventId}:`, error);
      throw new Error('Failed to fetch pricing rules by event');
    }
  }

  // GET: api/pricingrule/ticket-type/{ticketTypeId}
  static async getPricingRulesByTicketType(ticketTypeId: number): Promise<PricingRuleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/ticket-type/${ticketTypeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching pricing rules for ticket type ${ticketTypeId}:`, error);
      throw new Error('Failed to fetch pricing rules by ticket type');
    }
  }
}
