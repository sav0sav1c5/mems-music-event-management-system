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

