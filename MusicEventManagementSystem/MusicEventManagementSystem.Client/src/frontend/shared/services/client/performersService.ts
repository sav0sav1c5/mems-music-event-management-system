import type { PerformerInfoDto } from '../../types/api/performer';

const API_BASE_URL = 'http://localhost:7001/api';

export class performersService {
  public static readonly BASE_URL = `${API_BASE_URL}/performers`;
  
  static async getFeaturedPerformers(): Promise<PerformerInfoDto[]> {
    const response = await fetch(`${this.BASE_URL}/featured`);
    if (!response.ok) throw new Error(`Failed to get featured performers: ${response.statusText}`);
    return response.json();
  }

  static async getPerformerDetails(id: number): Promise<PerformerInfoDto> {
    const response = await fetch(`${this.BASE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to get performer details: ${response.statusText}`);
    return response.json();
  }

  static async searchPerformers(keyword?: string, genre?: string): Promise<PerformerInfoDto[]> {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (genre) params.append('genre', genre);

    const response = await fetch(`${this.BASE_URL}/search?${params.toString()}`);
    if (!response.ok) throw new Error(`Failed to search performers: ${response.statusText}`);
    return response.json();
  }
}