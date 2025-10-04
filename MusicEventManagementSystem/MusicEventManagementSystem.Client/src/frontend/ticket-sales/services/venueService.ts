import apiService from '../../shared/services/apiService';
import type { VenueResponse } from '../types/api/venue';
import type { VenueCreateForm, VenueUpdateForm } from '../types/forms/venue';

const API_BASE_URL = 'https://localhost:7011/api';

export class VenueService {
  private static readonly BASE_URL = `${API_BASE_URL}/venue`;

  static async getAllVenues(): Promise<VenueResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getVenueById(id: number): Promise<VenueResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createVenue(createForm: VenueCreateForm): Promise<VenueResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  static async updateVenue(id: number, updateForm: VenueUpdateForm): Promise<VenueResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  static async deleteVenue(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getVenuesByCity(city: string): Promise<VenueResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
    return response.data;
  }

  static async getVenuesByCapacityRange(min: number, max: number): Promise<VenueResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/capacity?min=${min}&max=${max}`);
    return response.data;
  }

  static async getVenueSegments(id: number): Promise<any[]> {
    const response = await apiService.get(`${this.BASE_URL}/${id}/segments`);
    return response.data;
  }

  static async calculateVenueTotalCapacity(id: number): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/${id}/capacity`);
    return response.data;
  }
}

export default VenueService;