<<<<<<< HEAD
export interface Performer {
  performerId: number;
  name: string;
  email: string;
  contact?: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string; //TimeSpan
  status: string;
}

export interface CreatePerformerDto { //?
  name: string;
  email: string;
  contact?: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string;
  status?: string;
}

const API_BASE_URL = 'https://localhost:7050/api/Performer';

export const performerService = {
  // Get all performers
  getAllPerformers: async (): Promise<Performer[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get performer by ID
  getPerformerById: async (id: number): Promise<Performer> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performer not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new performer
  createPerformer: async (performer: CreatePerformerDto): Promise<Performer> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performer),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update performer
  updatePerformer: async (id: number, performer: Performer): Promise<Performer> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performer),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performer not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete performer
  deletePerformer: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performer not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
=======
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        body: JSON.stringify(createForm),
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
        body: JSON.stringify(updateForm),
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

export default PerformerService;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543
