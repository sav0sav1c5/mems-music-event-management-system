<<<<<<< HEAD
export interface Event {
  id: number; 
  name: string;
  description: string;
  interval: string;
  status?: string;
  createdById: string;
  locationId: number;
  location?: Location | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  endInterval?: string; 
}


export interface CreateEventDto {
  name: string;
  description: string;
  interval: string; 
  status?: string;
  createdById: string;
  locationId: number;
  endInterval?: string; 
}
const API_BASE_URL = 'https://localhost:7050/api/Events';

export const eventService = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  getEventById: async (id: number): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Event not found');
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  createEvent: async (event: CreateEventDto): Promise<Event> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  updateEvent: async (id: number, event: Partial<CreateEventDto>): Promise<Event> => { // Koristi partial za update
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Event not found');
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  deleteEvent: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Event not found');
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

=======
import type { EventResponse } from '../types/api/event';
import type { EventCreateForm, EventUpdateForm } from '../types/form/event';

const API_BASE_URL = 'https://localhost:7021/api';

export class EventService {
  private static readonly BASE_URL = `${API_BASE_URL}/event`;

  // GET: api/event
  static async getAllEvents(): Promise<EventResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // GET: api/event/{id}
  static async getEventById(id: number): Promise<EventResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Event with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  // POST: api/event
  static async createEvent(createForm: EventCreateForm): Promise<EventResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          startDate: createForm.startDate.toISOString(),
          endDate: createForm.endDate.toISOString(),
          status: createForm.status,
          createdById: createForm.createdById,
          locationId: createForm.locationId
        }),
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
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // PUT: api/event/{id}
  static async updateEvent(id: number, updateForm: EventUpdateForm): Promise<EventResponse> {
    try {
      const requestBody: any = { ...updateForm };
      
      if (updateForm.startDate) {
        requestBody.startDate = updateForm.startDate.toISOString();
      }
      if (updateForm.endDate) {
        requestBody.endDate = updateForm.endDate.toISOString();
      }

      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Event with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/event/{id}
  static async deleteEvent(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Event with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  }
}

export default EventService;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543
