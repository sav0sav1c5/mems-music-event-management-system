import apiService from '../../shared/services/apiService';
import type { PricingRuleResponse } from '../types/api/pricingRule';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';

const API_BASE_URL = 'https://localhost:7011/api';

export interface CalculatePriceRequest {
  basePrice: number;
  occupancyRate: number;
  isEarlyBird: boolean;
}

export class PricingRuleService {
  private static readonly BASE_URL = `${API_BASE_URL}/pricingrule`;

  static async getAllPricingRules(): Promise<PricingRuleResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getPricingRuleById(id: number): Promise<PricingRuleResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createPricingRule(createForm: PricingRuleCreateForm): Promise<PricingRuleResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  static async updatePricingRule(id: number, updateForm: PricingRuleUpdateForm): Promise<PricingRuleResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  static async deletePricingRule(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async calculatePrice(id: number, priceRequest: CalculatePriceRequest): Promise<number> {
    const response = await apiService.post(`${this.BASE_URL}/${id}/calculate-price`, priceRequest);
    return response.data;
  }

  static async getActivePricingRules(): Promise<PricingRuleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/active`);
    return response.data;
  }

  static async getPricingRulesByEvent(eventId: number): Promise<PricingRuleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/event/${eventId}`);
    return response.data;
  }

  static async getPricingRulesByTicketType(ticketTypeId: number): Promise<PricingRuleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/ticket-type/${ticketTypeId}`);
    return response.data;
  }
}