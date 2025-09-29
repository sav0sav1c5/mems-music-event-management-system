import type { PerformanceResponse } from '../types/api/performance';
import type { PerformanceCreateForm, PerformanceUpdateForm } from '../types/form/performance';

const API_BASE_URL = 'https://localhost:7021/api';

export class PerformanceService {
  private static readonly BASE_URL = `${API_BASE_URL}/performance`;

  // GET: api/performance
  static async getAllPerformances(): Promise<PerformanceResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performances:', error);
      throw new Error('Failed to fetch performances');
    }
  }

  // GET: api/performance/{id}
  static async getPerformanceById(id: number): Promise<PerformanceResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performance with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching performance ${id}:`, error);
      throw error;
    }
  }

  // POST: api/performance
  static async createPerformance(createForm: PerformanceCreateForm): Promise<PerformanceResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performerId: createForm.performerId,
          venueId: createForm.venueId,
          startTime: createForm.startTime.toISOString(),
          endTime: createForm.endTime.toISOString(),
          setupTime: createForm.setupTime,
          soundcheckTime: createForm.soundcheckTime,
          status: createForm.status
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating performance:', error);
      throw error;
    }
  }

  // PUT: api/performance/{id}
  static async updatePerformance(id: number, updateForm: PerformanceUpdateForm): Promise<PerformanceResponse> {
    try {
      const requestBody: any = { ...updateForm };
      
      if (updateForm.startTime) {
        requestBody.startTime = updateForm.startTime.toISOString();
      }
      if (updateForm.endTime) {
        requestBody.endTime = updateForm.endTime.toISOString();
      }

      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performance with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating performance ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/performance/{id}
  static async deletePerformance(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performance with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting performance ${id}:`, error);
      throw error;
    }
  }
}

export default PerformanceService;