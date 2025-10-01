export interface Location {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateLocationDto {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  capacity?: number;
  description?: string;
  isActive?: boolean;
}

const API_BASE_URL = 'https://localhost:7050/api/Location';

export const locationService = {
  // Get all locations
  getAllLocations: async (): Promise<Location[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Alias for getAllLocations (for compatibility)
  getLocations: async (): Promise<Location[]> => {
    return locationService.getAllLocations();
  },

  // Get location by ID
  getLocationById: async (id: number): Promise<Location> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new location
  createLocation: async (location: CreateLocationDto): Promise<Location> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update location
  updateLocation: async (id: number, location: Location): Promise<Location> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete location
  deleteLocation: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};