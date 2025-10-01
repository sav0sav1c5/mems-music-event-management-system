export interface CustomField { //for hardcoding
  id: number;
  name: string;
  type: string;
  isRequired: boolean;
}

export interface ResourceType { //for hardcoding
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateResourceTypeDto { //?
  name: string;
  description?: string;
  customFields: {
    name: string;
    type: string;
    isRequired: boolean;
  }[];
  isActive?: boolean;
}

const API_BASE_URL = 'https://localhost:7050/api/resource-types';
// Mock data for development/fallback
const mockResourceTypes: ResourceType[] = [
  {
    id: 1,
    name: 'Audio Equipment',
    description: 'Sound systems, microphones, speakers',
    isActive: true,
    customFields: [
      { id: 1, name: 'Brand', type: 'TEXT', isRequired: true },
      { id: 2, name: 'Power Requirements', type: 'SELECT', isRequired: true },
      { id: 3, name: 'Purchase Date', type: 'DATE', isRequired: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Stage Crew',
    description: 'Technical staff for event support',
    isActive: true,
    customFields: [
      { id: 4, name: 'Skill Level', type: 'SELECT', isRequired: true },
      { id: 5, name: 'Years of Experience', type: 'NUMBER', isRequired: false },
      { id: 6, name: 'Available for Overtime', type: 'BOOLEAN', isRequired: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const resourceTypeService = {
  // Get all resource types
  getAllResourceTypes: async (): Promise<ResourceType[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Resource types endpoint not found, using mock data');
          return mockResourceTypes;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch resource types, using mock data:', error);
      return mockResourceTypes;
    }
  },

  // Get resource type by ID
  getResourceTypeById: async (id: number): Promise<ResourceType> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Try to find in mock data
          const mockType = mockResourceTypes.find(type => type.id === id);
          if (mockType) {
            console.warn('Resource types endpoint not found, returning mock resource type');
            return mockType;
          }
          throw new Error('Resource type not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        const mockType = mockResourceTypes.find(type => type.id === id);
        if (mockType) {
          console.warn('Failed to fetch resource type, returning mock data:', error);
          return mockType;
        }
        throw new Error('Resource type not found');
      }
      throw error;
    }
  },

  // Create new resource type
  createResourceType: async (resourceType: CreateResourceTypeDto): Promise<ResourceType> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceType),
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Mock creation - return a new resource type with generated ID
          const newResourceType: ResourceType = {
            id: Date.now(), // Simple ID generation for mock
            name: resourceType.name,
            description: resourceType.description,
            isActive: resourceType.isActive ?? true,
            customFields: resourceType.customFields.map((field, index) => ({
              id: Date.now() + index,
              name: field.name,
              type: field.type,
              isRequired: field.isRequired
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.warn('Resource types endpoint not found, returning mock created resource type');
          return newResourceType;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        // Network error - return mock data
        const newResourceType: ResourceType = {
          id: Date.now(),
          name: resourceType.name,
          description: resourceType.description,
          isActive: resourceType.isActive ?? true,
          customFields: resourceType.customFields.map((field, index) => ({
            id: Date.now() + index,
            name: field.name,
            type: field.type,
            isRequired: field.isRequired
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.warn('Failed to create resource type, returning mock created resource type:', error);
        return newResourceType;
      }
      throw error;
    }
  },

  // Update resource type
  updateResourceType: async (id: number, resourceType: ResourceType): Promise<ResourceType> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceType),
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Resource types endpoint not found, returning mock updated resource type');
          return { ...resourceType, updatedAt: new Date().toISOString() };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('Failed to update resource type, returning mock updated resource type:', error);
        return { ...resourceType, updatedAt: new Date().toISOString() };
      }
      throw error;
    }
  },

  // Delete resource type
  deleteResourceType: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Resource types endpoint not found, mock deletion successful');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('Failed to delete resource type, mock deletion successful:', error);
        return;
      }
      throw error;
    }
  },
};