export interface Venue {
  venueId: number;
  name: string;
  description: string;
  city: string;
  address: string;
  capacity: number;
  venueType: string; //VenueType
}

export interface CreateVenueDto { //?
  name: string;
  address?: string;
  city?: string;
  state?: string;
  capacity: number;
  amenities?: string[];
  isActive?: boolean;
}

const API_BASE_URL = 'https://localhost:7050/api/Venue';

export const venueService = {
  // Get all venues
  getAllVenues: async (): Promise<Venue[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get venue by ID
  getVenueById: async (id: number): Promise<Venue> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Venue not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new venue
  createVenue: async (venue: CreateVenueDto): Promise<Venue> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venue),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update venue
  updateVenue: async (id: number, venue: Venue): Promise<Venue> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venue),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Venue not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete venue
  deleteVenue: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Venue not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};