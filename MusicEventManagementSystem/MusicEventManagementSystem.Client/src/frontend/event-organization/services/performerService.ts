import type { PerformerResponse } from '../types/api/performer';
import type { PerformerCreateForm, PerformerUpdateForm } from '../types/form/performer';

const API_BASE_URL = 'https://localhost:7021/api';

export class PerformerService {
  private static readonly BASE_URL = `${API_BASE_URL}/performer`;

  // GET: api/performer
  static async getAllPerformers(): Promise<PerformerResponse[]> {
    try {
      const response = await fetch(this.BASE_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Dodaj auth header
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performers:', error);
      throw error;
    }
  }

  // GET: api/performer/{id}
  static async getPerformerById(id: number): Promise<PerformerResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performer with ID ${id} not found`);
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching performer ${id}:`, error);
      throw error;
    }
  }

  // POST: api/performer
  static async createPerformer(createForm: PerformerCreateForm): Promise<PerformerResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...createForm,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating performer:', error);
      throw error;
    }
  }

  // PUT: api/performer/{id}
  static async updatePerformer(id: number, updateForm: PerformerUpdateForm): Promise<PerformerResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...updateForm,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performer with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating performer ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/performer/{id}
  static async deletePerformer(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Performer with ID ${id} not found`);
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting performer ${id}:`, error);
      throw error;
    }
  }
}
