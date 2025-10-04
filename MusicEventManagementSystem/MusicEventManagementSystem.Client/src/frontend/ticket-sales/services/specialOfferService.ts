import apiService from '../../shared/services/apiService';
import type { SpecialOfferResponse } from '../types/api/specialOffer';
import type { SpecialOfferCreateForm, SpecialOfferUpdateForm } from '../types/forms/specialOffer';
import { OfferType } from '../types/enums/TicketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export class SpecialOfferService {
  private static readonly BASE_URL = `${API_BASE_URL}/specialoffer`;

  static async getAllSpecialOffers(): Promise<SpecialOfferResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getSpecialOfferById(id: number): Promise<SpecialOfferResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createSpecialOffer(createForm: SpecialOfferCreateForm): Promise<SpecialOfferResponse> {
    const requestBody = {
      ...createForm,
      startDate: createForm.startDate.toISOString(),
      endDate: createForm.endDate.toISOString()
    };

    const response = await apiService.post(this.BASE_URL, requestBody);
    return response.data;
  }

  static async updateSpecialOffer(id: number, updateForm: SpecialOfferUpdateForm): Promise<SpecialOfferResponse> {
    const requestBody: any = { ...updateForm };
    
    if (updateForm.startDate) {
      requestBody.startDate = updateForm.startDate.toISOString();
    }
    if (updateForm.endDate) {
      requestBody.endDate = updateForm.endDate.toISOString();
    }

    const response = await apiService.put(`${this.BASE_URL}/${id}`, requestBody);
    return response.data;
  }

  static async deleteSpecialOffer(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getActiveOffers(checkDate?: Date): Promise<SpecialOfferResponse[]> {
    const dateParam = checkDate ? `?date=${checkDate.toISOString()}` : '';
    const response = await apiService.get(`${this.BASE_URL}/active${dateParam}`);
    return response.data;
  }

  static async getByOfferType(offerType: OfferType): Promise<SpecialOfferResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/by-type/${offerType}`);
    return response.data;
  }

  static async getByDateRange(start: Date, end: Date): Promise<SpecialOfferResponse[]> {
    const response = await apiService.get(
      `${this.BASE_URL}/by-date-range?start=${start.toISOString()}&end=${end.toISOString()}`
    );
    return response.data;
  }

  static async getByTicketType(ticketTypeId: number): Promise<SpecialOfferResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/by-ticket-type/${ticketTypeId}`);
    return response.data;
  }

  static async isOfferValid(id: number, checkDate?: Date): Promise<{ specialOfferId: number; checkDate: Date; isValid: boolean }> {
    const dateParam = checkDate ? `?checkDate=${checkDate.toISOString()}` : '';
    const response = await apiService.get(`${this.BASE_URL}/${id}/is-valid${dateParam}`);
    return response.data;
  }

  static async hasActiveOfferForTicketType(
    ticketTypeId: number, 
    checkDate?: Date
  ): Promise<{ ticketTypeId: number; checkDate: Date; hasActiveOffer: boolean }> {
    const dateParam = checkDate ? `?checkDate=${checkDate.toISOString()}` : '';
    const response = await apiService.get(`${this.BASE_URL}/ticket-type/${ticketTypeId}/has-active-offer${dateParam}`);
    return response.data;
  }
}