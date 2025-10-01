export interface WorkTask {
  id: number;
  performanceId: number;
  performance?: Performance;
  name: string;
  description: string;
  status?: string; //WorkTaskStatus
  start: Date; //DateTime
  end: Date; //DateTime
}

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

export interface CreateWorkTaskDto { //?
  performanceId: number;
  name: string;
  description: string;
  status?: string;
  start: string;
  end: string;
}

const API_BASE_URL = 'https://localhost:7050/api/WorkTask';

export const workTaskService = {
  // Get all work tasks
  getAllWorkTasks: async (): Promise<WorkTask[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get work task by ID
  getWorkTaskById: async (id: number): Promise<WorkTask> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Work task not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Create new work task
  createWorkTask: async (workTask: CreateWorkTaskDto): Promise<WorkTask> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workTask),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Update work task
  updateWorkTask: async (id: number, workTask: WorkTask): Promise<WorkTask> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workTask),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Work task not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Delete work task
  deleteWorkTask: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Work task not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Get work tasks by performance ID
  getWorkTasksByPerformanceId: async (performanceId: number): Promise<WorkTask[]> => {
    const response = await fetch(`${API_BASE_URL}/performance/${performanceId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  // Get all performances for dropdown
  getAllPerformances: async (): Promise<Performance[]> => {
    const response = await fetch('https://localhost:7050/api/Performance');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
};