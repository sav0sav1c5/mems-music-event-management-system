export interface Performance {
  id: number;
  eventId: number;
  event?: Event;
  performerId: number;
  performer?: Performer;
  venueId: number;
  venue?: Venue;
  startTime: string; //DateTime
  endTime: string; //DateTime
  setupTime: number;
  soundcheckTime: number;
  status?: string; //PerformanceStatus
}

export interface Event {
  id: number;
  name: string;
  description: string;
  interval: Date; //DateTime
  status?: string; //EventStatus
  locationId: number;
  location?: Location;
}

export interface Location {
  id: number;
  name: string;
}

export interface Performer {
  performerId: number;
  name: string;
  email: string;
  contact?: string;
  genre: string;
}

export interface Venue {
  id: number;
  name: string;
  address?: string;
  city?: string;
  capacity: number;
}

export interface CreatePerformanceDto { //?
  eventId: number;
  performerId: number;
  venueId: number;
  startTime: string;
  endTime: string;
  setupTime: number;
  soundcheckTime: number;
  status?: string;
}

const API_BASE_URL = 'https://localhost:7050/api/Performance';

export const performanceService = {
  // Get all performances
  getAllPerformances: async (): Promise<Performance[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get performance by ID
  getPerformanceById: async (id: number): Promise<Performance> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new performance
  createPerformance: async (performance: CreatePerformanceDto): Promise<Performance> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performance),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update performance
  updatePerformance: async (id: number, performance: Performance): Promise<Performance> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performance),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete performance
  deletePerformance: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Performance not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Get performances by event ID
  getPerformancesByEventId: async (eventId: number): Promise<Performance[]> => {
    const response = await fetch(`${API_BASE_URL}/event/${eventId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get all events for dropdown
  getAllEvents: async (): Promise<Event[]> => {
    const response = await fetch('https://localhost:7050/api/Event');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get all performers for dropdown
  getAllPerformers: async (): Promise<Performer[]> => {
    const response = await fetch('https://localhost:7050/api/Performer');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get all venues for dropdown  
  getAllVenues: async (): Promise<Venue[]> => {
    const response = await fetch('https://localhost:7050/api/Venue');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
};