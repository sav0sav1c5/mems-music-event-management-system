import apiService from '../../../shared/services/apiService';
import type { PerformerInfoDto } from '../../types/api/performer';

const API_BASE_URL = 'https://localhost:7001/api';

export class PerformersService { // Promenjeno ime klase (capital P)
  public static readonly BASE_URL = `${API_BASE_URL}/performer`;
  
  static async getFeaturedPerformers(): Promise<PerformerInfoDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/featured`);
    return response.data;
  }

  static async getPerformerDetails(id: number): Promise<PerformerInfoDto> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async searchPerformers(keyword?: string, genre?: string): Promise<PerformerInfoDto[]> {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (genre) params.append('genre', genre);

    const response = await apiService.get(`${this.BASE_URL}/search?${params.toString()}`);
    return response.data;
  }
}