import apiService from '../../../shared/services/apiService';
import type { ClientEventDto } from '../../types/api/event';
import type { EventDetailsDto } from '../../types/api/event';

const API_BASE_URL = 'https://localhost:7001/api';

export class EventsService {
  public static readonly BASE_URL = `${API_BASE_URL}/events`;

  static async getUpcomingEvents(): Promise<ClientEventDto[]> {
    const response = await apiService.get(`${this.BASE_URL}`);
    return response.data;
  }

  static async getEventDetails(id: number): Promise<EventDetailsDto> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async searchEvents(
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ClientEventDto[]> {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await apiService.get(`${this.BASE_URL}/search?${params.toString()}`);
    return response.data;
  }

  static async getFeaturedEvents(): Promise<ClientEventDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/featured`);
    return response.data;
  }

  static async getEventsByPerformer(performerId: number): Promise<ClientEventDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/performer/${performerId}`);
    return response.data;
  }

  static async getEventsByCity(city: string): Promise<ClientEventDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
    return response.data;
  }
}