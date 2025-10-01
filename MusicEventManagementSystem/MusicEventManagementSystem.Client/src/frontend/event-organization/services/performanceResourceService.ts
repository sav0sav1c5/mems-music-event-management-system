export interface PerformanceResource {
  id: number;
  performanceId: number;
  resourceId: number;
  performance?: Performance;
  resource?: Resource;
  quantity: number;
  notes?: string;
}

export interface Performance {
  id: number;
  eventId: number;
  performerId: number;
  venueId: number;
  startTime: string; //DateTime
  endTime: string; //DateTime
  setupTime: number;
  soundcheckTime: number;
  status?: string; //PerformanceStatus
}

export interface Resource {
  id: number;
  name: string;
  description: string;
  resourceType?: string; //ResourceType
  isAvailable: boolean;
  notes?: string;
}

export interface CreatePerformanceResourceDto { //?
  performanceId: number;
  resourceId: number;
  quantity: number;
  notes?: string;
}

const API_BASE_URL = 'https://localhost:7050/api/PerformanceResource';

export const performanceResourceService = {
  // Get all performance resources
  getAllPerformanceResources: async (): Promise<PerformanceResource[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get performance resource by ID
  getPerformanceResourceById: async (id: number): Promise<PerformanceResource> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get performance resources by performance ID
  getPerformanceResourcesByPerformanceId: async (performanceId: number): Promise<PerformanceResource[]> => {
    const response = await fetch(`${API_BASE_URL}/performance/${performanceId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new performance resource
  createPerformanceResource: async (performanceResource: CreatePerformanceResourceDto): Promise<PerformanceResource> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performanceResource),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update performance resource
  updatePerformanceResource: async (id: number, performanceResource: PerformanceResource): Promise<PerformanceResource> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performanceResource),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete performance resource
  deletePerformanceResource: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};