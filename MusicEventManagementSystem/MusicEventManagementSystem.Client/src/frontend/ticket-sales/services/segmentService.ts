import type { SegmentResponse } from '../types/api/segment';
import type { SegmentCreateForm, SegmentUpdateForm } from '../types/forms/segment';
import { SegmentType } from '../types/enums/TicketSales';
import type { ZoneResponse } from '../types/api/zone';

const API_BASE_URL = 'https://localhost:7011/api';

export class SegmentService {
  private static readonly BASE_URL = `${API_BASE_URL}/segment`;

  // GET: api/segment
  static async getAllSegments(): Promise<SegmentResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching segments:', error);
      throw new Error('Failed to fetch segments');
    }
  }

  // GET: api/segment/{id}
  static async getSegmentById(id: number): Promise<SegmentResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Segment with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching segment ${id}:`, error);
      throw error;
    }
  }

  // POST: api/segment
  static async createSegment(createForm: SegmentCreateForm): Promise<SegmentResponse> {
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
      console.error('Error creating segment:', error);
      throw new Error('Failed to create segment');
    }
  }

  // PUT: api/segment/{id}
  static async updateSegment(id: number, updateForm: SegmentUpdateForm): Promise<SegmentResponse> {
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
          throw new Error(`Segment with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating segment ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/segment/{id}
  static async deleteSegment(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Segment with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting segment ${id}:`, error);
      throw error;
    }
  }

  // GET: api/segment/venue/{venueId}
  static async getSegmentsByVenueId(venueId: number): Promise<SegmentResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/venue/${venueId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching segments for venue ${venueId}:`, error);
      throw new Error('Failed to fetch segments by venue');
    }
  }

  // GET: api/segment/type/{segmentType}
  static async getSegmentsByType(segmentType: SegmentType): Promise<SegmentResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/type/${segmentType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching segments by type ${segmentType}:`, error);
      throw new Error('Failed to fetch segments by type');
    }
  }

  // GET: api/segment/{id}/zones
  static async getZonesBySegmentId(id: number): Promise<ZoneResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/zones`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Segment with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching zones for segment ${id}:`, error);
      throw error;
    }
  }

  // GET: api/segment/{id}/capacity
  static async calculateSegmentTotalCapacity(id: number): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/capacity`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Segment with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error calculating capacity for segment ${id}:`, error);
      throw error;
    }
  }
}

export default SegmentService;