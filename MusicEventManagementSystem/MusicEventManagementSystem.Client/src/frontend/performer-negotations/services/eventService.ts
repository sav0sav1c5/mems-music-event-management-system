import { api } from '../../shared/services/apiService';

// Types matching backend Event model
export interface EventDto {
  id: number;
  name: string;
  description: string;
  interval: string;
  status: string;
  locationId?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  name: string;
  description: string;
  interval: string;
  status: string;
  locationId?: number;
  createdById: string;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  interval?: string;
  status?: string;
  locationId?: number;
  createdById?: string;
}

const API_ENDPOINT = '/Events';

export const eventService = {
  // Get all events
  getAllEvents: async (): Promise<EventDto[]> => {
    try {
      const response = await api.get<EventDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id: number): Promise<EventDto> => {
    try {
      const response = await api.get<EventDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (event: CreateEventDto): Promise<EventDto> => {
    try {
      const response = await api.post<EventDto>(API_ENDPOINT, event);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (id: number, event: UpdateEventDto): Promise<EventDto> => {
    try {
      const response = await api.put<EventDto>(`${API_ENDPOINT}/${id}`, event);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

export default eventService;