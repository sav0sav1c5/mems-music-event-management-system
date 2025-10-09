import apiService from '../../../shared/services/apiService';
import type { VenueInfoDto } from '../../types/api/venue';
import type { ClientEventDto } from '../../types/api/event';

const API_BASE_URL = 'https://localhost:7001/api';

export class VenuesService { // Promenjeno ime klase (capital V)
  public static readonly BASE_URL = `${API_BASE_URL}/venue`;

  static async getVenuesByCity(city: string): Promise<VenueInfoDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
    return response.data;
  }

  static async getVenueDetails(id: number): Promise<VenueInfoDto> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async getVenueEvents(venueId: number): Promise<ClientEventDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/${venueId}/events`);
    return response.data;
  }
}