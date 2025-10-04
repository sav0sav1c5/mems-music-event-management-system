import apiService from '../../shared/services/apiService';
import type { PerformanceResponse } from '../types/api/performance';
import type { PerformanceCreateForm, PerformanceUpdateForm } from '../types/form/performance';

const API_BASE_URL = 'https://localhost:7021/api';

export class PerformanceService {
  private static readonly BASE_URL = `${API_BASE_URL}/performance`;

  // GET: api/performance
  static async getAllPerformances(): Promise<PerformanceResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  // GET: api/performance/{id}
  static async getPerformanceById(id: number): Promise<PerformanceResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  // POST: api/performance
  static async createPerformance(createForm: PerformanceCreateForm): Promise<PerformanceResponse> {
    const requestBody = {
      performerId: createForm.performerId,
      venueId: createForm.venueId,
      startTime: createForm.startTime.toISOString(),
      endTime: createForm.endTime.toISOString(),
      setupTime: createForm.setupTime,
      soundcheckTime: createForm.soundcheckTime,
      status: createForm.status
    };

    const response = await apiService.post(this.BASE_URL, requestBody);
    return response.data;
  }

  // PUT: api/performance/{id}
  static async updatePerformance(id: number, updateForm: PerformanceUpdateForm): Promise<PerformanceResponse> {
    const requestBody: any = { ...updateForm };
    
    if (updateForm.startTime) {
      requestBody.startTime = updateForm.startTime.toISOString();
    }
    if (updateForm.endTime) {
      requestBody.endTime = updateForm.endTime.toISOString();
    }

    const response = await apiService.put(`${this.BASE_URL}/${id}`, requestBody);
    return response.data;
  }

  // DELETE: api/performance/{id}
  static async deletePerformance(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }
}

export default PerformanceService;