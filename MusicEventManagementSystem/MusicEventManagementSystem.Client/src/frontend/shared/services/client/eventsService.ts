import type { ClientEventDto } from '../../types/api/event';
import type { EventDetailsDto } from '../../types/api/event';

const API_BASE_URL = 'http://localhost:7001/api';

export class EventsService {
  public static readonly BASE_URL = `${API_BASE_URL}/events`;

  static async getUpcomingEvents(): Promise<ClientEventDto[]> {
    const response = await fetch(`${this.BASE_URL}`);
    if (!response.ok) throw new Error(`Failed to get upcoming events: ${response.statusText}`);
    return response.json();
  }

  static async getEventDetails(id: number): Promise<EventDetailsDto> {
    const response = await fetch(`${this.BASE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to get event details: ${response.statusText}`);
    return response.json();
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

    const response = await fetch(`${this.BASE_URL}/search?${params.toString()}`);
    if (!response.ok) throw new Error(`Failed to search events: ${response.statusText}`);
    return response.json();
  }

  static async getFeaturedEvents(): Promise<ClientEventDto[]> {
    const response = await fetch(`${this.BASE_URL}/featured`);
    if (!response.ok) throw new Error(`Failed to get featured events: ${response.statusText}`);
    return response.json();
  }

  static async getEventsByPerformer(performerId: number): Promise<ClientEventDto[]> {
    const response = await fetch(`${this.BASE_URL}/performer/${performerId}`);
    if (!response.ok) throw new Error(`Failed to get events by performer: ${response.statusText}`);
    return response.json();
  }

  static async getEventsByCity(city: string): Promise<ClientEventDto[]> {
    const response = await fetch(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error(`Failed to get events by city: ${response.statusText}`);
    return response.json();
  }
}