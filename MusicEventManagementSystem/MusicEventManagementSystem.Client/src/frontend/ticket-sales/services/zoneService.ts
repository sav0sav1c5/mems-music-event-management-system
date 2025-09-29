import type { ZoneResponse } from '../types/api/zone';
import type { ZoneCreateForm, ZoneUpdateForm } from '../types/forms/zone';
import { ZonePosition } from '../types/enums/ticketSales';
import type { TicketTypeResponse } from '../types/api/ticketType';

const API_BASE_URL = 'https://localhost:7011/api';

export class ZoneService {
  private static readonly BASE_URL = `${API_BASE_URL}/zone`;

  // GET: api/zone
  static async getAllZones(): Promise<ZoneResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw new Error('Failed to fetch zones');
    }
  }

  // GET: api/zone/{id}
  static async getZoneById(id: number): Promise<ZoneResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Zone with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching zone ${id}:`, error);
      throw error;
    }
  }

  // POST: api/zone
  static async createZone(createForm: ZoneCreateForm): Promise<ZoneResponse> {
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
      console.error('Error creating zone:', error);
      throw new Error('Failed to create zone');
    }
  }

  // PUT: api/zone/{id}
  static async updateZone(id: number, updateForm: ZoneUpdateForm): Promise<ZoneResponse> {
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
          throw new Error(`Zone with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating zone ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/zone/{id}
  static async deleteZone(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Zone with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting zone ${id}:`, error);
      throw error;
    }
  }

  // GET: api/zone/segment/{segmentId}
  static async getZonesBySegmentId(segmentId: number): Promise<ZoneResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/segment/${segmentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching zones for segment ${segmentId}:`, error);
      throw new Error('Failed to fetch zones by segment');
    }
  }

  // GET: api/zone/price?min={min}&max={max}
  static async getZonesByPriceRange(min: number, max: number): Promise<ZoneResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/price?min=${min}&max=${max}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching zones with price range ${min}-${max}:`, error);
      throw new Error('Failed to fetch zones by price range');
    }
  }

  // GET: api/zone/position/{position}
  static async getZonesByPosition(position: ZonePosition): Promise<ZoneResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/position/${position}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching zones by position ${position}:`, error);
      throw new Error('Failed to fetch zones by position');
    }
  }

  // GET: api/zone/{id}/tickettypes
  static async getTicketTypesByZoneId(id: number): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/tickettypes`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Zone with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket types for zone ${id}:`, error);
      throw error;
    }
  }
}

export default ZoneService;