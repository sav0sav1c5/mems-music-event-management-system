import type { VenueInfoDto } from '../../types/api/venue';
import type { ClientEventDto } from '../../types/api/event';

const API_BASE_URL = 'http://localhost:7001/api';

export class venuesService {
  public static readonly BASE_URL = `${API_BASE_URL}/venues`;

  static async getVenuesByCity(city: string): Promise<VenueInfoDto[]> {
    const response = await fetch(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error(`Failed to get venues by city: ${response.statusText}`);
    return response.json();
  }

  static async getVenueDetails(id: number): Promise<VenueInfoDto> {
    const response = await fetch(`${this.BASE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to get venue details: ${response.statusText}`);
    return response.json();
  }

  static async getVenueEvents(venueId: number): Promise<ClientEventDto[]> {
    const response = await fetch(`${this.BASE_URL}/${venueId}/events`);
    if (!response.ok) throw new Error(`Failed to get venue events: ${response.statusText}`);
    return response.json();
  }
}