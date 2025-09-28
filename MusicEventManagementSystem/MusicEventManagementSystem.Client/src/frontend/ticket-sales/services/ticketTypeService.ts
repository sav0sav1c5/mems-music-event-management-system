import type { TicketTypeResponse } from '../types/api/ticketType';
import type { TicketTypeCreateForm, TicketTypeUpdateForm } from '../types/forms/ticketType';
import { TicketTypeStatus } from '../types/enums/ticketSales';

const API_BASE_URL = 'https://localhost:7050/api';

export class TicketTypeService {
  private static readonly BASE_URL = `${API_BASE_URL}/tickettype`;

  // GET: api/tickettype
  static async getAllTicketTypes(): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      throw new Error('Failed to fetch ticket types');
    }
  }

  // GET: api/tickettype/{id}
  static async getTicketTypeById(id: number): Promise<TicketTypeResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket Type with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket type ${id}:`, error);
      throw error;
    }
  }

  // POST: api/tickettype
  static async createTicketType(createForm: TicketTypeCreateForm): Promise<TicketTypeResponse> {
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
      console.error('Error creating ticket type:', error);
      throw new Error('Failed to create ticket type');
    }
  }

  // PUT: api/tickettype/{id}
  static async updateTicketType(id: number, updateForm: TicketTypeUpdateForm): Promise<TicketTypeResponse> {
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
          throw new Error(`Ticket Type with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating ticket type ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/tickettype/{id}
  static async deleteTicketType(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket Type with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting ticket type ${id}:`, error);
      throw error;
    }
  }

  // GET: api/tickettype/zone/{zoneId}
  static async getByZoneId(zoneId: number): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/zone/${zoneId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket types for zone ${zoneId}:`, error);
      throw new Error('Failed to fetch ticket types by zone');
    }
  }

  // GET: api/tickettype/event/{eventId}
  static async getByEventId(eventId: number): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/event/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket types for event ${eventId}:`, error);
      throw new Error('Failed to fetch ticket types by event');
    }
  }

  // GET: api/tickettype/status/{status}
  static async getByStatus(status: TicketTypeStatus): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket types by status ${status}:`, error);
      throw new Error('Failed to fetch ticket types by status');
    }
  }

  // GET: api/tickettype/available
  static async getAvailableTicketTypes(): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/available`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available ticket types:', error);
      throw new Error('Failed to fetch available ticket types');
    }
  }

  // PUT: api/tickettype/{id}/quantity
  static async updateAvailableQuantity(id: number, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quantity),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket Type with ID ${id} not found or invalid quantity`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error updating quantity for ticket type ${id}:`, error);
      throw error;
    }
  }

  // GET: api/tickettype/zone/{zoneId}/event/{eventId}
  static async getByZoneAndEvent(zoneId: number, eventId: number): Promise<TicketTypeResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/zone/${zoneId}/event/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket types for zone ${zoneId} and event ${eventId}:`, error);
      throw new Error('Failed to fetch ticket types by zone and event');
    }
  }

  // GET: api/tickettype/event/{eventId}/totalquantity
  static async getTotalAvailableQuantityByEvent(eventId: number): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/event/${eventId}/totalquantity`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching total quantity for event ${eventId}:`, error);
      throw new Error('Failed to fetch total available quantity by event');
    }
  }

  // POST: api/tickettype/{id}/reserve
  static async reserveTickets(id: number, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quantity),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(`Unable to reserve ${quantity} tickets for Ticket Type ${id}. Insufficient quantity or invalid request.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error reserving tickets for ticket type ${id}:`, error);
      throw error;
    }
  }

  // POST: api/tickettype/{id}/release
  static async releaseTickets(id: number, quantity: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quantity),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(`Unable to release ${quantity} tickets for Ticket Type ${id}. Invalid request.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error releasing tickets for ticket type ${id}:`, error);
      throw error;
    }
  }
}
