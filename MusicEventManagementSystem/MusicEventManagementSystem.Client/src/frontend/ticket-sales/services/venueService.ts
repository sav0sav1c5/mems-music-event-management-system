import type { VenueResponse } from '../types/api/venue';
import type { VenueCreateForm, VenueUpdateForm } from '../types/forms/venue';

const API_BASE_URL = 'https://localhost:7011/api';

export class VenueService {
  private static readonly BASE_URL = `${API_BASE_URL}/venue`;

  // GET: api/venue
  static async getAllVenues(): Promise<VenueResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw new Error('Failed to fetch venues');
    }
  }

  // GET: api/venue/{id}
  static async getVenueById(id: number): Promise<VenueResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Venue with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching venue ${id}:`, error);
      throw error;
    }
  }

  // POST: api/venue
  static async createVenue(createForm: VenueCreateForm): Promise<VenueResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
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
      console.error('Error creating venue:', error);
      throw new Error('Failed to create venue');
    }
  }

  // PUT: api/venue/{id}
  static async updateVenue(id: number, updateForm: VenueUpdateForm): Promise<VenueResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateForm),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Venue with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating venue ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/venue/{id}
  static async deleteVenue(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Venue with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting venue ${id}:`, error);
      throw error;
    }
  }

  // GET: api/venue/city/{city}
  static async getVenuesByCity(city: string): Promise<VenueResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/city/${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching venues in city ${city}:`, error);
      throw new Error('Failed to fetch venues by city');
    }
  }

  // GET: api/venue/capacity?min={min}&max={max}
  static async getVenuesByCapacityRange(min: number, max: number): Promise<VenueResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/capacity?min=${min}&max=${max}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching venues with capacity ${min}-${max}:`, error);
      throw new Error('Failed to fetch venues by capacity range');
    }
  }

  // GET: api/venue/{id}/segments
  static async getVenueSegments(id: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/segments`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Venue with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching segments for venue ${id}:`, error);
      throw error;
    }
  }

  // GET: api/venue/{id}/capacity
  static async calculateVenueTotalCapacity(id: number): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/capacity`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Venue with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error calculating capacity for venue ${id}:`, error);
      throw error;
    }
  }
}

export default VenueService;