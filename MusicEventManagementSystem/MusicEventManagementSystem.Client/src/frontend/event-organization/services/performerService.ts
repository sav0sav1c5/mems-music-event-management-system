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