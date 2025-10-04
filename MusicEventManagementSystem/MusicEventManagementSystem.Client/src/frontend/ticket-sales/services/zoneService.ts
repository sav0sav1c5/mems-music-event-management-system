import apiService from '../../shared/services/apiService';
import type { ZoneResponse } from '../types/api/zone';
import type { ZoneCreateForm, ZoneUpdateForm } from '../types/forms/zone';
import { ZonePosition } from '../types/enums/TicketSales';
import type { TicketTypeResponse } from '../types/api/ticketType';

const API_BASE_URL = 'https://localhost:7011/api';

export class ZoneService {
  private static readonly BASE_URL = `${API_BASE_URL}/zone`;

  static async getAllZones(): Promise<ZoneResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getZoneById(id: number): Promise<ZoneResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createZone(createForm: ZoneCreateForm): Promise<ZoneResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  static async updateZone(id: number, updateForm: ZoneUpdateForm): Promise<ZoneResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  static async deleteZone(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getZonesBySegmentId(segmentId: number): Promise<ZoneResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/segment/${segmentId}`);
    return response.data;
  }

  static async getZonesByPriceRange(min: number, max: number): Promise<ZoneResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/price?min=${min}&max=${max}`);
    return response.data;
  }

  static async getZonesByPosition(position: ZonePosition): Promise<ZoneResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/position/${position}`);
    return response.data;
  }

  static async getTicketTypesByZoneId(id: number): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/${id}/tickettypes`);
    return response.data;
  }
}

export default ZoneService;