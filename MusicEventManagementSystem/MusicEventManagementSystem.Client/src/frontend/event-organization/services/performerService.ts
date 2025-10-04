import apiService from '../../shared/services/apiService';
import type { PerformerResponse } from '../types/api/performer';
import type { PerformerCreateForm, PerformerUpdateForm } from '../types/form/performer';

const API_BASE_URL = 'https://localhost:7021/api';

export class PerformerService {
  private static readonly BASE_URL = `${API_BASE_URL}/performer`;

  // GET: api/performer
  static async getAllPerformers(): Promise<PerformerResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  // GET: api/performer/{id}
  static async getPerformerById(id: number): Promise<PerformerResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  // POST: api/performer
  static async createPerformer(createForm: PerformerCreateForm): Promise<PerformerResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  // PUT: api/performer/{id}
  static async updatePerformer(id: number, updateForm: PerformerUpdateForm): Promise<PerformerResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  // DELETE: api/performer/{id}
  static async deletePerformer(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }
}

export default PerformerService;