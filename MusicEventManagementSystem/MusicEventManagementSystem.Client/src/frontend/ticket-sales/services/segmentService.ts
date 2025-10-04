import apiService from '../../shared/services/apiService';
import type { SegmentResponse } from '../types/api/segment';
import type { SegmentCreateForm, SegmentUpdateForm } from '../types/forms/segment';
import { SegmentType } from '../types/enums/TicketSales';
import type { ZoneResponse } from '../types/api/zone';

const API_BASE_URL = 'https://localhost:7011/api';

export class SegmentService {
  private static readonly BASE_URL = `${API_BASE_URL}/segment`;

  static async getAllSegments(): Promise<SegmentResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getSegmentById(id: number): Promise<SegmentResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createSegment(createForm: SegmentCreateForm): Promise<SegmentResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  static async updateSegment(id: number, updateForm: SegmentUpdateForm): Promise<SegmentResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  static async deleteSegment(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getSegmentsByVenueId(venueId: number): Promise<SegmentResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/venue/${venueId}`);
    return response.data;
  }

  static async getSegmentsByType(segmentType: SegmentType): Promise<SegmentResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/type/${segmentType}`);
    return response.data;
  }

  static async getZonesBySegmentId(id: number): Promise<ZoneResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/${id}/zones`);
    return response.data;
  }

  static async calculateSegmentTotalCapacity(id: number): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/${id}/capacity`);
    return response.data;
  }
}

export default SegmentService;