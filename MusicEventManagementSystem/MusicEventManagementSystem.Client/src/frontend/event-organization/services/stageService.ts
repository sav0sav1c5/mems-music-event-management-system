export interface Stage { //?
  id: number;
  name: string;
  description?: string;
  capacity: number;
  technicalSpecs?: string;
  location?: string;
  isActive: boolean;
}

export interface CreateStageDto { //?
  name: string;
  description?: string;
  capacity: number;
  technicalSpecs?: string;
  location?: string;
  isActive?: boolean;
}

const API_BASE_URL = 'https://localhost:7050/api/Stage';

export const stageService = {
  // Get all stages
  getAllStages: async (): Promise<Stage[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Alias for getAllStages (for compatibility)
  getStages: async (): Promise<Stage[]> => {
    return stageService.getAllStages();
  },

  // Get stage by ID
  getStageById: async (id: number): Promise<Stage> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Stage not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new stage
  createStage: async (stage: CreateStageDto): Promise<Stage> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stage),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update stage
  updateStage: async (id: number, stage: Stage): Promise<Stage> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stage),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Stage not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete stage
  deleteStage: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Stage not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};