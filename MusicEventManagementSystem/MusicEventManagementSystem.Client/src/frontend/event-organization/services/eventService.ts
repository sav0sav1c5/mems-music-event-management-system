import apiService from '../../shared/services/apiService';
import type { EventResponse } from '../types/api/event';
import type { EventCreateForm, EventUpdateForm } from '../types/form/event';

const API_BASE_URL = 'https://localhost:7021/api';

export class EventService {
  private static readonly BASE_URL = `${API_BASE_URL}/event`;

  // GET: api/event
  static async getAllEvents(): Promise<EventResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  // GET: api/event/{id}
  static async getEventById(id: number): Promise<EventResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  // POST: api/event
  static async createEvent(createForm: EventCreateForm): Promise<EventResponse> {
    const requestBody = {
      name: createForm.name,
      description: createForm.description,
      startDate: createForm.startDate.toISOString(),
      endDate: createForm.endDate.toISOString(),
      status: createForm.status,
      createdById: createForm.createdById,
      locationId: createForm.locationId
    };

    const response = await apiService.post(this.BASE_URL, requestBody);
    return response.data;
  }

  // PUT: api/event/{id}
  static async updateEvent(id: number, updateForm: EventUpdateForm): Promise<EventResponse> {
    const requestBody: any = { ...updateForm };
    
    if (updateForm.startDate) {
      requestBody.startDate = updateForm.startDate.toISOString();
    }
    if (updateForm.endDate) {
      requestBody.endDate = updateForm.endDate.toISOString();
    }

    const response = await apiService.put(`${this.BASE_URL}/${id}`, requestBody);
    return response.data;
  }

  // DELETE: api/event/{id}
  static async deleteEvent(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }
}

export default EventService;