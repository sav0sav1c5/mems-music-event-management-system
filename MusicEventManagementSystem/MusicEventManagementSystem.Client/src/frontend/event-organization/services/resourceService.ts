export interface Resource {
  id: number;
  name: string;
  description: string;
  resourceType?: string; //ResourceType
  type: string; // Alias for resourceType for UI compatibility
  isAvailable: boolean;
  status?: string; // Status field for UI compatibility
  quantity: number; // Total quantity
  available: number; // Available quantity
  notes?: string;
  // Type-specific fields
  model?: string; // For Equipment
  role?: string; // For Staff  
  vehicleType?: string; // For Vehicle
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDto { //?
  name: string;
  description: string;
  resourceType?: string;
  isAvailable: boolean;
  quantity?: number;
  notes?: string;
  // Type-specific fields
  model?: string; // For Equipment
  role?: string; // For Staff  
  vehicleType?: string; // For Vehicle
}

const API_BASE_URL = 'https://localhost:7050/api/Resource';


export const resourceService = {
  // Get all resources
  getAllResources: async (): Promise<Resource[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Transform backend data to match UI expectations
    return data.map((resource: any) => ({
      ...resource,
      type: resource.resourceType || 'Equipment', // Map resourceType to type
      status: resource.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE', // Map isAvailable to status
      quantity: resource.quantity || 1, // Default quantity
      available: resource.isAvailable && resource.quantity ? resource.quantity : 0, // Available quantity
    }));
  },

  // Get resource by ID
  getResourceById: async (id: number): Promise<Resource> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resource = await response.json();
    
    // Transform backend data to match UI expectations
    return {
      ...resource,
      type: resource.resourceType || 'Equipment', // Map resourceType to type
      status: resource.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE', // Map isAvailable to status
      quantity: resource.quantity || 1, // Default quantity
      available: resource.isAvailable && resource.quantity ? resource.quantity : 0, // Available quantity
    };
  },

  // Create new resource
  createResource: async (resource: CreateResourceDto): Promise<Resource> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update resource
  updateResource: async (id: number, resource: Resource): Promise<Resource> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete resource
  deleteResource: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};